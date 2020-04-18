import { IGameDocument as IGame, default as Game, IGameState, GameStateModel, IGamePlayerHand } from '@wah/lib/src/models/game';
import { IPlayer, default as Player } from '@wah/lib/src/models/player';
import cryptoRandomString from 'crypto-random-string';
import { getLogger, Logger } from 'log4js';
import { Errors, WahError } from '@wah/lib/src/errors';
import { Events, PlayerEvents, GameEvents } from '@wah/lib';
import events = require('events');
import { ICardDeck, BlackCard, WhiteCard, IWhiteCard } from '@wah/lib/src/models/card';

export class GameManager extends events.EventEmitter {

  private game: IGame;
  private gameState: IGameState;

  private LOG: Logger;
  private disconnectTimers: Map<string, ReturnType<typeof setTimeout>>;

  constructor(game: IGame, gameState: IGameState) {
    super();
    this.game = game;
    this.gameState = gameState;
    this.disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
    this.LOG = getLogger('gm-' + game.gameId);
  }

  get gameId(): string {
    return this.game.gameId;
  }

  getGame(): IGame {
    return this.game;
  }

  get host(): IPlayer | null {
    return this.game.host;
  }

  async player(playerId: string): Promise<IPlayer> {

    const player = this.game.players.find((p) => p._id.toString() === playerId.toString());
    if (!player) {
      throw new WahError(Errors.PLAYER_NOT_FOUND);
    }
    return player;

  }

  async kickPlayer(kicker: IPlayer, target: IPlayer): Promise<GameManager> {
    if (this.game.host?._id.toString() !== kicker._id.toString()) {
      this.LOG.error(`${kicker.username} tried to kick ${target.username} but they are not the host!`);
      throw new WahError(Errors.NOT_THE_HOST);
    }

    await this.removePlayer(target);
    this.emit(Events.PLAYER_KICKED, target);
    return this;
  }

  async givePlayerCards(player: IPlayer, noOfCards: number): Promise<GameManager> {
    this.player(player._id);

    const handIdx = this.gameState.playerHands.findIndex((h) => h.playerId == player._id);
    let playerHand: IGamePlayerHand;
    if (handIdx > -1) {
      playerHand = this.gameState.playerHands[handIdx];
    } else {
      playerHand = {
        cards: [],
        playerId: player._id
      };
    }
    const curHandSize = playerHand.cards.length;

    if (curHandSize + noOfCards > this.game.handSize) {
      this.LOG.warn(`${player.username} wanted ${noOfCards} but that could exceed the maximum ${this.game.handSize} allowed. I am going to truncate this request`);
      noOfCards = this.game.handSize - curHandSize;
    }

    const newCards = this.gameState.whiteCards.splice(0, noOfCards);
    playerHand.cards = playerHand.cards.concat(newCards);

    if (handIdx > -1) {
      this.gameState.playerHands.splice(handIdx, 1, playerHand);
    } else {
      this.gameState.playerHands.push(playerHand);
    }

    await this.gameState.save();

    this.emit(PlayerEvents.WHITE_CARDS, playerHand.cards);
    this.emit(GameEvents.PLAYER_HAND_COUNT, {
      playerId: player._id,
      count: playerHand.cards.length
    });

    return this;
  }

  async playerLeft(player: IPlayer): Promise<GameManager> {
    if (this.game.host?._id.toString() === player._id.toString()) {
      return this.stopGame(player);
    } else {
      const idx = this.idxForPlayer(player);
      if (idx > -1) {
        this.game.players.splice(idx, 1);
        await this.game.save();
        this.LOG.info(`${player.username} has left the game`);
        this.emit(Events.PLAYER_LEFT, player);
      }
    }
    return this;
  }

  async stopGame(stopper: IPlayer): Promise<GameManager> {
    this.LOG.warn(`Player ${stopper.username} is trying to stop game #${this.game.gameId}`);
    if (this.game.host?._id.toString() != stopper._id.toString()) {
      this.LOG.error(`Player ${stopper.username} tried to stop a game they aren't hosting. ${this.game.host?.username} is the host!`);
      throw new WahError(Errors.NOT_THE_HOST);
    }

    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      delete player.game;
      player.hand = [];
      await player.save();
    }

