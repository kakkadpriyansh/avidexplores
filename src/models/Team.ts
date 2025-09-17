import mongoose, { Document, Schema } from 'mongoose';

export interface ITeam extends Document {
  name: string;
  role: string;
  teamType: 'Founders' | 'Core Team';
  experience?: string;
  image?: string;
  specialties?: string[];
  bio?: string;
  email?: string;
  phone?: string;
  socialMedia?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
  };
  isActive: boolean;
  order: number; // For sorting team members display order
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TeamSchema = new Schema<ITeam>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  teamType: {
    type: String,
    required: [true, 'Team type is required'],
    enum: ['Founders', 'Core Team'],
    default: 'Core Team'
  },
  experience: {
    type: String,
    required: false,
    trim: true,
    maxlength: [50, 'Experience cannot exceed 50 characters']
  },
  image: {
    type: String,
    required: false,
    trim: true
  },
  specialties: {
    type: [String],
    default: [],
  },
  bio: {
    type: String,
    required: false,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  socialMedia: {
    linkedin: {
      type: String,
      required: false,
      trim: true
    },
    instagram: {
      type: String,
      required: false,
      trim: true
    },
    twitter: {
      type: String,
      required: false,
      trim: true
    },
    facebook: {
      type: String,
      required: false,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0,
    min: [0, 'Order cannot be negative']
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for performance
TeamSchema.index({ isActive: 1 });
TeamSchema.index({ order: 1 });
TeamSchema.index({ createdBy: 1 });
TeamSchema.index({ name: 1 });
TeamSchema.index({ teamType: 1 });

export default mongoose.models.Team || mongoose.model<ITeam>('Team', TeamSchema);