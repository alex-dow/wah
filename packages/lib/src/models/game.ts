import mongoose, { Schema, Document } from 'mongoose';
import { IPlayer } from './player';
import { IBlackCard, ICardDeck, IWhiteCard } from './card';
import { IGameRound } from './round';

export enum GameStatus {
  WAITING = "WAITING",
  STARTED = "STARTED",
  ENDED   = "ENDED"
}



export interface IGamePlayerHand {
  playerId: string;
  cards: Array<IWhiteCard>;
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
  status: GameStatus;
  rounds: Array<IGameRound>;
}

export interface IStatePlayerHandCount {
  playerId: string | mongoose.Schema.Types.ObjectId;
  count: number;
}

export interface IGameClientState extends IGame {
  playerHandCounts: Array<IStatePlayerHandCount>;
  playerHand: Array<IWhiteCard>;
  remainingWhiteCards: number;
  remainingBlackCards: number;
}

export interface IGameServerState extends Document {
  currentRound: IGameRound;
  blackCards: Array<IBlackCard>;
  whiteCards: Array<IWhiteCard>;
  gameId: string;
  playerHands: Array<IGamePlayerHand>;
}

const GameServerStateSchema: Schema = new Schema({
  currentRound: {type: Number, default: 0 },
  gameId: { type: String, required: true, unique: true },
  blackCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlackCard'}],
  whiteCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WhiteCard'}],
  playerHands: []
});

export const GameServerStateModel = mongoose.model<IGameServerState>('GameServerState', GameServerStateSchema);

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
  status: { type: String, default: GameStatus.WAITING },
  rounds: [{ type: Object }]
}, {
  timestamps: true
});

export default mongoose.model<IGameDocument>('Game', GameSchema);