    await Game.findByIdAndDelete(this.game._id);

    this.LOG.warn(`Game stopped!`);
    this.emit(GameEvents.GAME_STOPPED, this.game);
    // this.game = null;
    return this;
  }

  async playerDisconnected(player: IPlayer): Promise<GameManager> {
    this.LOG.warn(`Player ${player.username} has disconnected. They have 60 seconds to sort that out or bye bye`);

    if (this.game.disconnectedPlayers.findIndex((p) => p === player._id.toString()) === -1) {
      this.game.disconnectedPlayers.push(player._id.toString());
      await this.game.save();
      this.disconnectTimers.set(player._id.toString(), setTimeout(() => {
        this.LOG.warn(`Player ${player.username}'s disconnect timer has run out`);
        this.playerLeft(player);
      }, 60 * 1000));
      this.emit(Events.PLAYER_DISCONNECTED, player);
    } else {
      this.LOG.warn(`Player ${player.username} is already flagged as disconnected!`);
    }

    return this;
  }

  async playerJoin(player: IPlayer): Promise<GameManager> {

    if (this.isPlayerJoined(player)) {
      this.LOG.warn(`${player.username} tried to join but is already part of the game`);
    } else {
      this.game.players.push(player);
      await this.game.save();
      player.game = this.game;
      await player.save();
      this.LOG.info(`${player.username} joined`);
    }
    this.emit(Events.PLAYER_JOINED, player);

    return this;
  }

  async playerIdJoin(playerId: string): Promise<GameManager> {
    const player = await Player.findById(playerId);
    if (!player) throw new WahError(Errors.PLAYER_NOT_FOUND, playerId);

    return this.playerJoin(player);
  }

  private async removePlayer(player: IPlayer): Promise<GameManager> {
    const playerIdx = this.idxForPlayer(player);
    if (playerIdx > -1) {
      this.LOG.info(`Removing ${player.username} from the game`);
      this.game.players.splice(playerIdx, 1);
      await this.game.save();
    } else {
      this.LOG.warn(`Tried to remove ${player.username} from the game but they alreay were removed`);
    }
    return this;
  }

  idxForPlayer(player: IPlayer): number {
    return this.game.players.findIndex((p) => p._id.toString() === player._id.toString());
  }

  idxForPlayerId(playerId: string): number {
    return this.game.players.findIndex((p) => p._id.toString() === playerId);
  }

  isPlayerJoined(player: IPlayer): boolean {
    return this.idxForPlayer(player) > -1;
  }

  isPlayerIdJoined(playerId: string): boolean {
    return this.idxForPlayerId(playerId) > -1;
  }
}

export async function startNewGame(host: IPlayer, title: string, decks: Array<ICardDeck>): Promise<GameManager> {
  const gameId = cryptoRandomString({ length: 7 });
  const LOG = getLogger('gm-' + gameId);

  const deckFilter = decks.map((d) => d._id);

  const blackCards = await BlackCard.where('deck').in(deckFilter).populate('deck');
  const whiteCards = await WhiteCard.where('deck').in(deckFilter).populate('deck');

  try {
    LOG.info(`Player ${host.username} is starting a game.`);

    await Game.create({
      gameId,
      host,
      players: new Array<IPlayer>(host),
      disconnectedPlayers: new Array<string>(),
      title,
      decks
    });

    const game = await Game.findOne({gameId: gameId}).populate('players').populate('decks').populate('host');

    await GameStateModel.create({
      gameId,
      whiteCards,
      blackCards,
      playerHands: new Map<IPlayer['_id'], Array<IWhiteCard>>()
    });

    const gameState = await GameStateModel.findOne({ gameId: gameId }).populate('whiteCards').populate('blackCards');

    if (game && gameState) {
      const gm = new GameManager(game, gameState);
      return gm;
    } else {
      throw new WahError(Errors.GAME_NOT_FOUND, "Failed to create the game and game state");
    }
  } catch (err) {
    LOG.error(`Failed to start a new game! Blame ${host.username}, they're the ones who tried to start this game`);
    throw new WahError(Errors.UNKNOWN, err);
  }
}