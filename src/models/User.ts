import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN' | 'SUB_ADMIN' | 'GUIDE';
  permissions?: string[];
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences?: {
    newsletter: boolean;
    notifications: boolean;
  };
  isActive: boolean;
  emailVerified: boolean;
  // Enhanced admin management fields
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: Date;
  bannedBy?: mongoose.Types.ObjectId;
  roleChangedAt?: Date;
  roleChangedBy?: mongoose.Types.ObjectId;
  passwordResetRequired?: boolean;
  passwordResetRequestedAt?: Date;
  passwordResetRequestedBy?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  otp?: string;
  otpExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'SUB_ADMIN', 'GUIDE'],
    default: 'USER'
  },
  permissions: {
    type: [String],
    default: []
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  // Enhanced admin management fields
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    trim: true
  },
  bannedAt: {
    type: Date
  },
  bannedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  roleChangedAt: {
    type: Date
  },
  roleChangedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  passwordResetRequired: {
    type: Boolean,
    default: false
  },
  passwordResetRequestedAt: {
    type: Date
  },
  passwordResetRequestedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ isBanned: 1 });
UserSchema.index({ createdAt: -1 });

// Delete cached model to ensure schema updates are applied
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model<IUser>('User', UserSchema);