import Vue from 'vue'
import Vuex, { StoreOptions, ActionContext } from 'vuex'
//import { IPlayer } from '@wah/lib/src/models/player';
//import axios from 'axios';
import pathify from 'vuex-pathify';

import { IRootState } from './rootState';
//import * as socketMutations from './socketMutations';
//import Errors, { WahError } from '@wah/lib/src/errors';
//import { ICardDeck } from '@wah/lib/src/models/card';

import sessionStore from './session';
import gameStore from './game';
import miscStore from './misc';

Vue.use(Vuex);

const store: StoreOptions<IRootState> = {
  plugins: [pathify.plugin],
  modules: {
    session: sessionStore,
    game: gameStore,
    misc: miscStore
  }
};
export default new Vuex.Store<IRootState>(store);

// export default new Vuex.Store<RootState>(store);
/*
export default new Vuex.Store({
  modules: {
    session: sessionStore,
    game: gameStore,
    misc: miscStore

  }
});

const state: RootState = {
  connected: false,
  sessionStarted: false,
  player: null,
  game: null,
  joiningGame: false,
  inGame: false,
  disconnectedPlayers: new Array<IPlayer>(),
  baseUrl: location.protocol + '//' + location.host,
  cardDecks: new Array<ICardDeck>()
};


const mutations = {
  ...make.mutations(state),
  ...socketMutations
};

const store: StoreOptions<RootState> = {
  plugins: [pathify.plugin],
  state,
  mutations,
  actions: {
    async loadCardDecks (ctx: ActionContext<RootState, RootState>): Promise<void> {
      const cardDecks = await axios.get(ctx.state.baseUrl + '/api/decks');
      ctx.commit('SET_CARD_DECKS', cardDecks.data);
    },

    async startSession (ctx: ActionContext<RootState, RootState>): Promise<void> {
      await axios.get(ctx.state.baseUrl + '/api/session');
      return;
    }
  },
  modules: {
  }
}

export default new Vuex.Store<RootState>(store);
*/
