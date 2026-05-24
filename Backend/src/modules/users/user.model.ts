import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email?: string;
  password?: string;
  avatarColor?: string;
  avatarUrl?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, select: false },
    avatarColor: { type: String },
    avatarUrl: { type: String },
    refreshToken: { type: String, select: false },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
