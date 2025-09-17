import mongoose, { Document, Schema } from 'mongoose';

export interface IDestinationCard extends Document {
  title: string;
  photo: string;
  link: string;
  isActive: boolean;
  order: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DestinationCardSchema = new Schema<IDestinationCard>({
  title: {
    type: String,
    required: false,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  photo: {
    type: String,
    required: [true, 'Photo URL is required'],
    trim: true
  },
  link: {
    type: String,
    required: [true, 'Link is required'],
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes
DestinationCardSchema.index({ isActive: 1, order: 1 });
DestinationCardSchema.index({ createdBy: 1 });

const DestinationCard = mongoose.models.DestinationCard || mongoose.model<IDestinationCard>('DestinationCard', DestinationCardSchema);

export default DestinationCard;