import mongoose, { Document, Schema } from 'mongoose';

export interface IInquiry extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  adventureInterest?: string;
  message: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  adventureInterest: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['NEW', 'IN_PROGRESS', 'RESOLVED'],
    default: 'NEW'
  }
}, {
  timestamps: true
});

// Ensure consistent typing to avoid union-callable issues in TypeScript
const InquiryModel: mongoose.Model<IInquiry> =
  (mongoose.models.Inquiry as mongoose.Model<IInquiry>) || mongoose.model<IInquiry>('Inquiry', InquirySchema);

export default InquiryModel;