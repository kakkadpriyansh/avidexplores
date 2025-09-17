import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscriber extends Document {
  email: string;
  name?: string;
  source: 'NEWSLETTER' | 'COMING_SOON' | 'FOOTER' | 'POPUP' | 'EVENT_PAGE';
  isActive: boolean;
  preferences: {
    eventUpdates: boolean;
    storyUpdates: boolean;
    promotions: boolean;
    weeklyDigest: boolean;
  };
  tags: string[];
  lastEmailSent?: Date;
  unsubscribedAt?: Date;
  unsubscribeReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriberSchema = new Schema<ISubscriber>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  source: {
    type: String,
    enum: ['NEWSLETTER', 'COMING_SOON', 'FOOTER', 'POPUP', 'EVENT_PAGE'],
    required: [true, 'Source is required'],
    default: 'NEWSLETTER'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  preferences: {
    eventUpdates: {
      type: Boolean,
      default: true
    },
    storyUpdates: {
      type: Boolean,
      default: true
    },
    promotions: {
      type: Boolean,
      default: true
    },
    weeklyDigest: {
      type: Boolean,
      default: false
    }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  lastEmailSent: {
    type: Date
  },
  unsubscribedAt: {
    type: Date
  },
  unsubscribeReason: {
    type: String,
    maxlength: [200, 'Unsubscribe reason cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Pre-save middleware to set unsubscribedAt when isActive becomes false
SubscriberSchema.pre('save', function(next) {
  if (!this.isActive && !this.unsubscribedAt) {
    this.unsubscribedAt = new Date();
  }
  next();
});

// Indexes for better performance
SubscriberSchema.index({ email: 1 });
SubscriberSchema.index({ isActive: 1 });
SubscriberSchema.index({ source: 1 });
SubscriberSchema.index({ tags: 1 });
SubscriberSchema.index({ createdAt: -1 });

export default mongoose.models.Subscriber || mongoose.model<ISubscriber>('Subscriber', SubscriberSchema);