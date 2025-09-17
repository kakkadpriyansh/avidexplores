import mongoose, { Document, Schema } from 'mongoose';

export interface IDeviceToken extends Document {
  user?: mongoose.Types.ObjectId;
  token: string;
  platform: 'android' | 'ios' | 'web';
  deviceInfo: {
    deviceId?: string;
    deviceName?: string;
    osVersion?: string;
    appVersion?: string;
    browser?: string;
    userAgent?: string;
  };
  // Notification preferences
  preferences: {
    enabled: boolean;
    promotional: boolean;
    transactional: boolean;
    reminders: boolean;
    news: boolean;
  };
  // Token status
  isActive: boolean;
  isValid: boolean;
  lastUsedAt: Date;
  invalidatedAt?: Date;
  invalidationReason?: string;
  // Location data (optional)
  location?: {
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
  };
  // Analytics
  analytics: {
    notificationsSent: number;
    notificationsDelivered: number;
    notificationsClicked: number;
    lastNotificationAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const DeviceTokenSchema = new Schema<IDeviceToken>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    sparse: true // Allow null for anonymous users
  },
  token: {
    type: String,
    required: [true, 'Device token is required'],
    unique: true,
    trim: true
  },
  platform: {
    type: String,
    enum: ['android', 'ios', 'web'],
    required: [true, 'Platform is required']
  },
  deviceInfo: {
    deviceId: {
      type: String,
      trim: true
    },
    deviceName: {
      type: String,
      trim: true,
      maxlength: [100, 'Device name cannot exceed 100 characters']
    },
    osVersion: {
      type: String,
      trim: true,
      maxlength: [50, 'OS version cannot exceed 50 characters']
    },
    appVersion: {
      type: String,
      trim: true,
      maxlength: [20, 'App version cannot exceed 20 characters']
    },
    browser: {
      type: String,
      trim: true,
      maxlength: [50, 'Browser cannot exceed 50 characters']
    },
    userAgent: {
      type: String,
      trim: true
    }
  },
  preferences: {
    enabled: {
      type: Boolean,
      default: true
    },
    promotional: {
      type: Boolean,
      default: true
    },
    transactional: {
      type: Boolean,
      default: true
    },
    reminders: {
      type: Boolean,
      default: true
    },
    news: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isValid: {
    type: Boolean,
    default: true
  },
  lastUsedAt: {
    type: Date,
    default: Date.now
  },
  invalidatedAt: {
    type: Date
  },
  invalidationReason: {
    type: String,
    trim: true,
    enum: ['TOKEN_EXPIRED', 'APP_UNINSTALLED', 'USER_DISABLED', 'INVALID_TOKEN', 'OTHER']
  },
  location: {
    country: {
      type: String,
      trim: true,
      maxlength: [100, 'Country cannot exceed 100 characters']
    },
    region: {
      type: String,
      trim: true,
      maxlength: [100, 'Region cannot exceed 100 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [100, 'City cannot exceed 100 characters']
    },
    timezone: {
      type: String,
      trim: true,
      maxlength: [50, 'Timezone cannot exceed 50 characters']
    }
  },
  analytics: {
    notificationsSent: {
      type: Number,
      default: 0,
      min: 0
    },
    notificationsDelivered: {
      type: Number,
      default: 0,
      min: 0
    },
    notificationsClicked: {
      type: Number,
      default: 0,
      min: 0
    },
    lastNotificationAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Indexes
DeviceTokenSchema.index({ token: 1 }, { unique: true });
DeviceTokenSchema.index({ user: 1, platform: 1 });
DeviceTokenSchema.index({ platform: 1, isActive: 1, isValid: 1 });
DeviceTokenSchema.index({ isActive: 1, isValid: 1, 'preferences.enabled': 1 });
DeviceTokenSchema.index({ lastUsedAt: -1 });
DeviceTokenSchema.index({ createdAt: -1 });
DeviceTokenSchema.index({ 'location.country': 1 });
DeviceTokenSchema.index({ 'location.timezone': 1 });

// TTL index to automatically remove old invalid tokens after 30 days
DeviceTokenSchema.index(
  { invalidatedAt: 1 },
  { 
    expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
    partialFilterExpression: { invalidatedAt: { $exists: true } }
  }
);

// Pre-save middleware
DeviceTokenSchema.pre('save', function(next) {
  // Set invalidation timestamp when token becomes invalid
  if (!this.isValid && !this.invalidatedAt) {
    this.invalidatedAt = new Date();
  }

  // Update last used timestamp
  if (this.isModified('analytics.notificationsSent') || 
      this.isModified('analytics.notificationsDelivered') || 
      this.isModified('analytics.notificationsClicked')) {
    this.lastUsedAt = new Date();
  }

  next();
});

// Static methods
DeviceTokenSchema.statics.findActiveTokens = function(criteria: any = {}) {
  return this.find({
    ...criteria,
    isActive: true,
    isValid: true,
    'preferences.enabled': true
  });
};

DeviceTokenSchema.statics.findTokensByUser = function(userId: string, platform?: string) {
  const query: any = {
    user: userId,
    isActive: true,
    isValid: true
  };
  
  if (platform) {
    query.platform = platform;
  }
  
  return this.find(query);
};

DeviceTokenSchema.statics.invalidateToken = function(token: string, reason: string) {
  return this.findOneAndUpdate(
    { token },
    {
      isValid: false,
      invalidatedAt: new Date(),
      invalidationReason: reason
    },
    { new: true }
  );
};

DeviceTokenSchema.statics.cleanupOldTokens = function(days: number = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.deleteMany({
    $or: [
      { lastUsedAt: { $lt: cutoffDate }, isValid: false },
      { invalidatedAt: { $lt: cutoffDate } }
    ]
  });
};

// Virtual properties
DeviceTokenSchema.virtual('deliveryRate').get(function() {
  if (this.analytics.notificationsSent === 0) return 0;
  return Math.round((this.analytics.notificationsDelivered / this.analytics.notificationsSent) * 100 * 100) / 100;
});

DeviceTokenSchema.virtual('clickRate').get(function() {
  if (this.analytics.notificationsDelivered === 0) return 0;
  return Math.round((this.analytics.notificationsClicked / this.analytics.notificationsDelivered) * 100 * 100) / 100;
});

DeviceTokenSchema.virtual('isStale').get(function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.lastUsedAt < thirtyDaysAgo;
});

export default mongoose.models.DeviceToken || mongoose.model<IDeviceToken>('DeviceToken', DeviceTokenSchema);