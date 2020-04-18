import { IGameClientState } from './state';
import { IGame } from '@wah/lib/src/models';
import Vue from 'vue';
import { IWhiteCard } from '@wah/lib/src/models/card';
import { IStatePlayerHandCount } from './state';

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

export function SOCKET_GAME_PLAYER_HAND_COUNT(state: IGameClientState, payload: IStatePlayerHandCount) {
  const idx = state.playerHandCounts.findIndex((i) => i.playerId == payload.playerId);
  if (idx > -1) {
    state.playerHandCounts.splice(idx, 1, payload);
  } else {
    state.playerHandCounts.push(payload);
  }
}

export function SOCKET_PLAYER_WHITE_CARDS(state: IGameClientState, payload: Array<IWhiteCard>) {
  state.playerHand = payload;
}


