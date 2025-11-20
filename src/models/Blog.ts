import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  images?: string[];
  author: mongoose.Types.ObjectId;
  category: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt?: Date;
  scheduledAt?: Date;
  readTime?: number; // in minutes
  views: number;
  likes: number;
  // SEO fields
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    noIndex?: boolean;
    noFollow?: boolean;
    structuredData?: any;
  };
  // Content structure for rich text
  contentBlocks?: {
    type: 'paragraph' | 'heading' | 'image' | 'quote' | 'list' | 'code' | 'embed';
    content: any;
    order: number;
  }[];
  // Related content
  relatedPosts?: mongoose.Types.ObjectId[];
  // Comments settings
  allowComments: boolean;
  commentsCount: number;
  // Social sharing
  socialShares: {
    facebook: number;
    twitter: number;
    linkedin: number;
    whatsapp: number;
  };
  // Analytics
  analytics: {
    uniqueViews: number;
    avgTimeOnPage: number;
    bounceRate: number;
    shareCount: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    trim: true,
    lowercase: true,
    match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
  },
  excerpt: {
    type: String,
    required: [true, 'Excerpt is required'],
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  featuredImage: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Travel Tips',
      'Destination Guides',
      'Adventure Stories',
      'Cultural Experiences',
      'Food & Cuisine',
      'Photography',
      'Gear Reviews',
      'Safety Tips',
      'Budget Travel',
      'Luxury Travel',
      'Solo Travel',
      'Family Travel',
      'Sustainable Travel',
      'News & Updates',
      'Company News'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    default: 'DRAFT'
  },
  publishedAt: {
    type: Date
  },
  scheduledAt: {
    type: Date
  },
  readTime: {
    type: Number,
    min: [1, 'Read time must be at least 1 minute']
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    canonicalUrl: {
      type: String,
      trim: true
    },
    noIndex: {
      type: Boolean,
      default: false
    },
    noFollow: {
      type: Boolean,
      default: false
    },
    structuredData: {
      type: Schema.Types.Mixed
    }
  },
  contentBlocks: [{
    type: {
      type: String,
      enum: ['paragraph', 'heading', 'image', 'quote', 'list', 'code', 'embed'],
      required: true
    },
    content: {
      type: Schema.Types.Mixed,
      required: true
    },
    order: {
      type: Number,
      required: true
    }
  }],
  relatedPosts: [{
    type: Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  allowComments: {
    type: Boolean,
    default: true
  },
  commentsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  socialShares: {
    facebook: {
      type: Number,
      default: 0,
      min: 0
    },
    twitter: {
      type: Number,
      default: 0,
      min: 0
    },
    linkedin: {
      type: Number,
      default: 0,
      min: 0
    },
    whatsapp: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  analytics: {
    uniqueViews: {
      type: Number,
      default: 0,
      min: 0
    },
    avgTimeOnPage: {
      type: Number,
      default: 0,
      min: 0
    },
    bounceRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    shareCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
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

// Indexes for efficient querying
BlogSchema.index({ slug: 1 }, { unique: true });
BlogSchema.index({ status: 1, publishedAt: -1 });
BlogSchema.index({ category: 1, status: 1 });
BlogSchema.index({ tags: 1 });
BlogSchema.index({ author: 1, createdAt: -1 });
BlogSchema.index({ isFeatured: 1, status: 1 });
BlogSchema.index({ views: -1 });
BlogSchema.index({ likes: -1 });
BlogSchema.index({ createdAt: -1 });
BlogSchema.index({ publishedAt: -1 });

// Text search index
BlogSchema.index({
  title: 'text',
  excerpt: 'text',
  content: 'text',
  tags: 'text'
});

// Pre-save middleware
BlogSchema.pre('save', function(next) {
  // Auto-generate slug from title if not provided
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Calculate read time based on content length
  if (this.content) {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }

  // Set published date when status changes to PUBLISHED
  if (this.status === 'PUBLISHED' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Auto-generate SEO fields if not provided
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.title.substring(0, 60);
  }

  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.excerpt.substring(0, 160);
  }

  if (!this.seo.keywords || this.seo.keywords.length === 0) {
    this.seo.keywords = this.tags.slice(0, 5);
  }

  next();
});

// Virtual for URL
BlogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Virtual for reading time text
BlogSchema.virtual('readTimeText').get(function() {
  return `${this.readTime} min read`;
});

// Virtual for published status
BlogSchema.virtual('isPublished').get(function() {
  return this.status === 'PUBLISHED' && this.publishedAt && this.publishedAt <= new Date();
});

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);