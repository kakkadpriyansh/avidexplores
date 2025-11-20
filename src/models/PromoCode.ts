import mongoose, { Document, Schema } from 'mongoose';

export interface IPromoCode extends Document {
  code: string;
  description: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number; // percentage (0-100) or fixed amount
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number; // per user limit
  validFrom: Date;
  validUntil: Date;
  applicableEvents?: mongoose.Types.ObjectId[]; // specific events
  applicableCategories?: string[]; // event categories
  excludedEvents?: mongoose.Types.ObjectId[];
  isActive: boolean;
  isPublic: boolean; // public codes vs private/targeted codes
  targetUsers?: mongoose.Types.ObjectId[]; // specific users who can use this code
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>({
  code: {
    type: String,
    required: [true, 'Promo code is required'],
    uppercase: true,
    trim: true,
    minlength: [3, 'Code must be at least 3 characters'],
    maxlength: [20, 'Code cannot exceed 20 characters'],
    match: [/^[A-Z0-9]+$/, 'Code can only contain uppercase letters and numbers']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
    required: [true, 'Discount type is required']
  },
  value: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Value cannot be negative']
  },
  minOrderAmount: {
    type: Number,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maxDiscountAmount: {
    type: Number,
    min: [0, 'Maximum discount amount cannot be negative']
  },
  usageLimit: {
    type: Number,
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  userUsageLimit: {
    type: Number,
    min: [1, 'User usage limit must be at least 1']
  },
  validFrom: {
    type: Date,
    required: [true, 'Valid from date is required']
  },
  validUntil: {
    type: Date,
    required: [true, 'Valid until date is required']
  },
  applicableEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }],
  applicableCategories: [{
    type: String,
    enum: ['TREKKING', 'CAMPING', 'WILDLIFE', 'CULTURAL', 'ADVENTURE', 'SPIRITUAL']
  }],
  excludedEvents: [{
    type: Schema.Types.ObjectId,
    ref: 'Event'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  targetUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Validation: validUntil must be after validFrom
PromoCodeSchema.pre('save', function(next) {
  if (this.validUntil <= this.validFrom) {
    next(new Error('Valid until date must be after valid from date'));
  } else {
    next();
  }
});

// Validation: percentage value should be between 0-100
PromoCodeSchema.pre('save', function(next) {
  if (this.type === 'PERCENTAGE' && (this.value < 0 || this.value > 100)) {
    next(new Error('Percentage value must be between 0 and 100'));
  } else {
    next();
  }
});

// Indexes for performance
PromoCodeSchema.index({ code: 1 }, { unique: true });
PromoCodeSchema.index({ isActive: 1 });
PromoCodeSchema.index({ validFrom: 1, validUntil: 1 });
PromoCodeSchema.index({ applicableCategories: 1 });
PromoCodeSchema.index({ createdBy: 1 });
PromoCodeSchema.index({ isPublic: 1 });

// Virtual for checking if code is currently valid
PromoCodeSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now &&
         (!this.usageLimit || this.usageCount < this.usageLimit);
});

// Virtual for remaining usage
PromoCodeSchema.virtual('remainingUsage').get(function() {
  if (!this.usageLimit) return null;
  return Math.max(0, this.usageLimit - this.usageCount);
});

export default mongoose.models.PromoCode || mongoose.model<IPromoCode>('PromoCode', PromoCodeSchema);