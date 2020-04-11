import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  username: string;
}

const PlayerSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true }
});

export default mongoose.model<IPlayer>('Player', PlayerSchema);
