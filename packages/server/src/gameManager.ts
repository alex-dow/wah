import { IGame, default as Game } from '@wah/lib/src/models/game';
import { IPlayer } from '@wah/lib/src/models';
import cryptoRandomString from 'crypto-random-string';
import { getLogger, Logger } from 'log4js';
import { Errors, WahError } from '@wah/lib/src/errors';
import { Events } from '@wah/lib';
import events = require('events');

export class GameManager extends events.EventEmitter {

  private game: IGame;
  private LOG: Logger;
  private disconnectTimers: Map<string, ReturnType<typeof setTimeout>>;

  constructor(game: IGame) {
    super();
    this.game = game;
    this.disconnectTimers = new Map<string, ReturnType<typeof setTimeout>>();
    this.LOG = getLogger('gm-' + game.gameId);
  }

  get gameId(): string {
    return this.game.gameId;
  }

  get host(): IPlayer {

    const player = this.game.players.find((p) => p._id === this.game.host);
    if (!player) {
      this.LOG.error("Trying to get host for " + this.game.gameId + ", assumed it was player with id " +  this.game.host + " but not in the list of players:", this.game.players);
      throw new WahError(Errors.PLAYER_NOT_FOUND, "Host player not found.");
    }

    return player;
  }

  async kickPlayer(kicker: IPlayer, target: IPlayer): Promise<GameManager> {
    if (this.game.host !== kicker._id) {
      this.LOG.error(`${kicker.username} tried to kick ${target.username} but they are not the host!`);
      throw new WahError(Errors.NOT_THE_HOST);
    }

    await this.removePlayer(target);
    this.emit(Events.PLAYER_KICKED, target);
    return this;
  }

  async playerLeft(player: IPlayer): Promise<GameManager> {
    if (this.game.host === player._id) {
      return this.stopGame(player);
    } else {
      const idx = this.playerIdx(player);
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
    if (this.game.host !== stopper._id) {
      throw new WahError(Errors.NOT_THE_HOST);
    }

    await Game.deleteOne(this.game);
    this.emit(Events.GAME_STOPPED, this.game);
    return this;
  }

  async playerDisconnected(player: IPlayer): Promise<GameManager> {
    this.LOG.warn(`Player ${player.username} has disconnected. They have 60 seconds to sort that out or bye bye`);

    if (this.game.disconnectedPlayers.findIndex((p) => p._id === player._id) === -1) {
      this.game.disconnectedPlayers.push(player);
      await this.game.save();
      this.disconnectTimers.set(player._id, setTimeout(() => {
        this.LOG.warn(`Player ${player.username}'s disconnect timer has run out`);
        this.playerLeft(player);
      }, 60 * 1000));
      this.emit(Events.PLAYER_DISCONNECTED);
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
      this.emit(Events.PLAYER_JOINED);
    }
    return this;
  }

  private async removePlayer(player: IPlayer): Promise<GameManager> {
    const playerIdx = this.playerIdx(player);
    if (playerIdx > -1) {
      this.LOG.info(`Removing ${player.username} from the game`);
      this.game.players.splice(playerIdx, 1);
      await this.game.save();
    } else {
      this.LOG.warn(`Tried to remove ${player.username} from the game but they alreay were removed`);
    }
    return this;
  }

  playerIdx(player: IPlayer): number {
    return this.game.players.findIndex((p) => p._id === player._id);
  }

  isPlayerJoined(player: IPlayer): boolean {
    return this.playerIdx(player) > -1;
  }
}

export async function startNewGame(host: IPlayer): Promise<GameManager> {
  const gameId = cryptoRandomString({ length: 7 });
  const game = new Game();
  game.gameId = gameId;
  game.host = host._id;
  game.players = new Array<IPlayer>(host);
  game.disconnectedPlayers = new Array<IPlayer>();

  await game.save();

  getLogger('gm-' + game.gameId).info('Game started by ' + host.username);

  return new GameManager(game);
}