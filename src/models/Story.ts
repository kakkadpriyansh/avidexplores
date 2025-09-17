import mongoose, { Document, Schema } from 'mongoose';

export interface IStory extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  images?: string[];
  tags: string[];
  category: 'TRAVEL' | 'ADVENTURE' | 'CULTURE' | 'FOOD' | 'TIPS' | 'GUIDE';
  userId: mongoose.Types.ObjectId;
  eventId?: mongoose.Types.ObjectId;
  isPublished: boolean;
  isFeatured: boolean;
  readTime: number; // in minutes
  views: number;
  likes: mongoose.Types.ObjectId[];
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>({
  title: {
    type: String,
    required: [true, 'Story title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [100, 'Content must be at least 100 characters']
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  coverImage: {
    type: String,
    required: [true, 'Cover image is required']
  },
  images: [{
    type: String
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  category: {
    type: String,
    enum: ['TRAVEL', 'ADVENTURE', 'CULTURE', 'FOOD', 'TIPS', 'GUIDE'],
    required: [true, 'Category is required']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Number,
    required: true,
    min: [1, 'Read time must be at least 1 minute']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  seo: {
    metaTitle: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [String]
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Pre-save middleware to set publishedAt when story is published
StorySchema.pre('save', function(next) {
  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Calculate read time based on content length
StorySchema.pre('save', function(next) {
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  next();
});

// Indexes for better performance
StorySchema.index({ slug: 1 });
StorySchema.index({ userId: 1 });
StorySchema.index({ category: 1 });
StorySchema.index({ isPublished: 1 });
StorySchema.index({ isFeatured: 1 });
StorySchema.index({ tags: 1 });
StorySchema.index({ publishedAt: -1 });
StorySchema.index({ views: -1 });

export default mongoose.models.Story || mongoose.model<IStory>('Story', StorySchema);