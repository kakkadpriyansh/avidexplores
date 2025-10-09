import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteSettings extends Document {
  // Basic site information
  siteName: string;
  siteDescription: string;
  siteKeywords: string[];
  siteUrl: string;
  
  // Branding
  logo: {
    light: string; // URL to light theme logo
    dark: string;  // URL to dark theme logo
    favicon: string; // URL to favicon
  };
  
  // Hero section
  hero: {
    backgroundImage: string; // URL to hero background image
    backgroundImages: string[]; // Array of background images for carousel
    title: string; // Main hero title
    subtitle: string; // Hero subtitle/description
    ctaText: string; // Call-to-action button text
    ctaLink: string; // Call-to-action button link
  };
  
  // Theme and styling
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    customCSS?: string;
  };
  
  // Contact information
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      country: string;
      zipCode: string;
    };
    socialMedia: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
      youtube?: string;
      whatsapp?: string;
    };
  };
  
  // Business information
  business: {
    companyName: string;
    registrationNumber?: string;
    taxId?: string;
    establishedYear?: number;
    aboutUs: string;
    mission?: string;
    vision?: string;
  };
  
  // SEO settings
  seo: {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string[];
    ogImage: string;
    twitterCard: 'summary' | 'summary_large_image';
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
    structuredData?: any;
  };
  
  // Email settings
  email: {
    fromName: string;
    fromEmail: string;
    replyToEmail: string;
    supportEmail: string;
    smtpSettings?: {
      host: string;
      port: number;
      secure: boolean;
      username: string;
      password: string;
    };
  };
  
  // Payment settings
  payment: {
    currency: string;
    currencySymbol: string;
    taxRate: number;
    processingFee: number;
    razorpay?: {
      keyId: string;
      keySecret: string;
      webhookSecret: string;
    };
  };
  
  // Booking settings
  booking: {
    allowGuestBooking: boolean;
    requirePhoneVerification: boolean;
    cancellationPolicy: string;
    refundPolicy: string;
    termsAndConditions: string;
    privacyPolicy: string;
    advanceBookingDays: number;
    maxGroupSize: number;
    defaultBookingStatus: 'pending' | 'confirmed' | 'requires_payment';
  };
  
  // Notification settings
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    adminNotifications: {
      newBooking: boolean;
      paymentReceived: boolean;
      cancellation: boolean;
      newUser: boolean;
      systemAlerts: boolean;
    };
    userNotifications: {
      bookingConfirmation: boolean;
      paymentConfirmation: boolean;
      reminders: boolean;
      promotions: boolean;
      newsletter: boolean;
    };
  };
  
  // Feature flags
  features: {
    blogEnabled: boolean;
    eventsEnabled: boolean;
    storiesEnabled: boolean;
    newsletterEnabled: boolean;
    reviewsEnabled: boolean;
    wishlistEnabled: boolean;
    multiLanguageEnabled: boolean;
    darkModeEnabled: boolean;
    maintenanceMode: boolean;
  };
  
  // API settings
  api: {
    rateLimit: {
      windowMs: number;
      maxRequests: number;
    };
    corsOrigins: string[];
    jwtSecret: string;
    jwtExpiresIn: string;
  };
  
  // File upload settings
  uploads: {
    maxFileSize: number; // in bytes
    allowedImageTypes: string[];
    allowedDocumentTypes: string[];
    storageProvider: 'local' | 'cloudinary' | 's3';
    cloudinaryConfig?: {
      cloudName: string;
      apiKey: string;
      apiSecret: string;
    };
    s3Config?: {
      bucketName: string;
      region: string;
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  
  // Maintenance and system
  maintenance: {
    isEnabled: boolean;
    message: string;
    allowedIPs: string[];
    scheduledStart?: Date;
    scheduledEnd?: Date;
  };
  
  // Analytics and tracking
  analytics: {
    enableTracking: boolean;
    trackingCode?: string;
    heatmapEnabled: boolean;
    userSessionRecording: boolean;
    conversionTracking: boolean;
  };
  
  // Version and metadata
  version: string;
  lastUpdatedBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>({
  siteName: {
    type: String,
    required: [true, 'Site name is required'],
    trim: true,
    maxlength: [100, 'Site name cannot exceed 100 characters']
  },
  siteDescription: {
    type: String,
    required: [true, 'Site description is required'],
    trim: true,
    maxlength: [500, 'Site description cannot exceed 500 characters']
  },
  siteKeywords: [{
    type: String,
    trim: true
  }],
  siteUrl: {
    type: String,
    required: [true, 'Site URL is required'],
    trim: true,
    validate: {
      validator: function(v: string) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Please enter a valid URL'
    }
  },
  
  logo: {
    light: {
      type: String,
      required: [true, 'Light logo is required'],
      trim: true
    },
    dark: {
      type: String,
      required: [true, 'Dark logo is required'],
      trim: true
    },
    favicon: {
      type: String,
      required: [true, 'Favicon is required'],
      trim: true
    }
  },

  hero: {
    backgroundImage: {
      type: String,
      required: [true, 'Hero background image is required'],
      trim: true,
      default: '/hero-adventure.jpg'
    },
    backgroundImages: {
      type: [String],
      default: []
    },
    title: {
      type: String,
      required: [true, 'Hero title is required'],
      trim: true,
      default: 'Discover Your Next Adventure'
    },
    subtitle: {
      type: String,
      required: [true, 'Hero subtitle is required'],
      trim: true,
      default: 'From challenging mountain treks to peaceful camping escapes, embark on unforgettable journeys with expert guides and fellow adventurers.'
    },
    ctaText: {
      type: String,
      required: [true, 'Hero CTA text is required'],
      trim: true,
      default: 'Explore Adventures'
    },
    ctaLink: {
      type: String,
      required: [true, 'Hero CTA link is required'],
      trim: true,
      default: '/events'
    }
  },

  theme: {
    primaryColor: {
      type: String,
      required: [true, 'Primary color is required'],
      default: '#3B82F6',
      validate: {
        validator: function(v: string) {
          return /^#[0-9A-F]{6}$/i.test(v);
        },
        message: 'Please enter a valid hex color'
      }
    },
    secondaryColor: {
      type: String,
      required: [true, 'Secondary color is required'],
      default: '#6B7280',
      validate: {
        validator: function(v: string) {
          return /^#[0-9A-F]{6}$/i.test(v);
        },
        message: 'Please enter a valid hex color'
      }
    },
    accentColor: {
      type: String,
      required: [true, 'Accent color is required'],
      default: '#F59E0B',
      validate: {
        validator: function(v: string) {
          return /^#[0-9A-F]{6}$/i.test(v);
        },
        message: 'Please enter a valid hex color'
      }
    },
    backgroundColor: {
      type: String,
      required: [true, 'Background color is required'],
      default: '#FFFFFF',
      validate: {
        validator: function(v: string) {
          return /^#[0-9A-F]{6}$/i.test(v);
        },
        message: 'Please enter a valid hex color'
      }
    },
    textColor: {
      type: String,
      required: [true, 'Text color is required'],
      default: '#1F2937',
      validate: {
        validator: function(v: string) {
          return /^#[0-9A-F]{6}$/i.test(v);
        },
        message: 'Please enter a valid hex color'
      }
    },
    fontFamily: {
      type: String,
      required: [true, 'Font family is required'],
      default: 'Product Sans, Inter, system-ui, sans-serif',
      trim: true
    },
    customCSS: {
      type: String,
      trim: true
    }
  },
  
  contact: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v: string) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required'],
      trim: true
    },
    address: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true
      },
      zipCode: {
        type: String,
        required: [true, 'Zip code is required'],
        trim: true
      }
    },
    socialMedia: {
      facebook: { type: String, trim: true },
      instagram: { type: String, trim: true },
      twitter: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      youtube: { type: String, trim: true },
      whatsapp: { type: String, trim: true }
    }
  },
  
  business: {
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    registrationNumber: { type: String, trim: true },
    taxId: { type: String, trim: true },
    establishedYear: {
      type: Number,
      min: [1900, 'Established year must be after 1900'],
      max: [new Date().getFullYear(), 'Established year cannot be in the future']
    },
    aboutUs: {
      type: String,
      required: [true, 'About us is required'],
      trim: true
    },
    mission: { type: String, trim: true },
    vision: { type: String, trim: true }
  },
  
  seo: {
    metaTitle: {
      type: String,
      required: [true, 'Meta title is required'],
      trim: true,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      required: [true, 'Meta description is required'],
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    metaKeywords: [{ type: String, trim: true }],
    ogImage: {
      type: String,
      required: [true, 'OG image is required'],
      trim: true
    },
    twitterCard: {
      type: String,
      enum: ['summary', 'summary_large_image'],
      default: 'summary_large_image'
    },
    googleAnalyticsId: { type: String, trim: true },
    googleTagManagerId: { type: String, trim: true },
    facebookPixelId: { type: String, trim: true },
    structuredData: { type: Schema.Types.Mixed }
  },
  
  email: {
    fromName: {
      type: String,
      required: [true, 'From name is required'],
      trim: true
    },
    fromEmail: {
      type: String,
      required: [true, 'From email is required'],
      trim: true,
      lowercase: true
    },
    replyToEmail: {
      type: String,
      required: [true, 'Reply to email is required'],
      trim: true,
      lowercase: true
    },
    supportEmail: {
      type: String,
      required: [true, 'Support email is required'],
      trim: true,
      lowercase: true
    },
    smtpSettings: {
      host: { type: String, trim: true },
      port: { type: Number, min: 1, max: 65535 },
      secure: { type: Boolean, default: true },
      username: { type: String, trim: true },
      password: { type: String, trim: true }
    }
  },
  
  payment: {
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'INR',
      uppercase: true,
      minlength: [3, 'Currency code must be 3 characters'],
      maxlength: [3, 'Currency code must be 3 characters']
    },
    currencySymbol: {
      type: String,
      required: [true, 'Currency symbol is required'],
      default: '₹'
    },
    taxRate: {
      type: Number,
      required: [true, 'Tax rate is required'],
      default: 0,
      min: [0, 'Tax rate cannot be negative'],
      max: [100, 'Tax rate cannot exceed 100%']
    },
    processingFee: {
      type: Number,
      required: [true, 'Processing fee is required'],
      default: 0,
      min: [0, 'Processing fee cannot be negative']
    },
    razorpay: {
      keyId: { type: String, trim: true },
      keySecret: { type: String, trim: true },
      webhookSecret: { type: String, trim: true }
    }
  },
  
  booking: {
    allowGuestBooking: {
      type: Boolean,
      default: true
    },
    requirePhoneVerification: {
      type: Boolean,
      default: false
    },
    cancellationPolicy: {
      type: String,
      required: [true, 'Cancellation policy is required'],
      trim: true
    },
    refundPolicy: {
      type: String,
      required: [true, 'Refund policy is required'],
      trim: true
    },
    termsAndConditions: {
      type: String,
      required: [true, 'Terms and conditions are required'],
      trim: true
    },
    privacyPolicy: {
      type: String,
      required: [true, 'Privacy policy is required'],
      trim: true
    },
    advanceBookingDays: {
      type: Number,
      required: [true, 'Advance booking days is required'],
      default: 365,
      min: [1, 'Advance booking days must be at least 1']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Max group size is required'],
      default: 50,
      min: [1, 'Max group size must be at least 1']
    },
    defaultBookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'requires_payment'],
      default: 'pending'
    }
  },
  
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
    adminNotifications: {
      newBooking: { type: Boolean, default: true },
      paymentReceived: { type: Boolean, default: true },
      cancellation: { type: Boolean, default: true },
      newUser: { type: Boolean, default: false },
      systemAlerts: { type: Boolean, default: true }
    },
    userNotifications: {
      bookingConfirmation: { type: Boolean, default: true },
      paymentConfirmation: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: true }
    }
  },
  
  features: {
    blogEnabled: { type: Boolean, default: true },
    eventsEnabled: { type: Boolean, default: true },
    storiesEnabled: { type: Boolean, default: true },
    newsletterEnabled: { type: Boolean, default: true },
    reviewsEnabled: { type: Boolean, default: true },
    wishlistEnabled: { type: Boolean, default: true },
    multiLanguageEnabled: { type: Boolean, default: false },
    darkModeEnabled: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false }
  },
  
  api: {
    rateLimit: {
      windowMs: {
        type: Number,
        default: 15 * 60 * 1000, // 15 minutes
        min: [60000, 'Window must be at least 1 minute']
      },
      maxRequests: {
        type: Number,
        default: 100,
        min: [1, 'Max requests must be at least 1']
      }
    },
    corsOrigins: [{ type: String, trim: true }],
    jwtSecret: {
      type: String,
      required: [true, 'JWT secret is required'],
      minlength: [32, 'JWT secret must be at least 32 characters']
    },
    jwtExpiresIn: {
      type: String,
      default: '7d',
      trim: true
    }
  },
  
  uploads: {
    maxFileSize: {
      type: Number,
      default: 10 * 1024 * 1024, // 10MB
      min: [1024, 'Max file size must be at least 1KB']
    },
    allowedImageTypes: {
      type: [String],
      default: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    allowedDocumentTypes: {
      type: [String],
      default: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    },
    storageProvider: {
      type: String,
      enum: ['local', 'cloudinary', 's3'],
      default: 'local'
    },
    cloudinaryConfig: {
      cloudName: { type: String, trim: true },
      apiKey: { type: String, trim: true },
      apiSecret: { type: String, trim: true }
    },
    s3Config: {
      bucketName: { type: String, trim: true },
      region: { type: String, trim: true },
      accessKeyId: { type: String, trim: true },
      secretAccessKey: { type: String, trim: true }
    }
  },
  
  maintenance: {
    isEnabled: { type: Boolean, default: false },
    message: {
      type: String,
      default: 'We are currently performing scheduled maintenance. Please check back soon.',
      trim: true
    },
    allowedIPs: [{ type: String, trim: true }],
    scheduledStart: { type: Date },
    scheduledEnd: { type: Date }
  },
  
  analytics: {
    enableTracking: { type: Boolean, default: true },
    trackingCode: { type: String, trim: true },
    heatmapEnabled: { type: Boolean, default: false },
    userSessionRecording: { type: Boolean, default: false },
    conversionTracking: { type: Boolean, default: true }
  },
  
  version: {
    type: String,
    required: [true, 'Version is required'],
    default: '1.0.0',
    trim: true
  },
  lastUpdatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Last updated by is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
SiteSettingsSchema.index({ isActive: 1 });
SiteSettingsSchema.index({ version: 1 });
SiteSettingsSchema.index({ lastUpdatedBy: 1 });
SiteSettingsSchema.index({ createdAt: -1 });

// Ensure only one active settings document
SiteSettingsSchema.index({ isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

// Pre-save middleware
SiteSettingsSchema.pre('save', function(next) {
  // Ensure only one active settings document
  if (this.isActive && this.isNew) {
    // Deactivate all other settings
    (this.constructor as any).updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    ).exec();
  }
  
  next();
});

// Static methods
SiteSettingsSchema.statics.getActiveSettings = function() {
  return this.findOne({ isActive: true }).populate('lastUpdatedBy', 'name email');
};

SiteSettingsSchema.statics.createDefaultSettings = function(userId: string) {
  return this.create({
    siteName: 'Avid Explores',
    siteDescription: 'Discover amazing travel experiences and adventures with Avid Explores',
    siteKeywords: ['travel', 'adventure', 'tours', 'experiences', 'booking'],
    siteUrl: 'https://avidexplorers.com',
    logo: {
      light: '/images/logo-light.png',
      dark: '/images/logo-dark.png',
      favicon: '/images/favicon.ico'
    },
    hero: {
      backgroundImage: '/hero-adventure.jpg',
      backgroundImages: [],
      title: 'Discover Your Next Adventure',
      subtitle: 'From challenging mountain treks to peaceful camping escapes, embark on unforgettable journeys with expert guides and fellow adventurers.',
      ctaText: 'Explore Adventures',
      ctaLink: '/events'
    },
    contact: {
      email: 'info@avidexplorers.com',
      phone: '+91 9876543210',
      address: {
        street: '123 Travel Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001'
      },
      socialMedia: {}
    },
    business: {
      companyName: 'Avid Explores Pvt Ltd',
      aboutUs: 'We are passionate about creating unforgettable travel experiences.',
      establishedYear: 2020
    },
    seo: {
      metaTitle: 'Avid Explores - Amazing Travel Experiences',
      metaDescription: 'Discover amazing travel experiences and adventures with Avid Explores. Book your next adventure today!',
      metaKeywords: ['travel', 'adventure', 'tours', 'experiences', 'booking'],
      ogImage: '/images/og-image.jpg'
    },
    email: {
      fromName: 'Avid Explores',
      fromEmail: 'noreply@avidexplorers.com',
      replyToEmail: 'info@avidexplorers.com',
      supportEmail: 'support@avidexplorers.com'
    },
    booking: {
      cancellationPolicy: 'Free cancellation up to 24 hours before the experience starts.',
      refundPolicy: 'Full refund for cancellations made 24 hours in advance.',
      termsAndConditions: 'By booking with us, you agree to our terms and conditions.',
      privacyPolicy: 'We respect your privacy and protect your personal information.'
    },
    api: {
      jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
    },
    lastUpdatedBy: userId,
    isActive: true
  });
};

// Virtual properties
SiteSettingsSchema.virtual('isMaintenanceScheduled').get(function() {
  if (!this.maintenance.scheduledStart || !this.maintenance.scheduledEnd) {
    return false;
  }
  const now = new Date();
  return now >= this.maintenance.scheduledStart && now <= this.maintenance.scheduledEnd;
});

SiteSettingsSchema.virtual('fullAddress').get(function() {
  const addr = this.contact.address;
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zipCode}, ${addr.country}`;
});

export default mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);