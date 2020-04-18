import { SessionState } from './state';
import * as sessionMutations from './mutations';
import * as actions from './actions';
import { make } from 'vuex-pathify';


const mutations = {
  ...make.mutations(SessionState),
  ...sessionMutations
}

const sessionStore = {
  state: SessionState,
  mutations,
  actions,
  namespaced: true
}

export default sessionStore;