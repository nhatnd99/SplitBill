import { Schema, model, Document, Types } from 'mongoose';

export interface IFundTransaction {
  amount: number;
  date: Date;
  userId: Types.ObjectId;
  userName: string;
  note: string;
}

export interface IGroup extends Document {
  name: string;
  description?: string;
  inviteCode: string;
  members: Types.ObjectId[];
  createdBy: Types.ObjectId;
  category: string;
  totalExpense: number;
  fundBalance: number;
  fundHistory: IFundTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    description: { type: String },
    inviteCode: { type: String, required: true, unique: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, default: 'other' },
    totalExpense: { type: Number, default: 0 },
    fundBalance: { type: Number, default: 0 },
    fundHistory: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        userName: { type: String, required: true },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Group = model<IGroup>('Group', GroupSchema);
