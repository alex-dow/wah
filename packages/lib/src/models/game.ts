import mongoose, { Schema, Document } from 'mongoose';
import { IPlayer } from './player';
import { IRound } from './round';

export interface IGame extends Document {
  gameId: string;
  players: Array<IPlayer>;
  host: string;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  disconnectedPlayers: Array<IPlayer>;
}

const GameSchema: Schema = new Schema({
  gameId: { type: String, required: true, unique: true },
  host: { type: String, required: true },
  title: { type: String, required: false, default: 'Whatever Against Humanity' },
  players: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
  ],
  disconnectedPlayers: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }
  ],
  createdAt: { type: Date },
  updatedAt: { type: Date }
}, {
  timestamps: true,
  autoIndex: false
});

export default mongoose.model<IGame>('Game', GameSchema);
