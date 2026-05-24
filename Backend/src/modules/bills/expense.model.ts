import { Schema, model, Document, Types } from 'mongoose';

export type PaymentSourceType = 'GROUP_FUND' | 'MEMBER';
export type SplitType = 'equal' | 'percentage' | 'exact' | 'item';

export interface IPaymentSource {
  type: PaymentSourceType;
  memberId?: Types.ObjectId;
  amount: number;
}

export interface IExpenseSplit {
  userId: Types.ObjectId;
  amount: number;
  percentage?: number;
}

export interface IExpense extends Document {
  groupId: Types.ObjectId;
  title: string;
  amount: number;
  paymentSources: IPaymentSource[];
  splitType: SplitType;
  splits: IExpenseSplit[];
  notes?: string;
  category: string;
  date: Date;
  createdBy: Types.ObjectId;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentSources: [
      {
        type: { type: String, enum: ['GROUP_FUND', 'MEMBER'], required: true },
        memberId: { type: Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number, required: true },
      },
    ],
    splitType: { type: String, enum: ['equal', 'percentage', 'exact', 'item'], required: true },
    splits: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        percentage: { type: Number },
      },
    ],
    notes: { type: String },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Expense = model<IExpense>('Expense', ExpenseSchema);
