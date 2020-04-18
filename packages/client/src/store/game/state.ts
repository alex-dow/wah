import { IGame } from '@wah/lib/src/models';
import { GameState } from '@wah/lib/src/game';
import { IWhiteCard } from '@wah/lib/src/models/card';

export interface IStatePlayerHandCount {
  playerId: string,
  count: number
}

export interface IGameClientState extends IGame {
  playerHandCounts: Array<IStatePlayerHandCount>;
  playerHand: Array<IWhiteCard>;
}

export const GameClientState: IGameClientState = {
  createdAt: new Date(),
  updatedAt: new Date(),
  decks: new Array(),
  gameId: '',
  handSize: 10,
  host: null,
  playerHandCounts: new Array(),
  playerHand: new Array(),
  players: new Array(),
  title: '',
  disconnectedPlayers: new Array(),
  state: GameState.WAITING,
  rounds: new Array()
};

export default GameClientState;