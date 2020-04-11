import Vue from 'vue'
import Vuex, { StoreOptions, ActionContext } from 'vuex'
import { IPlayer } from '@wah/lib/src/models/player';
import axios from 'axios';
import { make, default as pathify } from 'vuex-pathify';

import { RootState } from './rootState';
import * as socketMutations from './socketMutations';
import Errors, { WahError } from '@wah/lib/src/errors';

Vue.use(Vuex);

const state: RootState = {
  connected: false,
  sessionStarted: false,
  player: null,
  game: null,
  joiningGame: false,
  inGame: false,
  disconnectedPlayers: new Array<IPlayer>(),
  baseUrl: location.protocol + '//' + location.host
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
    async startSession (ctx: ActionContext<RootState, RootState>): Promise<void> {
      await axios.get(ctx.state.baseUrl + '/api/session');
      return;
    },

    async register (ctx: ActionContext<RootState, RootState>, username: string): Promise<void> {
      try {
        const res = await axios.post(ctx.state.baseUrl + '/api/session/register', {
          username
        });
        const player: IPlayer = res.data;

        ctx.commit('SET_PLAYER', player);
      } catch (err) {
        if (err.response) {
          if (err.response.status  === 409) {
            throw  new WahError(Errors.USERNAME_TAKEN);
          } else {
            console.error('Unhandled http error:', err.response.data);
            throw new WahError(Errors.UNKNOWN);
          }
        } else {
          console.error('Unknown error:', err);
          throw new WahError(Errors.UNKNOWN);
        }
      }


    }
  },
  modules: {
  }
}

export default new Vuex.Store<RootState>(store);
