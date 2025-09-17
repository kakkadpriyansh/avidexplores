import mongoose, { Document, Schema } from 'mongoose';

export interface IPushNotification extends Document {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  // Targeting
  targetType: 'ALL' | 'USER' | 'ROLE' | 'SEGMENT' | 'DEVICE';
  targetUsers?: mongoose.Types.ObjectId[];
  targetRoles?: string[];
  targetSegment?: {
    hasBookings?: boolean;
    lastActivedays?: number;
    location?: string[];
    interests?: string[];
    deviceType?: string[];
  };
  targetDevices?: string[]; // FCM tokens
  // Scheduling
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED' | 'FAILED';
  scheduledAt?: Date;
  sentAt?: Date;
  // Notification settings
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  ttl?: number; // Time to live in seconds
  // Action settings
  action?: {
    type: 'URL' | 'DEEP_LINK' | 'NONE';
    url?: string;
    data?: any;
  };
  // Campaign info
  campaign?: {
    name: string;
    type: 'PROMOTIONAL' | 'TRANSACTIONAL' | 'REMINDER' | 'NEWS';
    tags: string[];
  };
  // Analytics
  analytics: {
    totalSent: number;
    delivered: number;
    clicked: number;
    dismissed: number;
    failed: number;
    deliveryRate: number;
    clickRate: number;
  };
  // Platform specific
  platforms: {
    android: boolean;
    ios: boolean;
    web: boolean;
  };
  // Advanced settings
  sound?: string;
  vibrate?: number[];
  silent?: boolean;
  sticky?: boolean;
  tag?: string; // For grouping notifications
  // Retry settings
  retryCount: number;
  maxRetries: number;
  lastRetryAt?: Date;
  errorMessage?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PushNotificationSchema = new Schema<IPushNotification>({
  title: {
    type: String,
    required: [true, 'Notification title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  body: {
    type: String,
    required: [true, 'Notification body is required'],
    trim: true,
    maxlength: [500, 'Body cannot exceed 500 characters']
  },
  icon: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  badge: {
    type: String,
    trim: true
  },
  targetType: {
    type: String,
    enum: ['ALL', 'USER', 'ROLE', 'SEGMENT', 'DEVICE'],
    required: true,
    default: 'ALL'
  },
  targetUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  targetRoles: [{
    type: String,
    enum: ['USER', 'GUIDE', 'ADMIN']
  }],
  targetSegment: {
    hasBookings: {
      type: Boolean
    },
    lastActivedays: {
      type: Number,
      min: 0
    },
    location: [{
      type: String,
      trim: true
    }],
    interests: [{
      type: String,
      trim: true
    }],
    deviceType: [{
      type: String,
      enum: ['android', 'ios', 'web']
    }]
  },
  targetDevices: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED', 'FAILED'],
    default: 'DRAFT'
  },
  scheduledAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['LOW', 'NORMAL', 'HIGH'],
    default: 'NORMAL'
  },
  ttl: {
    type: Number,
    min: 0,
    max: 2419200, // 28 days
    default: 86400 // 24 hours
  },
  action: {
    type: {
      type: String,
      enum: ['URL', 'DEEP_LINK', 'NONE'],
      default: 'NONE'
    },
    url: {
      type: String,
      trim: true
    },
    data: {
      type: Schema.Types.Mixed
    }
  },
  campaign: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Campaign name cannot exceed 100 characters']
    },
    type: {
      type: String,
      enum: ['PROMOTIONAL', 'TRANSACTIONAL', 'REMINDER', 'NEWS'],
      default: 'PROMOTIONAL'
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  analytics: {
    totalSent: {
      type: Number,
      default: 0,
      min: 0
    },
    delivered: {
      type: Number,
      default: 0,
      min: 0
    },
    clicked: {
      type: Number,
      default: 0,
      min: 0
    },
    dismissed: {
      type: Number,
      default: 0,
      min: 0
    },
    failed: {
      type: Number,
      default: 0,
      min: 0
    },
    deliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    clickRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  platforms: {
    android: {
      type: Boolean,
      default: true
    },
    ios: {
      type: Boolean,
      default: true
    },
    web: {
      type: Boolean,
      default: true
    }
  },
  sound: {
    type: String,
    trim: true,
    default: 'default'
  },
  vibrate: [{
    type: Number,
    min: 0
  }],
  silent: {
    type: Boolean,
    default: false
  },
  sticky: {
    type: Boolean,
    default: false
  },
  tag: {
    type: String,
    trim: true
  },
  retryCount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxRetries: {
    type: Number,
    default: 3,
    min: 0,
    max: 10
  },
  lastRetryAt: {
    type: Date
  },
  errorMessage: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
PushNotificationSchema.index({ status: 1, scheduledAt: 1 });
PushNotificationSchema.index({ targetType: 1 });
PushNotificationSchema.index({ 'campaign.type': 1, createdAt: -1 });
PushNotificationSchema.index({ 'campaign.tags': 1 });
PushNotificationSchema.index({ createdBy: 1, createdAt: -1 });
PushNotificationSchema.index({ sentAt: -1 });
PushNotificationSchema.index({ isActive: 1 });
PushNotificationSchema.index({ targetUsers: 1 });
PushNotificationSchema.index({ targetRoles: 1 });

// Text search index
PushNotificationSchema.index({
  title: 'text',
  body: 'text',
  'campaign.name': 'text'
});

// Pre-save middleware
PushNotificationSchema.pre('save', function(next) {
  // Calculate analytics rates
  if (this.analytics.totalSent > 0) {
    this.analytics.deliveryRate = Math.round((this.analytics.delivered / this.analytics.totalSent) * 100 * 100) / 100;
    this.analytics.clickRate = Math.round((this.analytics.clicked / this.analytics.totalSent) * 100 * 100) / 100;
  }

  // Set sent timestamp
  if (this.status === 'SENT' && !this.sentAt) {
    this.sentAt = new Date();
  }

  // Validate target configuration
  if (this.targetType === 'USER' && (!this.targetUsers || this.targetUsers.length === 0)) {
    return next(new Error('Target users must be specified when target type is USER'));
  }

  if (this.targetType === 'ROLE' && (!this.targetRoles || this.targetRoles.length === 0)) {
    return next(new Error('Target roles must be specified when target type is ROLE'));
  }

  if (this.targetType === 'DEVICE' && (!this.targetDevices || this.targetDevices.length === 0)) {
    return next(new Error('Target devices must be specified when target type is DEVICE'));
  }

  next();
});

// Virtual properties
PushNotificationSchema.virtual('isScheduled').get(function() {
  return this.status === 'SCHEDULED' && this.scheduledAt && this.scheduledAt > new Date();
});

PushNotificationSchema.virtual('isDue').get(function() {
  return this.status === 'SCHEDULED' && this.scheduledAt && this.scheduledAt <= new Date();
});

PushNotificationSchema.virtual('canRetry').get(function() {
  return this.status === 'FAILED' && this.retryCount < this.maxRetries;
});

PushNotificationSchema.virtual('engagementRate').get(function() {
  if (this.analytics.delivered === 0) return 0;
  return Math.round((this.analytics.clicked / this.analytics.delivered) * 100 * 100) / 100;
});

export default mongoose.models.PushNotification || mongoose.model<IPushNotification>('PushNotification', PushNotificationSchema);