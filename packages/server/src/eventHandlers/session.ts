import { getLogger, Logger } from 'log4js';
import { Socket } from 'socket.io';
import { Models, Events, Errors } from '@wah/lib';

import { onStartNewGame, onStopGame, onJoinGame, onLeaveGame } from './game';
import { Game } from '@wah/lib/src/models';

const Player = Models.Player;

const LOG: Logger = getLogger('session-evthandle');

export function onRegisterPlayer(socket: Socket) {
  return async (username: string): Promise<void> => {
    let player = await Player.findOne({username});
    if (player) {
      LOG.error(`The username ${username} is already in use`);
      socket.emit(Events.ERROR, Errors.USERNAME_TAKEN);
    } else {
      player = new Player({username});
      player.save();
      socket.request.session.playerId = player.id;
      socket.request.session.player = player;
      socket.request.session.save();
      LOG.info(`New user ${player.username} with id ${player.id}`)
      socket.emit(Events.PLAYER, player);
    }
  }
}

export function onDisconnect(socket: Socket) {
  return async function(): Promise<void> {
    if (socket.request.session.gameId && socket.request.session.player) {
      const player = socket.request.session.player;
      const gameId = socket.request.session.gameId;

      LOG.info(`Player ${player.username} has disconnected`);

      if (gameId) {
        LOG.info(`Player ${player.username} has ragequit from game ${gameId}`);
        socket.to(gameId).emit(Events.PLAYER_DISCONNECTED, socket.request.session.player);
        // socket.to(gameId).emit(Events.PLAYER_DISCONNECTED, socket.request.session.player);
      }

      // Player has five minutes to get their ass back in the game before
      // being booted
      // TODO This --^
    }
  }
}

export async function onConnect(socket: Socket): Promise<void> {
  // socket.on(Events.START_SESSION, onStartSession(socket));
  socket.on(Events.REGISTER_PLAYER, onRegisterPlayer(socket));
  socket.on(Events.START_NEW_GAME, onStartNewGame(socket));
  socket.on(Events.STOP_GAME, onStopGame(socket));
  socket.on(Events.JOIN_GAME, onJoinGame(socket));
  socket.on(Events.LEAVE_GAME, onLeaveGame(socket));
  socket.on('disconnecting', onDisconnect(socket));

  if (socket.request.session.playerId) {
    const player = await Player.findById(socket.request.session.playerId);
    if (player) {
      LOG.info('Connected session has established player:', player.username);
      socket.emit(Events.PLAYER, player);

      if (socket.request.session.gameId) {
        const gameId = socket.request.session.gameId;
        const game = await Game.findOne({ gameId }).populate('hostPlayer').populate('players');
        if (!game) {
          LOG.warn(`Player ${player.username} was in game ${gameId} but it doesnt exist anymore`);
          socket.request.session.gameId = "";
        } else {
          socket.join(game.gameId);
          socket.emit(Events.JOIN_GAME, socket.request.session.gameId);
          socket.to(game.gameId).emit(Events.PLAYER_JOINED, player);
          socket.emit(Events.GAME, game);
        }
      }

    } else {
      socket.request.session.playerId = "";
    }
  }

  socket.request.session.save();
  socket.emit(Events.CONNECTED);
}

