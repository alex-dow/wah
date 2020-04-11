import mongoose, { Schema, Document } from 'mongoose';
import { IPlayer } from './player';
import { IBlackCard } from './card';

export interface IGame extends Document {
  gameId: string;
  players: Array<IPlayer>;
  host: IPlayer;
  createdAt: Date;
  updatedAt: Date;
  title?: string;
  disconnectedPlayers: Array<IPlayer>;
  usedBlackCards: Array<IBlackCard>;

}

const GameSchema: Schema = new Schema({
  gameId: { type: String, required: true, unique: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
  title: { type: String, required: false, default: 'Whatever Against Humanity' },
  players: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  disconnectedPlayers: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Player' } ],
  usedBlackCards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'BlackCard'}],
  createdAt: { type: Date },
  updatedAt: { type: Date }
}, {
  timestamps: true
});

export default mongoose.model<IGame>('Game', GameSchema);
