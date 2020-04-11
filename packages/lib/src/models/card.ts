import mongoose, { Schema, Document } from 'mongoose';
import { IPlayer } from './player';

export interface IBlackCard extends Document {
  text: string;
  deck: string;
  icon: string;
  pick: number;

}

const BlackCardSchema: Schema = new Schema({
  text: { type: String, default: "" },
  deck: { type: String, required: true },
  icon: { type: String, default: "" },
  pick: { type: Number, default: 1 }
});

export const BlackCard = mongoose.model<IBlackCard>('BlackCard', BlackCardSchema);


export interface IWhiteCard extends Document {
  text: string;
  deck: string;
  icon: string;

}

const WhiteCardSchema: Schema = new Schema({
  text: { type: String, default: "" },
  deck: { type: String, required: true },
  icon: { type: String, default: "" }
});

export const WhiteCard = mongoose.model<IWhiteCard>('WhiteCard', WhiteCardSchema);
