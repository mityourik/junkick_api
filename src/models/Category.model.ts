import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

const CategorySchema = new Schema<ICategory>({
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
  description: {
    type: String,
    maxlength: 200
  },
  color: {
    type: String,
    maxlength: 7
  }
}, {
  _id: false // Используем id как _id
});

// Устанавливаем id как _id
CategorySchema.pre('save', function(next) {
  this._id = this.id;
  next();
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
