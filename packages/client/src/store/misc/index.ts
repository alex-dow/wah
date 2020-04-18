import { MiscState as state } from './state';
// import * as miscMutations from './mutations';
import * as actions from './actions';
import { make } from 'vuex-pathify';


const mutations = {
  ...make.mutations(state),
}

const miscStore = {
  state,
  mutations,
  actions,
  namespaced: true
}

export default miscStore;