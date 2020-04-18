import mongoose, { Schema, Document } from 'mongoose';

export interface IBlackCard extends Document {
  text: string;
  deck: ICardDeck;
  icon: string;
  pick: number;

}

const BlackCardSchema: Schema = new Schema({
  text: { type: String, default: "" },
  deck: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'CardDeck' },
  icon: { type: String, default: "" },
  pick: { type: Number, default: 1 }
});

export const BlackCard = mongoose.model<IBlackCard>('BlackCard', BlackCardSchema);


export interface IWhiteCard extends Document {
  text: string;
  deck: ICardDeck;
  icon: string;

}

const WhiteCardSchema: Schema = new Schema({
  text: { type: String, default: "" },
  deck: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'CardDeck' },
  icon: { type: String, default: "" }
});

export const WhiteCard = mongoose.model<IWhiteCard>('WhiteCard', WhiteCardSchema);


export interface ICardDeck extends Document {
  name: string;
  official: boolean;
  description: string;
  icon: string;
  deckKey: string;
  totalWhiteCards: number;
  totalBlackCards: number;
}

const CardDeckSchema: Schema = new Schema({
  name: { type: String, required: true },
  official: { type: Boolean, default: false },
  description: { type: String },
  icon: { type: String },
  deckKey: { type: String, required: true, unique: true },
  totalBlackCards: { type: Number, default: 0 },
  totalWhiteCards: { type: Number, default: 0 }
});

export const CardDeck = mongoose.model<ICardDeck>('CardDeck', CardDeckSchema);