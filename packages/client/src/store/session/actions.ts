import { ActionContext } from 'vuex';
import { ISessionState } from './state';
import { IRootState } from '../rootState';
import axios from 'axios';
import { IGame } from '@wah/lib/src/models';

export async function startSession (ctx: ActionContext<ISessionState, IRootState>): Promise<void> {
  await axios.get(ctx.state.baseUrl + '/api/session');
  return;
}

export async function socket_sessionGame (ctx: ActionContext<ISessionState, IRootState>, game: IGame): Promise<void> {
  ctx.commit('game/SET_GAME', game, { root: true });
  ctx.commit('SET_IN_GAME', true);
}