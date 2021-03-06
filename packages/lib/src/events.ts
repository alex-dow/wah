import { IGame } from './models/game';
import { IPlayer } from './models/player';
import { Schema } from 'mongoose';

/**
 * These events should be globally broadcast to a game room
 */
export enum GameEvents {
  PLAYER_JOINED       = 'GAME_PLAYER_JOINED',
  PLAYER_LEFT         = 'GAME_PLAYER_LEFT',
  PLAYER_DISCONNECTED = 'GAME_PLAYER_DISCONNECTED',
  PLAYER_KICKED       = 'GAME_PLAYER_KICKED',
  GAME_STOPPED        = 'GAME_STOPPED',
  ERROR               = 'GAME_ERROR',
  TITLE               = 'GAME_TITLE',
  PLAYER_LIST         = 'GAME_PLAYER_LIST',
  DECKS               = 'GAME_DECKS',
  PLAYER_HAND_COUNT   = 'GAME_PLAYER_HAND_COUNT',
  WHITE_CARDS_COUNT   = 'GAME_WHITE_CARDS_COUNT',
  BLACK_CARDS_COUNT   = 'GAME_BLACK_CARDS_COUNT',
  NEW_ROUND           = 'GAME_NEW_ROUND',
  ROUND_SKIPPED       = 'GAME_ROUND_SKIPPED'
}

export interface GameEventPayload {
  gameId: string | Schema.Types.ObjectId;
  data: any;
}

/**
 * These events should be broadcast to a specific
 * player in a game.
 */
export enum PlayerEvents {
  WHITE_CARDS     = 'PLAYER_WHITE_CARDS',
  ERROR           = 'PLAYER_ERROR',
  GAME_STATE      = 'PLAYER_GAME_STATE'
}

export interface PlayerEventPayload {
  gameId: string | Schema.Types.ObjectId;
  playerId: string | Schema.Types.ObjectId;
  data: any;
}
/**
 * These should be emitted on the socket
 */
export enum SessionEvents {
  CONNECTED   = 'SESSION_CONNECTED',
  PLAYER      = 'SESSION_PLAYER',
  GAME_JOINED = 'SESSION_GAME_JOINED',
  GAME        = 'SESSION_GAME',
  ERROR       = 'SESSION_ERROR'
}

/**
 * Events sent from the client related to the client's session
 */
export enum ClientSessionEvents {
  REGISTER_PLAYER = 'CLIENT_SESSION_REGISTER_PLAYER',
  NEW_GAME        = 'CLIENT_SESSION_NEW_GAME',
  JOIN_GAME       = 'CLIENT_SESSION_JOIN_GAME'
}

/**
 * Events sent from the client related to a game
 */
export enum ClientGameEvents {
  START_GAME      = 'CLIENT_GAME_START_GAME',
  STOP_GAME       = 'CLIENT_GAME_STOP_GAME',
  NEW_WHITE_CARD  = 'CLIENT_GAME_NEW_WHITE_CARD',
  LEAVE_GAME      = 'CLIENT_GAME_LEAVE_GAME',
  SKIP_ROUND      = 'CLIENT_GAME_SKIP_ROUND'
}

export interface ClientGameEventPayload {
  gameId: string;
  data: any;
}

enum Events {
  CONNECT = 'CONNECT',
  CONNECTED = 'CONNECTED',
  DISCONNECT = 'DISCONNECT',
  SESSION_STARTED = 'SESSION_STARTED',
  ERROR = 'ERROR',
  PLAYER = 'PLAYER',
  REGISTER_PLAYER = 'REGISTER_PLAYER',
  JOIN_GAME = 'JOIN_GAME',
  PLAYER_JOINED = 'PLAYER_JOINED',
  PLAYER_JOINING = 'PLAYER_JOINING',
  PLAYER_LEFT = 'PLAYER_LEFT',
  PLAYER_DISCONNECTED = 'PLAYER_DISCONNECTED',
  LEAVE_GAME = 'LEAVE_GAME',
  START_NEW_GAME = 'START_NEW_GAME',
  STOP_GAME = 'STOP_GAME',
  GAME_STOPPED = 'GAME_STOPPED',
  GAME_JOINED = 'GAME_JOINED',
  GAME_STARTED = 'GAME_STARTED',
  GAME_LEFT = 'GAME_LEFT',
  PLAYER_LIST = 'PLAYER_LIST',
  GAME = 'GAME',
  PING = 'PING',
  PONG = 'PONG',
  KICK_PLAYER = 'KICK_PLAYER',
  PLAYER_KICKED = 'PLAYER_KICKED'
}

export default Events;
