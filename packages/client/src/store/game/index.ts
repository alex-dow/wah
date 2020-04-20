import makeState from './state';
import * as gameMutations from './mutations';
import { make } from 'vuex-pathify';

const state = makeState();

const mutations = {
  ...make.mutations(state),
  ...gameMutations
}

const gameStore = {
  state,
  mutations,
  namespaced: true
}

export default gameStore;