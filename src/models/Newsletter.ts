import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletter extends Document {
  title: string;
  subject: string;
  content: string;
  htmlContent?: string;
  templateId?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENT' | 'CANCELLED';
  scheduledAt?: Date;
  sentAt?: Date;
  // Targeting
  targetAudience: {
    type: 'ALL' | 'SUBSCRIBERS' | 'CUSTOMERS' | 'SEGMENT';
    segmentCriteria?: {
      userRole?: string[];
      hasBookings?: boolean;
      lastBookingDays?: number;
      location?: string[];
      interests?: string[];
      joinedAfter?: Date;
      joinedBefore?: Date;
    };
  };
  // Campaign settings
  campaign: {
    name: string;
    type: 'PROMOTIONAL' | 'NEWSLETTER' | 'ANNOUNCEMENT' | 'REMINDER';
    tags: string[];
  };
  // Analytics
  analytics: {
    totalSent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
    complained: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
  };
  // A/B Testing
  abTest?: {
    enabled: boolean;
    variants: {
      name: string;
      subject: string;
      content: string;
      percentage: number;
    }[];
    winnerCriteria: 'OPEN_RATE' | 'CLICK_RATE';
    testDuration: number; // hours
  };
  // Attachments
  attachments?: {
    filename: string;
    url: string;
    size: number;
  }[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NewsletterSchema = new Schema<INewsletter>({
  title: {
    type: String,
    required: [true, 'Newsletter title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  subject: {
    type: String,
    required: [true, 'Email subject is required'],
    trim: true,
    maxlength: [150, 'Subject cannot exceed 150 characters']
  },
  content: {
    type: String,
    required: [true, 'Newsletter content is required']
  },
  htmlContent: {
    type: String
  },
  templateId: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED'],
    default: 'DRAFT'
  },
  scheduledAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  targetAudience: {
    type: {
      type: String,
      enum: ['ALL', 'SUBSCRIBERS', 'CUSTOMERS', 'SEGMENT'],
      required: true,
      default: 'SUBSCRIBERS'
    },
    segmentCriteria: {
      userRole: [{
        type: String,
        enum: ['USER', 'GUIDE', 'ADMIN']
      }],
      hasBookings: {
        type: Boolean
      },
      lastBookingDays: {
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
      joinedAfter: {
        type: Date
      },
      joinedBefore: {
        type: Date
      }
    }
  },
  campaign: {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
      maxlength: [100, 'Campaign name cannot exceed 100 characters']
    },
    type: {
      type: String,
      enum: ['PROMOTIONAL', 'NEWSLETTER', 'ANNOUNCEMENT', 'REMINDER'],
      required: true
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
    opened: {
      type: Number,
      default: 0,
      min: 0
    },
    clicked: {
      type: Number,
      default: 0,
      min: 0
    },
    unsubscribed: {
      type: Number,
      default: 0,
      min: 0
    },
    bounced: {
      type: Number,
      default: 0,
      min: 0
    },
    complained: {
      type: Number,
      default: 0,
      min: 0
    },
    openRate: {
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
    },
    unsubscribeRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  abTest: {
    enabled: {
      type: Boolean,
      default: false
    },
    variants: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      subject: {
        type: String,
        required: true,
        trim: true
      },
      content: {
        type: String,
        required: true
      },
      percentage: {
        type: Number,
        required: true,
        min: 1,
        max: 100
      }
    }],
    winnerCriteria: {
      type: String,
      enum: ['OPEN_RATE', 'CLICK_RATE'],
      default: 'OPEN_RATE'
    },
    testDuration: {
      type: Number,
      default: 24,
      min: 1,
      max: 168 // 1 week
    }
  },
  attachments: [{
    filename: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    size: {
      type: Number,
      required: true,
      min: 0
    }
  }],
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
NewsletterSchema.index({ status: 1, scheduledAt: 1 });
NewsletterSchema.index({ 'campaign.type': 1, createdAt: -1 });
NewsletterSchema.index({ 'campaign.tags': 1 });
NewsletterSchema.index({ createdBy: 1, createdAt: -1 });
NewsletterSchema.index({ sentAt: -1 });
NewsletterSchema.index({ isActive: 1 });

// Text search index
NewsletterSchema.index({
  title: 'text',
  subject: 'text',
  content: 'text',
  'campaign.name': 'text'
});

// Pre-save middleware
NewsletterSchema.pre('save', function(next) {
  // Calculate analytics rates
  if (this.analytics.totalSent > 0) {
    this.analytics.openRate = Math.round((this.analytics.opened / this.analytics.totalSent) * 100 * 100) / 100;
    this.analytics.clickRate = Math.round((this.analytics.clicked / this.analytics.totalSent) * 100 * 100) / 100;
    this.analytics.unsubscribeRate = Math.round((this.analytics.unsubscribed / this.analytics.totalSent) * 100 * 100) / 100;
  }

  // Validate A/B test percentages
  if (this.abTest?.enabled && this.abTest.variants.length > 0) {
    const totalPercentage = this.abTest.variants.reduce((sum, variant) => sum + variant.percentage, 0);
    if (totalPercentage !== 100) {
      return next(new Error('A/B test variant percentages must sum to 100'));
    }
  }

  // Set sent timestamp
  if (this.status === 'SENT' && !this.sentAt) {
    this.sentAt = new Date();
  }

  next();
});

// Virtual properties
NewsletterSchema.virtual('isScheduled').get(function() {
  return this.status === 'SCHEDULED' && this.scheduledAt && this.scheduledAt > new Date();
});

NewsletterSchema.virtual('isDue').get(function() {
  return this.status === 'SCHEDULED' && this.scheduledAt && this.scheduledAt <= new Date();
});

NewsletterSchema.virtual('engagementRate').get(function() {
  if (this.analytics.totalSent === 0) return 0;
  return Math.round(((this.analytics.opened + this.analytics.clicked) / this.analytics.totalSent) * 100 * 100) / 100;
});

export default mongoose.models.Newsletter || mongoose.model<INewsletter>('Newsletter', NewsletterSchema);