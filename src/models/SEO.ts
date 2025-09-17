import mongoose, { Document, Schema } from 'mongoose';

export interface ISEO extends Document {
  pageType: 'HOME' | 'EVENT' | 'BLOG' | 'DESTINATION' | 'CUSTOM';
  pageId?: string; // For specific pages like event ID, blog ID, etc.
  slug?: string; // For custom pages
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  noFollow: boolean;
  structuredData?: {
    type: string;
    data: any;
  }[];
  customMeta?: {
    name: string;
    content: string;
    property?: string;
  }[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SEOSchema = new Schema<ISEO>({
  pageType: {
    type: String,
    enum: ['HOME', 'EVENT', 'BLOG', 'DESTINATION', 'CUSTOM'],
    required: [true, 'Page type is required']
  },
  pageId: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  title: {
    type: String,
    required: [true, 'SEO title is required'],
    trim: true,
    maxlength: [60, 'SEO title should not exceed 60 characters']
  },
  description: {
    type: String,
    required: [true, 'SEO description is required'],
    trim: true,
    maxlength: [160, 'SEO description should not exceed 160 characters']
  },
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  ogTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'OG title should not exceed 60 characters']
  },
  ogDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'OG description should not exceed 160 characters']
  },
  ogImage: {
    type: String,
    trim: true
  },
  twitterTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Twitter title should not exceed 60 characters']
  },
  twitterDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'Twitter description should not exceed 160 characters']
  },
  twitterImage: {
    type: String,
    trim: true
  },
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
  structuredData: [{
    type: {
      type: String,
      required: true
    },
    data: {
      type: Schema.Types.Mixed,
      required: true
    }
  }],
  customMeta: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    property: {
      type: String,
      trim: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
SEOSchema.index({ pageType: 1, pageId: 1 });
SEOSchema.index({ slug: 1 });
SEOSchema.index({ isActive: 1 });
SEOSchema.index({ pageType: 1, isActive: 1 });

// Ensure unique combination of pageType and pageId/slug
SEOSchema.index(
  { pageType: 1, pageId: 1 },
  { 
    unique: true,
    partialFilterExpression: { pageId: { $exists: true, $ne: null } }
  }
);

SEOSchema.index(
  { slug: 1 },
  { 
    unique: true,
    partialFilterExpression: { slug: { $exists: true, $ne: null } }
  }
);

// Pre-save middleware to set default OG and Twitter data
SEOSchema.pre('save', function(next) {
  if (!this.ogTitle) {
    this.ogTitle = this.title;
  }
  if (!this.ogDescription) {
    this.ogDescription = this.description;
  }
  if (!this.twitterTitle) {
    this.twitterTitle = this.title;
  }
  if (!this.twitterDescription) {
    this.twitterDescription = this.description;
  }
  next();
});

export default mongoose.models.SEO || mongoose.model<ISEO>('SEO', SEOSchema);