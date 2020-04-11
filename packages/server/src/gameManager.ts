import { IGame, default as Game } from '@wah/lib/src/models/game';
import { IPlayer, default as Player } from '@wah/lib/src/models/player';
import cryptoRandomString from 'crypto-random-string';
import { getLogger, Logger } from 'log4js';
import { Errors, WahError } from '@wah/lib/src/errors';
import { Events } from '@wah/lib';
import events = require('events');

export class GameManager extends events.EventEmitter {

  private game: IGame;
  private LOG: Logger;
  private disconnectTimers: Map<string, ReturnType<typeof setTimeout>>;

  private _host?: IPlayer;

  private players: Map<string, IPlayer>;

  constructor(game: IGame) {
    super();
    this.game = game;
    this.disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
    this.players = new Map<string, IPlayer>();
    this.LOG = getLogger('gm-' + game.gameId);
  }

  get gameId(): string {
    return this.game.gameId;
  }

  getGame(): IGame {
    return this.game;
  }

  get host(): IPlayer {
    return this.game.host;
  }

  async player(playerId: string): Promise<IPlayer> {

    const player = this.game.players.find((p) => p._id.toString() === playerId);
    if (!player) {
      throw new WahError(Errors.PLAYER_NOT_FOUND);
    }
    return player;

  }

  async kickPlayer(kicker: IPlayer, target: IPlayer): Promise<GameManager> {
    if (this.game.host._id.toString() !== kicker._id.toString()) {
      this.LOG.error(`${kicker.username} tried to kick ${target.username} but they are not the host!`);
      throw new WahError(Errors.NOT_THE_HOST);
    }

    await this.removePlayer(target);
    this.emit(Events.PLAYER_KICKED, target);
    return this;
  }

  async playerLeft(player: IPlayer): Promise<GameManager> {
    if (this.game.host._id.toString() === player._id.toString()) {
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
    this.LOG.warn(`Player ${stopper.username} has tried to stop game #${this.game.gameId}`);
    if (this.game.host._id.toString() != stopper._id.toString()) {
      this.LOG.error(`Player ${stopper.username} tried to stop a game they aren't hosting. ${this.game.host.username} is the host!`);
      throw new WahError(Errors.NOT_THE_HOST);
    }

    await Game.findByIdAndDelete(this.game._id);

    this.emit(Events.GAME_STOPPED, this.game);
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
      this.LOG.info(`${player.username} joined`);
    }
    this.emit(Events.PLAYER_JOINED, player);

    const disconnectedPlayer = this.disconnectTimers.get(player._id.toString());
    if (disconnectedPlayer) {
      this.LOG.info(`${player.username}'s disconnect timer has ben stopped`);
      clearTimeout(disconnectedPlayer);
    }
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

export async function startNewGame(host: IPlayer, title: string | undefined): Promise<GameManager> {
  const gameId = cryptoRandomString({ length: 7 });
  const LOG = getLogger('gm-' + gameId);
  try {
    LOG.info(`Player ${host.username} is starting a game.`);
    await Game.create({
      gameId,
      host,
      players: new Array<IPlayer>(host),
      disconnectedPlayers: new Array<string>(),
      title
    });

    const game = await Game.findOne({ gameId }).populate('host').populate('players').exec();
    if (!game) {
      throw new WahError(Errors.GAME_NOT_FOUND, `I just created a game with the id ${gameId} but I coundn't fetch it from the db`);
    }

    return new GameManager(game);
  } catch (err) {
    LOG.error(`Failed to start a new game! Blame ${host.username}, they're the ones who tried to start this game`);
    throw new WahError(Errors.UNKNOWN, err);
  }
}