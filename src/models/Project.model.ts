import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description: string;
  status: 'активный' | 'завершен' | 'приостановлен' | 'в поиске команды';
  lookingFor: string;
  category: string;
  tech: string[];
  neededRoles: string[];
  teamSize: number;
  currentTeam: number;
  budget: string;
  timeline: string;
  complexity: 'простой' | 'средний' | 'сложный';
  image: string;
  features: string[];
  requirements: string[];
  ownerId: mongoose.Types.ObjectId;
  teamMembers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['активный', 'завершен', 'приостановлен', 'в поиске команды'],
    required: true,
    default: 'в поиске команды'
  },
  lookingFor: {
    type: String,
    required: true,
    maxlength: 500
  },
  category: {
    type: String,
    required: true,
    index: true
  },
  tech: [{
    type: String,
    required: true
  }],
  neededRoles: [{
    type: String,
    required: true
  }],
  teamSize: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  currentTeam: {
    type: Number,
    required: true,
    default: 1,
    min: 1,
    max: 50
  },
  budget: {
    type: String,
    required: true,
    maxlength: 100
  },
  timeline: {
    type: String,
    required: true,
    maxlength: 100
  },
  complexity: {
    type: String,
    enum: ['простой', 'средний', 'сложный'],
    required: true
  },
  image: {
    type: String,
    required: true,
    maxlength: 500
  },
  features: [{
    type: String,
    required: true,
    maxlength: 200
  }],
  requirements: [{
    type: String,
    required: true,
    maxlength: 200
  }],
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  teamMembers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ 
  name: 'text', 
  description: 'text' 
}, {
  weights: { name: 10, description: 5 }
});

ProjectSchema.pre('save', function(next) {
  if (this.currentTeam > this.teamSize) {
    next(new Error('currentTeam не может быть больше teamSize'));
  } else {
    next();
  }
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
