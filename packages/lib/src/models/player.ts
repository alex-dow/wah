import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayer extends Document {
  username: string;
}

const PlayerSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true }
},{
  autoIndex: false
});

export default mongoose.model<IPlayer>('Player', PlayerSchema);
