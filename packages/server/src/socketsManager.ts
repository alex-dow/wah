import { Socket, Server as IOServer } from 'socket.io';
import { GameManager, startNewGame } from './gameManager';
import { Events, Errors } from '@wah/lib';
import { Player, IPlayer, Game } from '@wah/lib/src/models';
import { Logger, getLogger } from 'log4js';
import { WahError } from '@wah/lib/src/errors';

export class SocketsManager {
  private io: IOServer;

  private gameManagers: Array<GameManager>;
  private gmIdxMap: Map<string, number>;

  private sockets: Array<Socket>;
  private socketIdxMap: Map<string, number>;

  private disconnectTimers: Map<string, NodeJS.Timeout>;

  private LOG: Logger;

  constructor(io: IOServer) {
    this.io = io;
    this.io.on('connection', (...args) => this.onConnect(...args));
    this.gameManagers = new Array<GameManager>();
    this.gmIdxMap = new Map<string, number>();
    this.sockets = [];
    this.socketIdxMap = new Map();
    this.LOG = getLogger('sockmanager');
    this.disconnectTimers = new Map<string, NodeJS.Timeout>();
  }

  public async init(): Promise<SocketsManager> {

    const games = await Game.find({}).populate('players').populate('host');
    games.forEach((game) => {
      const idx = this.gameManagers.length;
      this.gameManagers.push(new GameManager(game));
      this.gmIdxMap.set(game.gameId, idx);
    });

    return this;
  }

  private bindPlayerEvents(socket: Socket): void {
    socket.on(Events.JOIN_GAME, (gameId) => this.onJoinGame(socket, gameId));
    socket.on(Events.START_NEW_GAME, (game) => this.onStartGame(socket, game));
    socket.on(Events.STOP_GAME, (gameId) =>  this.onStopGame(socket, gameId));

    socket.on(Events.LEAVE_GAME, (gameId) => this.onLeaveGame(socket, gameId));
    socket.on(Events.REGISTER_PLAYER, (playerName, cb) => this.onRegisterPlayer(socket, playerName, cb));
    socket.on('disconnecting', () => this.onPlayerDisconnect(socket));
  }

  private async onPlayerDisconnect(socket: Socket): Promise<void> {
    if (socket.request.session.player && socket.request.session.gameId) {
      const game = this.getGmByGameId(socket.request.session.gameId);
      const player: IPlayer = socket.request.session.player;

      await game.playerDisconnected(player);

      const idx = this.socketIdxMap.get(socket.id);
      if (typeof idx != "undefined") {
        this.sockets.splice(idx, 1);
        this.socketIdxMap.delete(socket.id);
      }
    }
  }

  private async onLeaveGame(socket: Socket, gameId: string): Promise<void> {
    const gm = this.getGmByGameId(gameId);
    const player = socket.request.session.player;

    await gm.playerLeft(player);
    socket.request.session.game = null;
    socket.request.session.gameId = null;
    socket.request.session.save((err: any) => {
      if (err) this.LOG.error('Error saving session when leaving game:', err);
      // socket.emit(Events.GAME_LEFT);
      socket.leave(gameId);
    });
  }
  private async onRegisterPlayer(socket: Socket, playerName: string, cb: Function): Promise<void> {

    try {
      const p = await Player.create({
        username: playerName
      });

      socket.request.session.player = p;
      socket.request.session.playerId = p._id.toString();
      socket.request.session.save((err: any) => {
        if (err) {
          this.LOG.error('Error saving session:', err);
        }
        this.LOG.info(`Player ${p.username} has finished registering`);
        cb(null, p);
      });

    } catch (err) {

      if (err.code) {
        if (err.code === 11000) {
          this.LOG.error(`Player ${playerName} already exists`);
          cb(Errors.USERNAME_TAKEN);
          return;
        }
      }

      this.LOG.error('Unhandled error while registering new player:', err);
      cb(Errors.UNKNOWN);
    }
  }

  private async onJoinGame(socket: Socket, gameId: string): Promise<void> {
    const player = socket.request.session.player;
    const gm = await this.getGmByGameId(gameId);

    socket.join(gameId);
    await gm.playerJoin(player);
    socket.emit(Events.GAME_JOINED, gm.getGame());
    // socket.to(gameId).emit(Events.PLAYER_JOINED, player);

    socket.request.session.game = gm.getGame();
    socket.request.session.gameId = gm.gameId;
    socket.request.session.save((err: any) => {
      if (err) this.LOG.error('Error saving session when joining game:', err);
    });
  }

