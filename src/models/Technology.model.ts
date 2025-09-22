import mongoose, { Document, Schema } from 'mongoose';

export interface ITechnology extends Document {
  id: string;
  name: string;
  category: string;
  icon?: string;
  color?: string;
}

const TechnologySchema = new Schema<ITechnology>({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  category: {
    type: String,
    required: true,
    maxlength: 50
  },
  icon: {
    type: String,
    maxlength: 100
  },
  color: {
    type: String,
    maxlength: 7
  }
}, {
  _id: false // Используем id как _id
});

// Устанавливаем id как _id
TechnologySchema.pre('save', function(next) {
  this._id = this.id;
  next();
});

export const Technology = mongoose.model<ITechnology>('Technology', TechnologySchema);
