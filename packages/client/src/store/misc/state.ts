import { ICardDeck } from '@wah/lib/src/models/card';

export interface IMiscState {
  cardDecks: Array<ICardDeck>;
}

export const MiscState: IMiscState = {
  cardDecks: new Array()
};

export default MiscState;