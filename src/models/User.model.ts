import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'тимлид' | 'заказчик' | 'разработчик' | 'дизайнер' | 'тестировщик';
  avatar?: string;
  skills: string;
  bio?: string;
  experience: number;
  location?: string;
  portfolio?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'тимлид', 'заказчик', 'разработчик', 'дизайнер', 'тестировщик'],
    required: true,
    default: 'разработчик'
  },
  avatar: {
    type: String,
    default: null
  },
  skills: {
    type: String,
    required: true,
    maxlength: 500
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  experience: {
    type: Number,
    required: true,
    min: 0,
    max: 50
  },
  location: {
    type: String,
    maxlength: 100
  },
  portfolio: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

UserSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);
