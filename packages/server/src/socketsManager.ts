import { Socket, Server as IOServer } from 'socket.io';
import { GameManager, startNewGame } from './gameManager';
import { Errors, ClientEvents, GameEvents, PlayerEvents, SessionEvents, GameEventArg } from '@wah/lib';
import { Player, IPlayer, Game } from '@wah/lib/src/models';
import { Logger, getLogger } from 'log4js';
import { WahError } from '@wah/lib/src/errors';
import { ICardDeck } from '@wah/lib/src/models/card';
import { GameStateModel } from '@wah/lib/src/models/game';

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
    Object.values(ClientEvents).forEach((clientEvent) => {

      const clientEventMethod = clientEvent;
      if (typeof (this as any)[clientEventMethod]  === 'function') {
        socket.on(clientEvent, async (...args) => {
          try {
            this.LOG.debug('Received event: ', clientEvent);
            await (this as any)[clientEventMethod](socket, ...args);
          } catch (err) {
            this.LOG.error('Error handling evt ' + clientEvent);
            this.LOG.error(err);
          }
        });
      }
    });

    socket.on('disconnecting', () => {
      this.onPlayerDisconnect(socket);
    });
  }

  private bindGameEvents(gm: GameManager): void {
    Object.values(GameEvents).forEach((gameEvent) => {
      gm.on(gameEvent, (payload: GameEventArg) => {
        this.LOG.debug('Sending game event:', gameEvent);
        this.io.in(gm.gameId).emit(gameEvent, payload);
      });
    });
  }

  private bindPlayerEvents(gm: GameManager, socket: Socket): void {
    const player = socket.request.session.player;
    Object.values(PlayerEvents).forEach((playerEvent) => {
      gm.on(playerEvent, (payload: any) => {
        this.LOG.debug(`Sending player event ${playerEvent} to ${player.username}`);
        socket.emit(playerEvent, payload);
      });
    });
  }

  async [ClientEvents.REGISTER_PLAYER] (socket: Socket, username: string): Promise<SocketsManager> {
    try {
      const p = await Player.create({ username });
      socket.request.session.playerId = p._id;
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

  async [ClientEvents.NEW_WHITE_CARD] (socket: Socket, noOfCards: number): Promise<SocketsManager> {

    const gameId = socket.request.session.gameId;
    const player = socket.request.session.player;

    const gm = await this.getGmByGameId(gameId);
    gm.givePlayerCards(player, noOfCards);

    return this;
  }

  async [ClientEvents.STOP_GAME] (socket: Socket, gameId: string): Promise<SocketsManager> {
    const gm =  await this.getGmByGameId(gameId);
    gm.stopGame(socket.request.session.player);
    return this;
  }

  async [ClientEvents.START_NEW_GAME] (socket: Socket, payload: [string, Array<ICardDeck>]): Promise<SocketsManager> {
    const player = socket.request.session.player;
    if (!player) {
      this.LOG.error('Tried to start a game but there is no player in the session, curious');
      throw new WahError(Errors.PLAYER_NOT_FOUND);
    }

    const [title, decks]: [string, Array<ICardDeck>] = payload;

    const gm = await startNewGame(player, title, decks);
    const gmIdx = this.gameManagers.length;

    this.gameManagers.push(gm);
    this.gmIdxMap.set(gm.gameId, gmIdx);

    this.bindGameEvents(gm);
    this.bindPlayerEvents(gm, socket);

    socket.request.session.gameId = gm.gameId;
    socket.request.session.game = gm.getGame();
    socket.request.session.save();
    socket.join(gm.gameId);
    socket.emit(SessionEvents.GAME, gm.getGame());

    return this;
  }

  async [ClientEvents.JOIN_GAME] (socket: Socket, gameId: string): Promise<SocketsManager> {
    const player = socket.request.session.player;
    if (!player) {
      this.LOG.error(`Tried to join ${gameId} but there is no player associated with the session`);
      throw new WahError(Errors.PLAYER_NOT_FOUND, "Session has no player!");
    }

    const gm =  await this.getGmByGameId(gameId);
    socket.join(gm.gameId);
    await gm.playerJoin(player);

    socket.emit(SessionEvents.GAME, gm.getGame());

    socket.request.session.game = gm.getGame();
    socket.request.session.gameId = gm.gameId;
    socket.request.session.save((err: any) => {
      if (err) this.LOG.error('Error saving session when joining game:', err);
    });

    return this;
  }



  public async init(): Promise<SocketsManager> {

    this.LOG.info("Initializating");
    const games = await Game.find({}).populate('players').populate('host');

    for (let i = 0; i < games.length; i++) {
      const game = games[i];
      const idx = this.gameManagers.length;
      const gameState = await GameStateModel.findOne({ gameId: game.gameId }).populate('whiteCards').populate('blackCards');
      if (gameState) {
        this.gameManagers.push(new GameManager(game, gameState));
        this.gmIdxMap.set(game.gameId, idx);
      } else {
        throw new WahError(Errors.GAME_NOT_FOUND, "The game was found, but not its associated game state!");
      }
    }

    return this;
  }

  private async onPlayerDisconnect(socket: Socket): Promise<void> {
    if (socket.request.session.player && socket.request.session.gameId) {
      const game = this.getGmByGameId(socket.request.session.gameId);
      const player: IPlayer = socket.request.session.player;

      await game.playerDisconnected(player);

    }
  }

  private async onConnect(socket: Socket): Promise<void> {
    this.LOG.debug('Socket connected');
    this.bindClientEvents(socket);

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
        socket.emit(SessionEvents.PLAYER, player);

        if (player.game) {
          this.LOG.debug(`Session has a registered game id`);
          try {
            const gm = this.getGmByGameId(player.game.gameId);
            const game = gm.getGame();
            socket.request.session.game = game;
            socket.request.session.save();
            this.LOG.debug(`Player ${player.username} is rejoining game ${game.gameId}`)
            await gm.playerJoin(player);
            socket.join(game.gameId);
            socket.emit(SessionEvents.GAME, game);

          } catch (err) {
            if (err === Errors.GAME_NOT_FOUND) {
              this.LOG.warn(`Session has game id ${socket.request.session.gameId} but there is no game manager for it`);
              delete player.game;
              await player.save();
            } else {
              this.LOG.error(`Error getting game during registration:`, err);
            }
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