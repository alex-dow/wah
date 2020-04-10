import mongoose, { Schema, Document } from 'mongoose';
import { IPlayer } from './player';

export interface IRound extends Document {
  presenter: IPlayer;
  createdAt: Date;
  updatedAt: Date;

}

const RoundSchema: Schema = new Schema({
  presenter: { type: mongoose.Schema.Types.ObjectId, ref: 'Round' },
  createdAt: { type: Date },
  updatedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IRound>('Round', RoundSchema);
