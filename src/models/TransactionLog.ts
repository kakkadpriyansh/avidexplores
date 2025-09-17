import mongoose, { Document, Schema } from 'mongoose';

export interface ITransactionLog extends Document {
  // Transaction identification
  transactionId: string;
  bookingId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  
  // Transaction details
  type: 'payment' | 'refund' | 'partial_refund' | 'cancellation_fee' | 'processing_fee' | 'discount' | 'promo_code' | 'adjustment';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'disputed' | 'refunded';
  
  // Financial information
  amount: {
    gross: number;        // Total amount before fees/taxes
    net: number;          // Amount after fees/taxes
    tax: number;          // Tax amount
    processingFee: number; // Payment processing fee
    platformFee: number;   // Platform commission
    discount: number;      // Discount applied
  };
  
  currency: string;
  exchangeRate?: number; // If different from base currency
  
  // Payment method and gateway
  paymentMethod: 'razorpay' | 'paypal' | 'bank_transfer' | 'cash' | 'wallet' | 'upi' | 'card' | 'net_banking';
  paymentGateway: string;
  gatewayTransactionId?: string;
  gatewayResponse?: any;
  
  // Related entities
  eventId?: mongoose.Types.ObjectId;
  promoCodeId?: mongoose.Types.ObjectId;
  
  // Transaction metadata
  description: string;
  internalNotes?: string;
  customerNotes?: string;
  
  // Timestamps
  initiatedAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  
  // Reconciliation
  isReconciled: boolean;
  reconciledAt?: Date;
  reconciledBy?: mongoose.Types.ObjectId;
  
