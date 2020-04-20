import { IGameDocument as IGame, Game, IGameServerState, GameServerStateModel, IGameClientState, IStatePlayerHandCount } from '@wah/lib';
import { IPlayer, Player } from '@wah/lib';
import cryptoRandomString from 'crypto-random-string';
import { getLogger, Logger } from 'log4js';
import { Errors, WahError } from '@wah/lib/src/errors';
import { Events, PlayerEvents, GameEvents, PlayerEventPayload, GameEventPayload } from '@wah/lib';
import events = require('events');
import { ICardDeck, BlackCard, WhiteCard, IWhiteCard } from '@wah/lib/src/models/card';
import { Schema } from 'mongoose';

export class GameManager extends events.EventEmitter {

  private game: IGame;
  private gameState: IGameServerState;

  private LOG: Logger;
  private disconnectTimers: Map<string, ReturnType<typeof setTimeout>>;

  private playerIdxMap: Map<string, number>;

  constructor(game: IGame, gameState: IGameServerState) {
    super();
    this.game = game;
    this.gameState = gameState;
    this.disconnectTimers = new Map();
    this.playerIdxMap = new Map();
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

  getPlayer(playerId: string | Schema.Types.ObjectId): IPlayer {
    playerId = playerId.toString();
    let idx = this.playerIdxMap.get(playerId);
    if (typeof idx === 'undefined') {
      idx = this.game.players.findIndex((p) => p._id.toString() === playerId);
      if (idx === -1) {
        throw new WahError(Errors.PLAYER_NOT_FOUND, "Player id " + playerId + " not found in game " + this.game.gameId);
      }
      this.playerIdxMap.set(playerId, idx);
    }

    return this.game.players[idx];
  }

  isHost(playerId: string | Schema.Types.ObjectId): boolean {
    return (playerId.toString() === this.game.host?._id.toString());
  }

  async addPlayer(playerId: string | Schema.Types.ObjectId): Promise<GameManager> {

    const player = await Player.findById(playerId);
    if (!player) {
      throw new WahError(Errors.PLAYER_NOT_FOUND, "Player with id " + playerId + " not found!");
    }

    if (this.game.players.findIndex((p) => p._id.toString() == playerId.toString()) > -1) {
      this.LOG.warn("Player " + player.username + " is already part of game " + this.game.gameId);
    } else {
      this.game.players.push(player);
      this.gameState.playerHands.push({ playerId: player._id, cards: []});

      await this.game.save();
      await this.gameState.save();
    }

    this.emitGameEvent(GameEvents.PLAYER_JOINED, {
      gameId: this.game.gameId,
      data: player
    });

    return this;
  }

  getPlayerHand(playerId: string | Schema.Types.ObjectId): Array<IWhiteCard> {
    const player = this.getPlayer(playerId);
    const handIdx = this.gameState.playerHands.findIndex((h) => h.playerId == player._id.toString());
    if (handIdx == -1) {
      throw new WahError(Errors.PLAYER_NOT_FOUND, "Player has no hand");
    }

    return this.gameState.playerHands[handIdx].cards;
  }

  async setPlayerHand(playerId: string | Schema.Types.ObjectId, cards: Array<IWhiteCard>): Promise<GameManager> {
    const player = this.getPlayer(playerId);
    const handIdx = this.gameState.playerHands.findIndex((h) => h.playerId == player._id.toString());
    if (handIdx == -1) {
      throw new WahError(Errors.PLAYER_NOT_FOUND, "Tried setting a player hand for a player with no hand!");
    }

    this.gameState.playerHands.splice(handIdx, 1, {
      cards,
      playerId: player._id
    });
    await this.gameState.save();

    const payload: PlayerEventPayload = {
      playerId: player._id,
      gameId: this.game.gameId,
      data: this.gameState.playerHands[handIdx].cards
    };


    this.emitPlayerEvent(PlayerEvents.WHITE_CARDS, payload);
    this.emitGameEvent(GameEvents.PLAYER_HAND_COUNT, {
      gameId: this.game.gameId,
      data: {
        playerId: player._id,
        count: this.gameState.playerHands[handIdx].cards.length
      }
    });

    return this;
  }

  async refreshClientGameState(playerId: string | Schema.Types.ObjectId): Promise<GameManager> {
    const player = this.getPlayer(playerId);
    const playerHand = this.gameState.playerHands.find((ph) => ph.playerId.toString() == player._id.toString());
    if (!playerHand) {
      throw new WahError(Errors.PLAYER_NOT_FOUND, "While refreshing game state for " + player.username + " it was found that the player has no hand");
    }

    const playerHandCounts = this.gameState.playerHands.map((ph) => {
      const hc: IStatePlayerHandCount = {
        playerId: ph.playerId,
        count: ph.cards.length
      };

      return hc;
    });


    const clientGameState: IGameClientState = {
      createdAt: this.game.createdAt,
      decks: this.game.decks,
      disconnectedPlayers: this.game.disconnectedPlayers,
      gameId: this.game.gameId,
      handSize: this.game.handSize,
      host: this.game.host,
      playerHand: playerHand.cards,
      playerHandCounts,
      players: this.game.players,
      remainingBlackCards: this.gameState.blackCards.length,
      remainingWhiteCards: this.gameState.whiteCards.length,
      rounds: this.game.rounds,
      status: this.game.status,
      title: this.game.title,
      updatedAt: this.game.updatedAt
    };

    const payload: PlayerEventPayload = {
      data: clientGameState,
      gameId: this.game.gameId,
      playerId: player._id
    };

    this.emitPlayerEvent(PlayerEvents.GAME_STATE, payload);

    return this;
  }

  async onClientStopGame(playerId: string): Promise<GameManager> {
    this.emitGameEvent(GameEvents.GAME_STOPPED, {
      gameId: this.game.gameId,
      data: null
    });

    await this.game.remove();
    await this.gameState.remove();

    return this;
  }

  async onClientJoinGame(playerId: string | Schema.Types.ObjectId): Promise<GameManager> {

    await this.addPlayer(playerId);
    const player = this.getPlayer(playerId);
    this.refreshClientGameState(player._id);

    return this;
  }

  async onClientNewWhiteCard(playerId: string | Schema.Types.ObjectId, noOfCards: number): Promise<GameManager> {
    const player = this.getPlayer(playerId);
    let playerHand = this.getPlayerHand(player._id);
    const curHandSize = playerHand.length;

    if (curHandSize + noOfCards > this.game.handSize) {
      this.LOG.warn(`${player.username} wanted ${noOfCards} but that could exceed the maximum ${this.game.handSize} allowed. I am going to truncate this request`);
      noOfCards = this.game.handSize - curHandSize;
    }

    this.LOG.debug('Giving ' + noOfCards + ' white cards to ' + player.username);

    const newCards = this.gameState.whiteCards.splice(0, noOfCards);
    playerHand = playerHand.concat(newCards);
    await this.setPlayerHand(player._id, playerHand);

    this.emitGameEvent(GameEvents.WHITE_CARDS_COUNT, {
      gameId: this.game.gameId,
      data: this.gameState.whiteCards.length
    });


    return this;
  }

  private emitGameEvent(evt: GameEvents, payload: GameEventPayload): void {
    this.emit(evt, payload);
  }

  private emitPlayerEvent(evt: PlayerEvents, payload: PlayerEventPayload): void {
    this.emit(evt, payload);
  }

  async refreshWhiteCardCount(): Promise<GameManager> {
    const payload: GameEventPayload = {
      gameId: this.game.gameId,
      data: this.gameState.whiteCards.length
    };
    this.emitGameEvent(GameEvents.WHITE_CARDS_COUNT, payload);
    return this;
  }

  async refreshBlackCardCount(): Promise<GameManager> {
    const payload: GameEventPayload = {
      gameId: this.game.gameId,
      data: this.gameState.blackCards.length
    };
    this.emitGameEvent(GameEvents.BLACK_CARDS_COUNT, payload);
    return this;
  }

  async refreshPlayerHand(playerId: string | Schema.Types.ObjectId): Promise<GameManager> {
    const player = this.getPlayer(playerId);
    const payload: PlayerEventPayload = {
      playerId: player._id,
      gameId: this.game.gameId,
      data: this.getPlayerHand(player._id)
    }
    this.emitPlayerEvent(PlayerEvents.WHITE_CARDS, payload);
    return this;
  }
}

export async function generateGameId(length: number): Promise<string> {

  return new Promise<string>((resolve, reject) => {
    const timer = setInterval(async () => {
      const gameId = cryptoRandomString({ length: length });

      const gameIdExists = await Game.count({ gameId: gameId });

      if (gameIdExists === 0) {
        clearInterval(timer);
        resolve(gameId);
      }
    }, 1000);
  });

}

export async function createNewGame(host: IPlayer, title: string, decks: Array<ICardDeck>): Promise<GameManager> {
  const gameId = await generateGameId(1);
  const LOG = getLogger('gm-' + gameId);

  LOG.info(`Player ${host.username} is starting a game.`);



  try {
    LOG.debug('Filtering decks');
    const deckFilter = decks.map((d) => d._id);

    LOG.debug('Filtering black cards');
    const blackCards = await BlackCard.where('deck').in(deckFilter).populate('deck');

    LOG.debug('Filtering white cards');
    const whiteCards = await WhiteCard.where('deck').in(deckFilter).populate('deck');

    LOG.debug('Creating game');
    await Game.create({
      gameId,
      host,
      players: new Array<IPlayer>(host),
      disconnectedPlayers: new Array<string>(),
      title,
      decks
    });

    LOG.debug('Fetching populated game');
    const game = await Game.findOne({gameId: gameId}).populate('players').populate('decks').populate('host');

    LOG.debug('Creating game state');
    await GameServerStateModel.create({
      gameId,
      whiteCards,
      blackCards,
      playerHands: [{ playerId: host._id, cards: []}]
    });

    LOG.debug('Fetching populated game state');
    const gameState = await GameServerStateModel.findOne({ gameId: gameId }).populate('whiteCards').populate('blackCards');

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