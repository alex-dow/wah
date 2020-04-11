import { IPlayer, IGame } from '@wah/lib/src/models';
import { RootState } from './rootState';
import Vue from 'vue';

export function SOCKET_SESSION_INFO (state: RootState, payload: any): void {
  console.log('SOCKET_SESSION_INFO:', payload);
}

export function SOCKET_PLAYER (state: RootState, payload: IPlayer): void {
  state.player = payload;
}

export function SOCKET_SESSION_STARTED (state: RootState): void {
  state.sessionStarted = true;
}

export function SOCKET_CONNECTED (state: RootState, player: IPlayer | undefined): void {
  state.connected = true;
  if (player) {
    state.player =  player;
  }
}

export function SOCKET_DISCONNECT (state: RootState): void {
  state.connected = false;
  state.sessionStarted = false;
  state.player = null;
  state.game = null;
}

export function SOCKET_GAME_JOINED (state: RootState, game: IGame): void {
  state.game = game;
  Vue.set(state.game, 'players', state.game.players);
  state.inGame = true;
}

export function SOCKET_GAME_STARTED (state: RootState, game: IGame): void {
  state.game = game;
  Vue.set(state.game, 'players', state.game.players);
  state.inGame = true;
}

export function SOCKET_GAME_LEFT (state: RootState): void {
  state.game = null;
  state.inGame = false;
}

export function SOCKET_GAME (state: RootState, game: IGame): void {
  console.log('[wah-socket] Game:', game);
  state.game = game;
  Vue.set(state.game, 'players', state.game.players);
  state.inGame = true;
}

export function SOCKET_PLAYER_JOINED (state: RootState, player: IPlayer): void {
  console.log('Someone joined:', player);
  if (!state.game) {
    console.warn('Got a PLAYER_JOINED event but there is no active game');
    return;
  }

  if (state.game.players.findIndex((p) => p._id === player._id) > -1) {
    console.warn('Got a PLAYER_JOIN for a player thats already joined:', player);
  } else {
    state.game.players.push(player);
  }

  const idx = state.disconnectedPlayers.findIndex((p) => p._id === player._id);
  if (idx > -1) {
    state.disconnectedPlayers.splice(idx, 1);
  }
}

export function SOCKET_PLAYER_LEFT (state: RootState, player: IPlayer): void {
  console.log('Someone left:', player);
  if (!state.game) {
    console.warn('Got a PLAYER_LEFT event but there is no active game');
    return;
  }

  const idx = state.game.players.findIndex((p) => p._id === player._id);
  if (idx === -1) {
    console.warn('Got a PLAYER_LEFT for a player who is not in the game: ', player);
    return;
  }

  state.game.players.splice(idx, 1);

  if (state.player && player._id === state.player._id) {
    // the player who left is the current one
    state.game = null;
    state.inGame = false;
  }
}

export function SOCKET_PLAYER_KICKED (state: RootState, payload: any): void {
  const player: IPlayer = payload.player;
  const reason: string = payload.reason;

  console.log('Got a PLAYER_KICKED for ' + player.username + ' lol! Why: ', reason);

  if (!state.game) { return; }
  const idx = state.game.players.findIndex((p) => p._id === player._id);
  if (idx === -1) {
    console.warn('Got a PLAYER_KICKED for a player who is not in the game:', player);
    return;
  }

  state.game.players.splice(idx, 1);
}

export function SOCKET_PLAYER_DISCONNECTED (state: RootState, player: IPlayer): void {
  console.log('Player ' + player.username + ' disconnected');
  if (!state.game) {
    console.warn('Got a PLAYER_DISCONNECTED event but there is no active game');
    return;
  }

  if (state.game.players.findIndex((p) => p._id === player._id) === -1) {
    console.warn('Got a PLAYER_DISCONNECTED for game ' + state.game.gameId + ' but player is not in player list');
    return;
  }

  if (state.disconnectedPlayers.findIndex((p) => p._id === player._id) === -1) {
    state.disconnectedPlayers.push(player);
  }
}

export function SOCKET_GAME_STOPPED (state: RootState): void {
  console.warn('Game stopped! :(');
  state.inGame = false;
  state.game = null;
}

