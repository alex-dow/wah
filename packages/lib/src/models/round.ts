import mongoose, { Schema, Document } from 'mongoose';
import { IPlayer } from './player';
import { IBlackCard, IWhiteCard } from './card';

export enum RoundStatus {
  WAITING  = "WAITING",
  STARTED  = "STARTED",
  SKIPPED  = "SKIPPED",
  FINISHED = "FINISHED"
}

export interface PlayerSubmission {
  playerId: string | mongoose.Schema.Types.ObjectId;
  whiteCardId: string | mongoose.Schema.Types.ObjectId;
}

export interface IGameRound extends Document {
  presenter: IPlayer;
  createdAt: Date;
  updatedAt: Date;
  winner: IPlayer | undefined | null;
  blackCard: IBlackCard;
  status: RoundStatus;
  winningWhiteCard: IWhiteCard;
  playerSubmissions: Array<PlayerSubmission>;
}

const GameRoundSchema: Schema = new Schema({
  presenter: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  createdAt: { type: Date },
  updatedAt: { type: Date },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
  blackCard: { type: mongoose.Schema.Types.ObjectId, ref: 'BlackCard' },
  status: { type: String },
  winningWhiteCard: { type: mongoose.Schema.Types.ObjectId, ref: 'WhiteCard' },
  playerSubmissions: { type: Array }
}, {
  timestamps: true
});

export default mongoose.model<IGameRound>('GameRound', GameRoundSchema);
