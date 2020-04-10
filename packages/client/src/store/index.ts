import Vue from 'vue'
import Vuex, { StoreOptions } from 'vuex'
import { IPlayer } from '@wah/lib/src/models/player';
import { IGame } from '@wah/lib/src/models/game';
import { Events } from '@wah/lib';
import axios from 'axios';
import { make, default as pathify } from 'vuex-pathify';

Vue.use(Vuex);

interface RootState {
  player: IPlayer | null;
  game: IGame | null;
  connected: boolean;
  sessionStarted: boolean;
  joiningGame: boolean;
  inGame: boolean;
  disconnectedPlayers: Array<IPlayer>;
}

const state: RootState = {
  connected: false,
  sessionStarted: false,
  player: null,
  game: null,
  joiningGame: false,
  inGame: false,
  disconnectedPlayers: new Array<IPlayer>()
};

const socketMutations = {
  SOCKET_SESSION_INFO (state: RootState, payload: any) {
    console.log('SOCKET_SESSION_INFO:', payload);
  },
  SOCKET_PLAYER (state: RootState, payload: IPlayer) {
    state.player = payload;
  },
  SOCKET_SESSION_STARTED (state: RootState) {
    state.sessionStarted = true;
  },
  SOCKET_CONNECTED (state: RootState) {
    state.connected = true;
  },
  SOCKET_DISCONNECT (state: RootState) {
    state.connected = false;
    state.sessionStarted = false;
  },
  SOCKET_JOIN_GAME (state: RootState) {
    console.log('[wah-socket] Joining game');
    state.joiningGame = true;
    state.inGame = true;
  },

  SOCKET_GAME (state: RootState, game: IGame) {
    console.log('[wah-socket] Game:', game);
    state.game = game;
    Vue.set(state.game, 'players', state.game.players);
    state.joiningGame = false;
    state.inGame = true;
  },

  SOCKET_PLAYER_JOINED (state: RootState, player: IPlayer) {
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
  },

  SOCKET_PLAYER_LEFT (state: RootState, player: IPlayer) {
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
  },

  SOCKET_PLAYER_KICKED (state: RootState, payload: any) {
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
  },

  SOCKET_PLAYER_DISCONNECTED (state: RootState, player: IPlayer) {
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
  },

  SOCKET_GAME_STOPPED (state: RootState) {
    console.warn('Game stopped! :(');
    state.inGame = false;
    state.joiningGame = false;
  }
}

const mutations = {
  ...make.mutations(state),
  ...socketMutations
};

const store: StoreOptions<RootState> = {
  plugins: [pathify.plugin],
  state,
  mutations,
  actions: {

  },
  modules: {
  }
}

export default new Vuex.Store<RootState>(store);
