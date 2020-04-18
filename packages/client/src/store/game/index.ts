import { GameClientState } from './state';
import * as gameMutations from './mutations';
import { make } from 'vuex-pathify';


const mutations = {
  ...make.mutations(GameClientState),
  ...gameMutations
}

const gameStore = {
  state: GameClientState,
  mutations,
  namespaced: true
}

export default gameStore;