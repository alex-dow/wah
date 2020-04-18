import mongoose, { Schema, Document } from 'mongoose';
import { IWhiteCard } from './card';
import { IGame } from './game';

export interface IPlayer extends Document {
  username: string;
  hand: Array<IWhiteCard>;
  game: IGame;
}

const PlayerSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  hand: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WhiteCard' }],
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: false }
});

export default mongoose.model<IPlayer>('Player', PlayerSchema);
