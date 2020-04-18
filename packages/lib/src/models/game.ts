import mongoose, { Schema, Document } from 'mongoose';
import { IPlayer } from './player';
import { IBlackCard, ICardDeck, IWhiteCard } from './card';
import { GameState, RoundState } from '../game';

export interface IGamePlayerHand {
  playerId: string;
  cards: Array<IWhiteCard>;
}

export interface IGameRound {
  hostPlayer: IPlayer;
  state: RoundState;
  winner: IPlayer | null;
  winningWhiteCard: IWhiteCard | null;
  winningBlackCard: IBlackCard | null;
  startedAt: Date;
  endedAt: Date | null;
}

export interface IGame {
  gameId: string;
  players: Array<IPlayer>;
  host: IPlayer | null;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  disconnectedPlayers: Array<IPlayer>;
  decks: Array<ICardDeck>;
  handSize: number;
  state: GameState;
  rounds: Array<IGameRound>;
}

export interface IGameState extends Document {
  currentRound: IGameRound;
  blackCards: Array<IBlackCard>;
  whiteCards: Array<IWhiteCard>;
  gameId: string;
  playerHands: Array<IGamePlayerHand>;
}

const GameStateSchema: Schema = new Schema({
  currentRound: {type: Number, default: 0 },
  gameId: { type: String, required: true, unique: true },
  blackCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlackCard'}],
  whiteCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WhiteCard'}],
  playerHands: []
});

export const GameStateModel = mongoose.model<IGameState>('GameState', GameStateSchema);

export interface IGameDocument extends IGame, Document { }

const GameSchema: Schema = new Schema({
  gameId: { type: String, required: true, unique: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  title: { type: String, required: false, default: 'Whatever Against Humanity' },
  players: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  disconnectedPlayers: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Player' } ],
  decks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'CardDeck'}],
  createdAt: { type: Date },
  updatedAt: { type: Date },
  handSize: { type: Number, default: 10 },
  state: { type: String, default: GameState.WAITING },
  rounds: [{ type: Object }]
}, {
  timestamps: true
});

export default mongoose.model<IGameDocument>('Game', GameSchema);