  // Audit trail
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Additional data
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceInfo?: string;
    location?: {
      country?: string;
      state?: string;
      city?: string;
    };
    riskScore?: number;
    fraudFlags?: string[];
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const TransactionLogSchema = new Schema<ITransactionLog>({
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true,
    trim: true,
    index: true
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    index: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  type: {
    type: String,
    enum: ['payment', 'refund', 'partial_refund', 'cancellation_fee', 'processing_fee', 'discount', 'promo_code', 'adjustment'],
    required: [true, 'Transaction type is required'],
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'disputed', 'refunded'],
    required: [true, 'Transaction status is required'],
    default: 'pending',
    index: true
  },
  
  amount: {
    gross: {
      type: Number,
      required: [true, 'Gross amount is required'],
      min: [0, 'Gross amount cannot be negative']
    },
    net: {
      type: Number,
      required: [true, 'Net amount is required'],
      min: [0, 'Net amount cannot be negative']
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative']
    },
    processingFee: {
      type: Number,
      default: 0,
      min: [0, 'Processing fee cannot be negative']
    },
    platformFee: {
      type: Number,
      default: 0,
      min: [0, 'Platform fee cannot be negative']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative']
    }
  },
  
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    uppercase: true,
    minlength: [3, 'Currency code must be 3 characters'],
    maxlength: [3, 'Currency code must be 3 characters'],
    default: 'INR'
  },
  exchangeRate: {
    type: Number,
    min: [0, 'Exchange rate cannot be negative']
  },
  
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'paypal', 'bank_transfer', 'cash', 'wallet', 'upi', 'card', 'net_banking'],
    required: [true, 'Payment method is required'],
    index: true
  },
  paymentGateway: {
    type: String,
    required: [true, 'Payment gateway is required'],
    trim: true
  },
  gatewayTransactionId: {
    type: String,
    trim: true,
    index: true
  },
  gatewayResponse: {
    type: Schema.Types.Mixed
  },
  
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    index: true
  },
  promoCodeId: {
    type: Schema.Types.ObjectId,
    ref: 'PromoCode'
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Internal notes cannot exceed 1000 characters']
  },
  customerNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Customer notes cannot exceed 500 characters']
  },
  
  initiatedAt: {
    type: Date,
    required: [true, 'Initiated date is required'],
    default: Date.now,
    index: true
  },
  processedAt: {
    type: Date,
    index: true
  },
  completedAt: {
    type: Date,
    index: true
  },
  failedAt: {
    type: Date
  },
  
  isReconciled: {
    type: Boolean,
    default: false,
    index: true
  },
  reconciledAt: {
    type: Date
  },
  reconciledBy: {
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
  
  metadata: {
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    deviceInfo: { type: String, trim: true },
    location: {
      country: { type: String, trim: true },
      state: { type: String, trim: true },
      city: { type: String, trim: true }
    },
    riskScore: {
      type: Number,
      min: [0, 'Risk score cannot be negative'],
      max: [100, 'Risk score cannot exceed 100']
    },
    fraudFlags: [{ type: String, trim: true }]
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
TransactionLogSchema.index({ userId: 1, createdAt: -1 });
TransactionLogSchema.index({ bookingId: 1, type: 1 });
TransactionLogSchema.index({ status: 1, createdAt: -1 });
TransactionLogSchema.index({ paymentMethod: 1, status: 1 });
TransactionLogSchema.index({ type: 1, status: 1, createdAt: -1 });
TransactionLogSchema.index({ isReconciled: 1, completedAt: -1 });
TransactionLogSchema.index({ 'amount.gross': -1, createdAt: -1 });
TransactionLogSchema.index({ currency: 1, createdAt: -1 });

// Text search index
TransactionLogSchema.index({
  transactionId: 'text',
  description: 'text',
  gatewayTransactionId: 'text'
});

// Pre-save middleware
TransactionLogSchema.pre('save', function(next) {
  // Auto-generate transaction ID if not provided
  if (!this.transactionId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.transactionId = `TXN_${timestamp}_${random}`.toUpperCase();
  }
  
  // Set processed/completed timestamps based on status
  if (this.isModified('status')) {
    const now = new Date();
    
    if (this.status === 'processing' && !this.processedAt) {
      this.processedAt = now;
    }
    
    if (['completed', 'refunded'].includes(this.status) && !this.completedAt) {
      this.completedAt = now;
    }
    
    if (['failed', 'cancelled'].includes(this.status) && !this.failedAt) {
      this.failedAt = now;
    }
  }
  
  // Validate amount consistency
  if (this.amount) {
    const calculatedNet = this.amount.gross - this.amount.tax - this.amount.processingFee - this.amount.platformFee + this.amount.discount;
    if (Math.abs(calculatedNet - this.amount.net) > 0.01) {
      return next(new Error('Net amount calculation is inconsistent'));
    }
  }
  
  next();
});

// Static methods
TransactionLogSchema.statics.generateTransactionId = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `TXN_${timestamp}_${random}`.toUpperCase();
};

TransactionLogSchema.statics.getRevenueStats = function(startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        type: { $in: ['payment', 'processing_fee', 'platform_fee'] },
        completedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$amount.gross' },
        netRevenue: { $sum: '$amount.net' },
        totalTax: { $sum: '$amount.tax' },
        totalProcessingFees: { $sum: '$amount.processingFee' },
        totalPlatformFees: { $sum: '$amount.platformFee' },
        totalDiscount: { $sum: '$amount.discount' },
        transactionCount: { $sum: 1 }
      }
    }
  ]);
};

TransactionLogSchema.statics.getPaymentMethodStats = function(startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        status: 'completed',
        completedAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount.gross' },
        avgAmount: { $avg: '$amount.gross' }
      }
    },
    { $sort: { totalAmount: -1 } }
  ]);
};

TransactionLogSchema.statics.getUnreconciledTransactions = function() {
  return this.find({
    status: 'completed',
    isReconciled: false,
    completedAt: { $exists: true }
  }).populate('userId', 'name email').populate('bookingId', 'bookingId');
};

// Virtual properties
TransactionLogSchema.virtual('isSuccessful').get(function() {
  return this.status === 'completed';
});

TransactionLogSchema.virtual('isFailed').get(function() {
  return ['failed', 'cancelled'].includes(this.status);
});

TransactionLogSchema.virtual('processingTime').get(function() {
  if (this.completedAt && this.initiatedAt) {
    return this.completedAt.getTime() - this.initiatedAt.getTime();
  }
  return null;
});

TransactionLogSchema.virtual('formattedAmount').get(function() {
  const symbol = this.currency === 'INR' ? '₹' : this.currency === 'USD' ? '$' : this.currency;
  return `${symbol}${this.amount.gross.toFixed(2)}`;
});

export default mongoose.models.TransactionLog || mongoose.model<ITransactionLog>('TransactionLog', TransactionLogSchema);