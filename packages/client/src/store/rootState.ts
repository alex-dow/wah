import { IPlayer, IGame } from '@wah/lib/src/models';
import { ICardDeck } from '@wah/lib/src/models/card';
import { ISessionState } from './session/state';
import { IGameClientState } from './game/state';
import { IMiscState } from './misc/state';

export interface IRootState {
  session: ISessionState;
  game: IGameClientState;
  misc: IMiscState;
};
