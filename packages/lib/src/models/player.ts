import mongoose, { Schema, Document } from 'mongoose';
import { IWhiteCard } from './card';
import { IGame } from './game';

export interface IPlayer extends Document {
  username: string;
}

const PlayerSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
});

export default mongoose.model<IPlayer>('Player', PlayerSchema);
