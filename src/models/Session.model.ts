import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'login' | 'logout';
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['login', 'logout'],
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

SessionSchema.index({ userId: 1 });
SessionSchema.index({ createdAt: 1 });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