  private async onStopGame(socket: Socket, gameId: string): Promise<void> {
    const player = socket.request.session.player;
    try {
      const gm = await this.getGmByGameId(gameId);
      await gm.stopGame(player);
      socket.leave(gameId);
      socket.request.session.game = null;
      socket.request.session.gameId = null;

      const idx = this.gmIdxMap.get(gm.gameId);
      if (typeof idx != 'undefined') {
        this.gameManagers.splice(idx, 1);
        this.gmIdxMap.delete(gm.gameId);
      }

    } catch (err) {
      if (err === Errors.GAME_NOT_FOUND) {
        socket.request.session.game = null;
        socket.request.session.gameId = null;

      } else {
        this.LOG.error("Error stopping game:", err);
      }
    }

    socket.request.session.save();
  }

  private async onStartGame(socket: Socket, title: string | undefined): Promise<void> {
    console.log(socket);
    const player = socket.request.session.player;
    if (!player) {
      this.LOG.error('Tried to start a game but there is no player in the session, curious');
      throw new WahError(Errors.PLAYER_NOT_FOUND);
    }
    const gm = await startNewGame(player, title);
    const gmIdx = this.gameManagers.length;

    this.gameManagers.push(gm);
    this.gmIdxMap.set(gm.gameId, gmIdx);

    const gameEvents = [
      Events.GAME_STOPPED,
      Events.PLAYER_JOINED,
      Events.PLAYER_LEFT,
      Events.PLAYER_DISCONNECTED,
      Events.PLAYER_KICKED
    ];

    for (const evt in gameEvents) {
      this.LOG.debug('Binding to game event:', gameEvents[evt]);
      gm.on(gameEvents[evt], (...args) => {
        this.LOG.debug('Game event:', gameEvents[evt]);
        this.io.in(gm.gameId).emit(gameEvents[evt], ...args);
      });
    }

    gm.on(Events.GAME_STOPPED, () => {
      this.removeGame(gm.gameId);
    });

    socket.request.session.gameId = gm.gameId;
    socket.request.session.game = gm.getGame();
    socket.request.session.save((err: any) => {
      if (err) this.LOG.error(err);
      socket.join(gm.gameId);
      this.io.in(gm.gameId).emit(Events.GAME_STARTED, gm.getGame());
    });
  }

  private removeGame(gameId: string): void {
    const idx = this.gmIdxMap.get(gameId);
    if (typeof idx != "undefined") {
      this.gameManagers.splice(idx, 1);
      this.gmIdxMap.delete(gameId);
    }
  }

  private async onConnect(socket: Socket): Promise<void> {
    this.LOG.debug('Socket connected');
    const sockIdx = this.sockets.length;
    this.sockets.push(socket);
    this.socketIdxMap.set(socket.id, sockIdx);

    this.bindPlayerEvents(socket);

    if (socket.request.session.playerId) {

      const playerId = socket.request.session.playerId;
      const player = await Player.findById(playerId);
      if (!player) {
        this.LOG.warn(`Connected session has player id ${playerId} but its not in the db`);
        socket.request.session.playerId = null;
        socket.request.session.player = null;
        socket.request.session.save();
      } else {
        this.LOG.debug(`Player ${player.username} has connected`);
        socket.request.session.player = player;
        socket.request.session.save();
        socket.emit(Events.PLAYER, player);

        if (socket.request.session.gameId) {
          this.LOG.debug(`Session has a registered game id`);
          try {
            const gm = this.getGmByGameId(socket.request.session.gameId);
            const game = gm.getGame();
            socket.request.session.game = game;
            socket.request.session.save();
            this.LOG.debug(`Player ${player.username} is rejoining game ${game.gameId}`)
            await gm.playerJoin(player);
            socket.join(game.gameId);
            socket.emit(Events.GAME_JOINED, game);

          } catch (err) {
            if (err === Errors.GAME_NOT_FOUND) {
              this.LOG.warn(`Session has game id ${socket.request.session.gameId} but there is no game manager for it`);
            } else {
              this.LOG.error(`Error getting game during registration:`, err);
            }
          }
        }
      }
    }

    socket.request.session.save();




    /*
    socket.on(Events.STOP_GAME, async (game: IGame) => {
      await this.getGameByGameId(game.gameId).stopGame(socket.request.session.player);
    });

    socket.on(Events.JOIN_GAME, async (gameId: string) => {
      const player = socket.request.session.player;
      const game = await this.getGameByGameId(gameId);

      await game.playerJoin(player);

      socket.join(gameId);
      socket.emit(Events.GAME_JOINED, game);
    })
    */

    socket.emit(Events.CONNECTED, socket.request.session.player);
  }

  getGmByGameId(gameId: string): GameManager {
    const idx = this.gmIdxMap.get(gameId);
    if (typeof idx != 'undefined') {
      return this.gameManagers[idx];
    }

    throw new WahError(Errors.GAME_NOT_FOUND, 'Game id ' + gameId + ' not found');
  }
}