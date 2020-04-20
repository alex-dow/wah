import { Socket, Server as IOServer } from 'socket.io';
import { GameManager, createNewGame } from './gameManager';
import { Errors, GameEvents, PlayerEvents, SessionEvents, PlayerEventPayload } from '@wah/lib';
import { Player, IPlayer, Game, GameServerStateModel } from '@wah/lib/src/models';
import { ClientGameEvents, ClientSessionEvents, ClientGameEventPayload } from '@wah/lib/src/events';
import { Logger, getLogger } from 'log4js';
import { WahError } from '@wah/lib/src/errors';
import { ICardDeck } from '@wah/lib/src/models/card';
import _ from 'lodash';
import { Schema } from 'mongoose';

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

  private bindClientEvents(socket: Socket): void {
    this.bindClientGameEvents(socket);
    this.bindClientSessionEvents(socket);

    socket.on('disconnecting', () => {
      this.onDisconnect(socket);
    });
  }

  /**
   * Bind global game events to the game socket room
   */
  private bindGameEvents(gm: GameManager): void {
    Object.values(GameEvents).forEach((gameEvent) => {
      gm.on(gameEvent, (payload: any) => {
        this.LOG.debug('Sending game event:', gameEvent);
        this.io.in(gm.gameId).emit(gameEvent, payload);
      });
    });
  }

  /**
   * Bind game events that target a specific player to the
   * socket of that player.
   */
  private bindPlayerEvents(gm: GameManager): void {
    Object.values(PlayerEvents).forEach((playerEvent) => {
      gm.on(playerEvent, (payload: PlayerEventPayload) => {
        const player = gm.getPlayer(payload.playerId);
        const socket = this.getPlayerSocket(player._id);

        this.LOG.debug(`Sending player event ${playerEvent} to ${player.username}`);
        socket.emit(playerEvent, payload);
      });
    });
  }

  getPlayerSocket(playerId: string | Schema.Types.ObjectId): Socket {
    const socket = this.sockets.find((sock) => sock.request.session.player?._id.toString() == playerId.toString());
    if (!socket) {
      throw new WahError(Errors.PLAYER_NOT_FOUND, "No socket for player id " + playerId);
    }
    return socket;
  }

  async onClientRegisterPlayer (socket: Socket, username: string): Promise<SocketsManager> {
    try {
      const p = await Player.create({ username });
      socket.request.session.player = p;
      socket.request.session.save();
      socket.emit(SessionEvents.PLAYER, p);
    } catch (err) {
      if (err.code && err.code === 11000) {
        this.LOG.error(`Player ${username} already exists`);
        socket.emit(SessionEvents.ERROR, Errors.USERNAME_TAKEN);
      } else {
        this.LOG.error('Unhandled error while registering new player:', err);
        socket.emit(SessionEvents.ERROR, Errors.UNKNOWN);
      }
    }
    return this;
  }

  async onClientNewGame (socket: Socket, payload: [string, Array<ICardDeck>]): Promise<SocketsManager> {
    const player = socket.request.session.player;
    if (!player) {
      this.LOG.error('Tried to start a game but there is no player in the session, curious');
      throw new WahError(Errors.PLAYER_NOT_FOUND);
    }

    let title = payload[0];
    const decks = payload[1];

    if (!title) {
      title = "Whatever Against Humanity";
    }

    const gm = await createNewGame(player, title, decks);
    const gmIdx = this.gameManagers.length;

    this.gameManagers.push(gm);
    this.gmIdxMap.set(gm.gameId, gmIdx);

    this.bindGameEvents(gm);
    this.bindPlayerEvents(gm);

    socket.request.session.gameId = gm.gameId;
    socket.request.session.game = gm.getGame();
    socket.request.session.save();
    socket.join(gm.gameId);

    gm.refreshClientGameState(player._id);

    //socket.emit(SessionEvents.GAME, gm.getGame());
    //gm.refreshWhiteCardCount();
    //gm.refreshBlackCardCount();

    return this;
  }

  async onClientJoinGame (socket: Socket, gameId: string): Promise<SocketsManager> {
    const player = socket.request.session.player;
    if (!player) {
      this.LOG.error(`Tried to join ${gameId} but there is no player associated with the session`);
      throw new WahError(Errors.PLAYER_NOT_FOUND, "Session has no player!");
    }

    const gm = await this.getGmByGameId(gameId);
    socket.join(gm.gameId);
    await gm.addPlayer(player);



    socket.request.session.game = gm.getGame();
    socket.request.session.gameId = gm.gameId;
    socket.request.session.save((err: any) => {
      if (err) this.LOG.error('Error saving session when joining game:', err);
    });

    gm.refreshClientGameState(player._id);

    return this;
  }



  public async init(): Promise<SocketsManager> {

    this.LOG.info("Initializating");
    const games = await Game.find({}).populate('players').populate('host');

    this.LOG.info(games.length + " games to load");
    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      this.LOG.debug("Processing " + game.gameId);
      const idx = this.gameManagers.length;
      const gameState = await GameServerStateModel.findOne({ gameId: game.gameId }).populate('whiteCards').populate('blackCards');
      if (gameState) {
        const gm = new GameManager(game, gameState);
        this.bindGameEvents(gm);
        this.bindPlayerEvents(gm);

        this.gameManagers.push(gm);
        this.gmIdxMap.set(game.gameId, idx);
      } else {
        this.LOG.error("A game was found wihtout an associated game state. Game id: " + game.gameId);
      }
    }

    return this;
  }

  private async onDisconnect(socket: Socket): Promise<void> {

    const idx = this.sockets.findIndex((s) => s.id == socket.id);
    if (idx > -1) {
      this.sockets.splice(idx, 1);
    }
  }

  /**
   * Bind session related events from the client
   */
  private bindClientSessionEvents(socket: Socket): void {
    Object.values(ClientSessionEvents).forEach((clientSessionEvent: string) => {
      let methodName = _.camelCase(clientSessionEvent.replace('CLIENT_SESSION_', ''));
      methodName = 'onClient' + methodName[0].toUpperCase() + methodName.slice(1);

      this.LOG.debug('Binding evt ' + clientSessionEvent + ' to SocketsManager::' + methodName);

      socket.on(clientSessionEvent, async (payload: any) => {
        this.LOG.debug('Recv: ' + clientSessionEvent);
        try {
          if (typeof (this as any)[methodName]  === 'function') {
            await (this as any)[methodName](socket, payload);
          } else {
            this.LOG.warn('SocketsManager::' + methodName + ' does not exist');
          }
        } catch (err) {
          this.LOG.error(clientSessionEvent + ' failed');
          this.LOG.error(err);
        }
      });
    });
  }

  /**
   * Bind game related events from the client to appropriate game manager
   */
  private bindClientGameEvents(socket: Socket): void {
    Object.values(ClientGameEvents).forEach((clientGameEvent: string) => {

      let methodName = _.camelCase(clientGameEvent.replace('CLIENT_GAME_', ''));
      methodName = 'onClient' + methodName[0].toUpperCase() + methodName.slice(1);

      this.LOG.debug('Binding evt ' + clientGameEvent + ' to GameManager::' + methodName);

      // CLIENT_GAME_LEAVE_GAME
      // onClientLeaveGame
      ClientGameEvents.LEAVE_GAME;

      socket.on(clientGameEvent, async (payload: ClientGameEventPayload) => {



        try {
          // Expect game id
          const gameId: string = payload.gameId;
          const data: any   = payload.data;
          const player: IPlayer = socket.request.session.player;

          this.LOG.debug('Recv ' + clientGameEvent + ' for game ' + gameId + ' from player ' + player.username);

          const gm = this.getGmByGameId(gameId);

          if (typeof (gm as any)[methodName]  === 'function') {
            await (gm as any)[methodName](player._id, data);
          } else {
            this.LOG.warn('GameManager::' + methodName + ' does not exist');
          }
        } catch (err) {
          this.LOG.error(clientGameEvent + 'failed');
          this.LOG.error(err);
        }
      });
    });
  }

  private async onConnect(socket: Socket): Promise<void> {
    this.LOG.debug('Socket connected');
    this.sockets.push(socket);
    this.bindClientEvents(socket);

    if (socket.request.session.player) {

      const player = socket.request.session.player;
      socket.emit(SessionEvents.PLAYER, player);
      this.LOG.debug(`Player ${player.username} has connected`);

      if (socket.request.session.game) {
        this.LOG.debug(`Session has a registered game id`);
        try {
          const gm = this.getGmByGameId(socket.request.session.game.gameId);
          const game = gm.getGame();

          this.LOG.debug(`Player ${player.username} is rejoining game ${game.gameId}`)
          await gm.addPlayer(player._id);

          socket.join(game.gameId);
          await gm.refreshClientGameState(player._id);

        } catch (err) {
          if (err.constructor.name == 'WahError') {
            if (err.errType === Errors.GAME_NOT_FOUND) {
              this.LOG.warn(`Session has game id ${socket.request.session.gameId} but there is no game manager for it`);
              socket.request.session.game = null;
              await socket.request.session.save();
            } else {
              this.LOG.error(err.errType, err);
            }
          } else {
            this.LOG.error(`Error getting game during registration:`, err);
          }
        }
      }
    }

    socket.request.session.save();
    socket.emit(SessionEvents.CONNECTED);

  }

  getGmByGameId(gameId: string): GameManager {
    const idx = this.gmIdxMap.get(gameId);
    if (typeof idx != 'undefined') {
      return this.gameManagers[idx];
    }

    throw new WahError(Errors.GAME_NOT_FOUND, 'Game id ' + gameId + ' not found');
  }
}