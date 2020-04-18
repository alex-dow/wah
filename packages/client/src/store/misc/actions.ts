import axios from 'axios';
import { IMiscState } from './state';
import { ActionContext } from 'vuex';
import { IRootState } from '../rootState';

export async function loadCardDecks (ctx: ActionContext<IMiscState, IRootState>): Promise<void> {
  const cardDecks = await axios.get(ctx.rootState.session.baseUrl + '/api/decks');
  ctx.commit('SET_CARD_DECKS', cardDecks.data);
}
