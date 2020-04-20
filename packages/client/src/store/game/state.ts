import { IGame } from '@wah/lib/src/models';
import { GameStatus, IGameClientState } from '@wah/lib/src/models/game';
import { IWhiteCard } from '@wah/lib/src/models/card';

export default function() {
  const GameClientState: IGameClientState = {
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
    status: GameStatus.WAITING,
    rounds: new Array(),
    remainingBlackCards: 0,
    remainingWhiteCards: 0
  };

  return GameClientState;
}