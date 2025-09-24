import mongoose, { Document, Schema } from 'mongoose';

export interface ITestimonial extends Document {
  userId?: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  customerName?: string;
  customerEmail?: string;
  eventName?: string;
  rating: number;
  review: string;
  title?: string;
  customerPhoto?: string;
  images?: string[];
  approved: boolean;
  isPublic: boolean;
  isFeatured: boolean;
  helpfulVotes: mongoose.Types.ObjectId[];
  adminResponse?: {
    message: string;
    respondedBy: mongoose.Types.ObjectId;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: false,
    default: null
  },
  bookingId: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: false,
    default: null
  },
  customerName: {
    type: String,
    trim: true,
    maxlength: [100, 'Customer name cannot exceed 100 characters']
  },
  customerEmail: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [255, 'Customer email cannot exceed 255 characters']
  },
  eventName: {
    type: String,
    trim: true,
    maxlength: [200, 'Event name cannot exceed 200 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  review: {
    type: String,
    required: [true, 'Review is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters'],
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  customerPhoto: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  approved: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  helpfulVotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  adminResponse: {
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Admin response cannot exceed 500 characters']
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Ensure one testimonial per user per event
TestimonialSchema.index({ userId: 1, eventId: 1 }, { unique: true, sparse: true });

// Other indexes for performance
TestimonialSchema.index({ eventId: 1 });
TestimonialSchema.index({ approved: 1 });
TestimonialSchema.index({ isFeatured: 1 });
TestimonialSchema.index({ rating: -1 });
TestimonialSchema.index({ createdAt: -1 });

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);