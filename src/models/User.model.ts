import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  customId: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'тимлид' | 'заказчик' | 'разработчик' | 'дизайнер' | 'тестировщик' | 'джун';
  avatar?: string;
  skills: string[];
  bio?: string;
  experience: number;
  location?: string;
  portfolio?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  customId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
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
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'тимлид', 'заказчик', 'разработчик', 'дизайнер', 'тестировщик', 'джун'],
    required: true,
    default: 'джун'
  },
  avatar: {
    type: String,
    default: null
  },
  skills: [{
    type: String,
    required: true
  }],
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

// Индексы
UserSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);
