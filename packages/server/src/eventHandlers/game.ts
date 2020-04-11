import { Models, Events, Errors } from '@wah/lib';
const Player = Models.Player;
const Game = Models.Game;

import { getLogger, Logger } from 'log4js';
import { Socket } from 'socket.io';
import cryptoRandomString from 'crypto-random-string';
import { IPlayer } from '@wah/lib/src/models';

const LOG: Logger = getLogger('game-evthandler');

export function onLeaveGame(socket: Socket) {
  return async (): Promise<void> => {
    const player = socket.request.session.player;
    if (!player) {
      LOG.error(`No player associated with session`);
      throw Errors.PLAYER_NOT_FOUND;
    }

    const gameId = socket.request.session.gameId;
    const game = await Game.findOne({ gameId }).populate('players');
    if (!game) {
      LOG.error('Tried to leave a game that does not exist');
      socket.emit(Events.ERROR, Errors.GAME_NOT_FOUND);
      return;
    }

    console.log(game);

    const playerIdx = game.players.findIndex((p) => {
      console.log(`Comparing ${p} to ${player._id}: `, (p.toString() === player._id.toString()));
      return (p.toString() === player._id.toString());
    });
    if (playerIdx === -1) {
      LOG.warn(`Player ${player.username}:${player._id} is not part of the game ${game.gameId}`);
      return;
    }

    game.players.splice(playerIdx, 1);
    await game.save();

    socket.request.session.gameId = "";
    socket.request.session.save();

    socket.to(game.gameId).emit('PLAYER_LEFT', player);
  }
}

export function onStopGame(socket: Socket) {
  return async (gameId: string): Promise<void> => {
    LOG.info('Stopping game:', gameId);

    try {
      const player = socket.request.session.player;

      const gameId = socket.request.session.gameId;
      if (!gameId) {
        LOG.error(`${player.username} tried to stop a game with a missing session gameId`);
        socket.emit(Events.ERROR, Errors.GAME_NOT_FOUND);
        return;
      }

      const game = await Game.findOne({ gameId });
      if (!game) {
        LOG.error(`Player ${player} tried to stop game ${gameId} except it did not exist!`);
        socket.emit(Events.ERROR, Errors.GAME_NOT_FOUND);
        return;
      }

      game.players.forEach((player: IPlayer) => {
        LOG.warn(`Removing player ${player.username} from game ${game.gameId}`);
        Player.findByIdAndUpdate(player, { gameId: '' });
      });

      LOG.warn(`Deleting game ${game.gameId}`);
      await game.remove();

      LOG.debug(`Broadcasting GAME_STOPPED to channel ${gameId}`);
      socket.broadcast.to(gameId).emit(Events.GAME_STOPPED);
      socket.emit(Events.GAME_STOPPED);
      socket.leave(game.gameId);
      socket.request.session.gameId = "";
      socket.request.session.save();
    } catch (err) {
      LOG.error(err);
      socket.emit(Events.ERROR, Errors.UNKNOWN);
    }
  }
}

export function onJoinGame(socket: Socket) {
  return async (gameId: string): Promise<void> => {
    try {
      const player = socket.request.session.player;
      if (!player) {
        LOG.error(`No player associated with session`);
        throw Errors.PLAYER_NOT_FOUND;
      }

      socket.emit(Events.JOIN_GAME, gameId);

      const game = await Game.findOne({ gameId }).populate('hostPlayer').populate('players');
      if (!game) {
        LOG.error(`Player ${player.username} tried joining unknown game ${gameId}`);
        throw Errors.GAME_NOT_FOUND;
      }

      // Join the game room and tell the game room that this player is joining
      socket.join(game.gameId);
      socket.to(game.gameId).emit(Events.PLAYER_JOINING, player);

      LOG.info(`Player ${player.username} is joining game ${game.gameId}`);

      if (game.players.find((p) => p === player._id)) {
        LOG.warn(`Player ${player.username} considered alredy part of game ${gameId}`);
      } else {
        game.players.push(player);
        await game.save();
      }

      // Give the player the current game object
      socket.request.session.gameId = game.gameId;
      socket.request.session.save();
      socket.emit(Events.GAME, game);
      socket.to(game.gameId).emit(Events.PLAYER_JOINED, player);


    } catch (err) {
      if (err in Errors) {
        socket.emit(Events.ERROR, err);
      } else {
        LOG.error(err);
        socket.emit(Events.ERROR, Errors.UNKNOWN);
      }
    }
  }
}

export function onStartNewGame(socket: Socket) {
  return async (title: string): Promise<void> => {
    LOG.info('Starting a new game');
    try {
      const player = socket.request.session.player;
      if (!player) {
        LOG.error('No player in session');
        socket.emit(Events.ERROR, Errors.PLAYER_NOT_FOUND);
        return;
      }

      LOG.info(`Player ${player.username} has started a game`);

      const gameId = cryptoRandomString({ length: 7 });
      socket.emit(Events.JOIN_GAME, gameId);

      LOG.info("Creating new game with id " + gameId + " hosted by " + player.username);
      await Game.create({
        gameId, hostPlayer: player, players: new Array<IPlayer>(player), title
      });
      const game = await Game.findOne({ gameId }).populate('hostPlayer').populate('players');
      if (!game) { LOG.error("What? The game didnt create!"); throw new Error(Errors.FAILED_TO_SAVE); }
      // Join the game room
      LOG.debug(`Player ${player.username} is joining socket room ${game.gameId}`);
      socket.join(game.gameId);

      // Give the player the current game object

      socket.request.session.gameId = gameId;
      socket.request.session.save();
      socket.emit(Events.GAME, game);
    } catch (err) {
      LOG.error(err);
      socket.emit(Events.ERROR, Errors.UNKNOWN);
    }
  };
}