import { Schema, model, Document, Types } from 'mongoose';

export interface ISettlement extends Document {
  groupId: Types.ObjectId;
  payerId: Types.ObjectId;
  recipientId: Types.ObjectId;
  amount: number;
  date: Date;
  status: 'pending' | 'confirmed';
}

const SettlementSchema = new Schema<ISettlement>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    payerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'confirmed'], default: 'confirmed' },
  },
  { timestamps: true }
);

export const Settlement = model<ISettlement>('Settlement', SettlementSchema);
