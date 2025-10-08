import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  bookingId: string; // Unique booking reference
  date: Date; // Selected event date
  selectedMonth?: string; // Selected month for seat tracking
  selectedYear?: number; // Selected year for seat tracking
  selectedDeparture?: string; // Selected departure label (e.g., "Rajkot to Rajkot")
  selectedTransportMode?: 'AC_TRAIN' | 'NON_AC_TRAIN' | 'FLIGHT' | 'BUS'; // Selected transport mode
  participants: {
    name: string;
    age: number;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    phone: string;
    email: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    medicalConditions?: string;
    dietaryRestrictions?: string;
  }[];
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
  paymentInfo: {
    paymentId?: string;
    paymentMethod: 'RAZORPAY' | 'BANK_TRANSFER' | 'CASH';
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
    transactionId?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    paidAt?: Date;
    refundId?: string;
    refundedAt?: Date;
    refundAmount?: number;
    failureReason?: string;
    disputeInfo?: {
      disputeId: string;
      amount: number;
      reasonCode: string;
      createdAt: Date;
    };
  };
  specialRequests?: string;
  adminNotes?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: mongoose.Types.ObjectId;
  confirmationSent: boolean;
  reminderSent: boolean;
  feedbackRequested: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Event ID is required']
  },
  bookingId: {
    type: String,
    required: [true, 'Booking ID is required'],
    unique: true,
    uppercase: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  selectedMonth: {
    type: String,
    trim: true
  },
  selectedYear: {
    type: Number,
    min: [2024, 'Year must be at least 2024']
  },
  selectedDeparture: {
    type: String,
    trim: true
  },
  selectedTransportMode: {
    type: String,
    enum: ['AC_TRAIN', 'NON_AC_TRAIN', 'FLIGHT', 'BUS']
  },
  participants: [{
    name: {
      type: String,
      required: [true, 'Participant name is required'],
      trim: true
    },
    age: {
      type: Number,
      required: [true, 'Participant age is required'],
      min: [1, 'Age must be at least 1'],
      max: [100, 'Age cannot exceed 100']
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      required: [true, 'Gender is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true
    },
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required']
      },
      phone: {
        type: String,
        required: [true, 'Emergency contact phone is required']
      },
      relationship: {
        type: String,
        required: [true, 'Emergency contact relationship is required']
      }
    },
    medicalConditions: String,
    dietaryRestrictions: String
  }],
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  finalAmount: {
    type: Number,
    required: [true, 'Final amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REFUNDED'],
    default: 'PENDING'
  },
  paymentInfo: {
    paymentId: String,
    paymentMethod: {
      type: String,
      enum: ['RAZORPAY', 'BANK_TRANSFER', 'CASH'],
      required: [true, 'Payment method is required']
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    transactionId: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    paidAt: Date,
    refundId: String,
    refundedAt: Date,
    refundAmount: {
      type: Number,
      min: [0, 'Refund amount cannot be negative']
    },
    failureReason: String,
    disputeInfo: {
      disputeId: String,
      amount: Number,
      reasonCode: String,
      createdAt: Date
    }
  },
  specialRequests: {
    type: String,
    maxlength: [500, 'Special requests cannot exceed 500 characters']
  },
  adminNotes: {
    type: String,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
  },
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
  },
  cancelledAt: Date,
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  confirmationSent: {
    type: Boolean,
    default: false
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  feedbackRequested: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate booking ID
BookingSchema.pre('save', function(next) {
  if (!this.bookingId) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingId = `AE${timestamp}${random}`;
  }
  next();
});

// Indexes for better performance
BookingSchema.index({ bookingId: 1 });
BookingSchema.index({ userId: 1 });
BookingSchema.index({ eventId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ date: 1 });
BookingSchema.index({ 'paymentInfo.paymentStatus': 1 });
BookingSchema.index({ createdAt: -1 });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);