import { Schema, model, Document, Types } from 'mongoose';

export type ActivityType = 'expense_add' | 'expense_update' | 'expense_delete' | 'settlement' | 'group_create' | 'member_joined' | 'fund_added';

export interface IActivity extends Document {
  groupId: Types.ObjectId;
  type: ActivityType;
  userId: Types.ObjectId;
  userName: string;
  details: any;
  timestamp: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    type: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Activity = model<IActivity>('Activity', ActivitySchema);
