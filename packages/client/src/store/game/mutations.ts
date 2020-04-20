import { IGameClientState } from '@wah/lib';
import { IGame, IPlayer } from '@wah/lib';
import Vue from 'vue';
import { IWhiteCard } from '@wah/lib';
import { IStatePlayerHandCount } from '@wah/lib';
import { GameEventPayload, PlayerEventPayload } from '@wah/lib';
import makeState from './state';

export function SET_GAME(state: IGameClientState, payload: IGame) {
  state.createdAt = payload.createdAt;
  state.decks = payload.decks;
  state.disconnectedPlayers = payload.disconnectedPlayers;
  state.gameId = payload.gameId;
  state.handSize = payload.handSize;
  state.host = payload.host;
  state.players = payload.players;
  state.title = payload.title;
  state.updatedAt = payload.updatedAt;
  state.playerHandCounts = new Array<IStatePlayerHandCount>();

}

export function SOCKET_GAME_PLAYER_HAND_COUNT(state: IGameClientState, payload: GameEventPayload) {
  const data: IStatePlayerHandCount = payload.data;
  const idx = state.playerHandCounts.findIndex((i) => i.playerId == data.playerId);
  if (idx > -1) {
    state.playerHandCounts.splice(idx, 1, data);
  } else {
    state.playerHandCounts.push(data);
  }
}

export function SOCKET_PLAYER_WHITE_CARDS(state: IGameClientState, payload: PlayerEventPayload) {
  const playerHand: Array<IWhiteCard> = payload.data;
  state.playerHand = playerHand;
}

export function SOCKET_GAME_WHITE_CARDS_COUNT(state: IGameClientState, payload: GameEventPayload) {
  state.remainingWhiteCards = payload.data;
}

export function SOCKET_GAME_BLACK_CARDS_COUNT(state: IGameClientState, payload: GameEventPayload) {
  state.remainingBlackCards = payload.data;
}

export function SOCKET_GAME_PLAYER_JOINED(state: IGameClientState, payload: GameEventPayload) {
  const player: IPlayer = payload.data;
  if (state.players.findIndex((p) => p._id.toString() == player._id.toString()) > -1) {
    console.warn('Player already joined:', player.username);
  } else {
    state.players.push(payload.data);
  }
}

export function SOCKET_PLAYER_GAME_STATE(state: IGameClientState, payload: GameEventPayload) {
  Object.assign(state, payload.data);
}

export function SOCKET_GAME_STOPPED(state: IGameClientState, payload: GameEventPayload) {
  Object.assign(state, makeState());
}