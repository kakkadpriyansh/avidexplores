import mongoose, { Document, Schema } from 'mongoose';

export interface IPromoCodeUsage extends Document {
  promoCode: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  booking: mongoose.Types.ObjectId;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PromoCodeUsageSchema = new Schema<IPromoCodeUsage>({
  promoCode: {
    type: Schema.Types.ObjectId,
    ref: 'PromoCode',
    required: [true, 'Promo code reference is required']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking reference is required']
  },
  originalAmount: {
    type: Number,
    required: [true, 'Original amount is required'],
    min: [0, 'Original amount cannot be negative']
  },
  discountAmount: {
    type: Number,
    required: [true, 'Discount amount is required'],
    min: [0, 'Discount amount cannot be negative']
  },
  finalAmount: {
    type: Number,
    required: [true, 'Final amount is required'],
    min: [0, 'Final amount cannot be negative']
  },
  usedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance and analytics
PromoCodeUsageSchema.index({ promoCode: 1 });
PromoCodeUsageSchema.index({ user: 1 });
PromoCodeUsageSchema.index({ booking: 1 });
PromoCodeUsageSchema.index({ usedAt: 1 });
PromoCodeUsageSchema.index({ promoCode: 1, user: 1 }); // Compound index for user usage tracking
PromoCodeUsageSchema.index({ promoCode: 1, usedAt: 1 }); // Compound index for time-based analytics

// Ensure one usage record per booking
PromoCodeUsageSchema.index({ booking: 1 }, { unique: true });

export default mongoose.models.PromoCodeUsage || mongoose.model<IPromoCodeUsage>('PromoCodeUsage', PromoCodeUsageSchema);