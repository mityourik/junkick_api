import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  id: string;
  name: string;
  description?: string;
  variant?: string;
  color?: string;
}

const RoleSchema = new Schema<IRole>({
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
  variant: {
    type: String,
    maxlength: 20
  },
  color: {
    type: String,
    maxlength: 7
  }
}, {
  _id: false
});

RoleSchema.pre('save', function(next) {
  this._id = this.id;
  next();
});

export const Role = mongoose.model<IRole>('Role', RoleSchema);
