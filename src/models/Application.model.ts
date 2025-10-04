import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
  projectId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  role: string;
  message: string;
  status: 'new' | 'рассматривается' | 'принято' | 'отклонено';
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  role: {
    type: String,
    required: true,
    maxlength: 50
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['new', 'рассматривается', 'принято', 'отклонено'],
    default: 'new'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

ApplicationSchema.index({ projectId: 1 });
ApplicationSchema.index({ userId: 1 });

export const Application = mongoose.model<IApplication>('Application', ApplicationSchema);
