import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  discountedPrice?: number;
  dates: Date[];
  availableMonths: string[]; // Available months for booking
  availableDates: {
    month: string;
    year: number;
    dates: number[];
    location?: string;
    availableSeats?: number;
    totalSeats?: number;
  }[]; // Specific available dates with month, year and day numbers
  departures?: {
    label: string; // e.g., "Rajkot to Rajkot"
    origin: string;
    destination: string;
    transportOptions: {
      mode: 'AC_TRAIN' | 'NON_AC_TRAIN' | 'FLIGHT' | 'BUS';
      price: number; // per person additional price for transport
    }[];
    availableDates: {
      month: string;
      year: number;
      dates: number[];
      availableTransportModes?: ('AC_TRAIN' | 'NON_AC_TRAIN' | 'FLIGHT' | 'BUS')[];
      availableSeats?: number;
      totalSeats?: number;
    }[];
    itinerary?: {
      day: number;
      title: string;
      location?: string;
      description: string;
      activities: string[];
      meals: string[];
      accommodation?: string;
      images?: string[];
    }[];
  }[];
  itinerary: {
    day: number;
    title: string;
    location?: string;
    description: string;
    activities: string[];
    meals: string[];
    accommodation?: string;
    images?: string[];
  }[];
  inclusions: string[];
  exclusions: string[];
  preparation: {
    physicalRequirements: string;
    medicalRequirements: string;
    experienceLevel: string;
    safetyGuidelines: string[];
    additionalNotes: string;
  };
  category: 'TREKKING' | 'CAMPING' | 'WILDLIFE' | 'CULTURAL' | 'ADVENTURE' | 'SPIRITUAL';
  difficulty: 'EASY' | 'MODERATE' | 'DIFFICULT' | 'EXTREME';
  images: string[];
  location: {
    name: string;
    state: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  region?: string;
  duration: string; // free text, e.g., "5 Days 4 Nights"
  maxParticipants: number;
  minParticipants: number;
  ageLimit: {
    min: number;
    max: number;
  };
  season: string[];
  tags: string[];
  highlights: string[];
  thingsToCarry: string[];
  guide: mongoose.Types.ObjectId;
  isActive: boolean;
  isFeatured: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
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
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountedPrice: {
    type: Number,
    required: false,
    min: [0, 'Discounted price cannot be negative']
  },
  dates: [{
    type: Date,
    required: true
  }],
  availableMonths: [{
    type: String,
    required: false
  }],
  availableDates: [{
    month: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    dates: [{
      type: Number,
      required: true
    }],
    location: {
      type: String,
      required: false
    },
    availableSeats: {
      type: Number,
      required: false,
      min: [0, 'Available seats cannot be negative']
    },
    totalSeats: {
      type: Number,
      required: false,
      min: [1, 'Total seats must be at least 1']
    }
  }],
  departures: [{
    label: {
      type: String,
      required: [true, 'Departure label is required'],
      trim: true
    },
    origin: {
      type: String,
      required: [true, 'Origin is required'],
      trim: true
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true
    },
    transportOptions: [{
      mode: {
        type: String,
        enum: ['AC_TRAIN', 'NON_AC_TRAIN', 'FLIGHT', 'BUS'],
        required: [true, 'Transport mode is required']
      },
      price: {
        type: Number,
        required: [true, 'Transport price is required'],
        min: [0, 'Price cannot be negative']
      }
    }],
    availableDates: [{
      month: {
        type: String,
        required: true
      },
      year: {
        type: Number,
        required: true
      },
      dates: [{
        type: Number,
        required: true
      }],
      availableTransportModes: [{
        type: String,
        enum: ['AC_TRAIN', 'NON_AC_TRAIN', 'FLIGHT', 'BUS'],
        required: false
      }],
      availableSeats: {
        type: Number,
        required: false,
        min: [0, 'Available seats cannot be negative']
      },
      totalSeats: {
        type: Number,
        required: false,
        min: [1, 'Total seats must be at least 1']
      }
    }],
    itinerary: [{
      day: {
        type: Number,
        required: true
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      location: {
        type: String,
        required: false
      },
      description: {
        type: String,
        required: true
      },
      activities: [String],
      meals: [String],
      accommodation: String,
      images: [String]
    }]
  }],
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: true
    },
    activities: [String],
    meals: [String],
    accommodation: String,
    images: [String]
  }],
  inclusions: [{
    type: String,
    required: true
  }],
  exclusions: [{
    type: String,
    required: true
  }],
  preparation: {
    physicalRequirements: {
      type: String,
      default: ''
    },
    medicalRequirements: {
      type: String,
      default: ''
    },
    experienceLevel: {
      type: String,
      default: ''
    },
    safetyGuidelines: [{
      type: String
    }],
    additionalNotes: {
      type: String,
      default: ''
    }
  },
  category: {
    type: String,
    enum: ['TREKKING', 'CAMPING', 'WILDLIFE', 'CULTURAL', 'ADVENTURE', 'SPIRITUAL'],
    required: [true, 'Category is required']
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'MODERATE', 'DIFFICULT', 'EXTREME'],
    required: [true, 'Difficulty level is required']
  },
  images: [{
    type: String,
    required: true
  }],
  location: {
    name: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  region: {
    type: String,
    required: false,
    trim: true
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true,
    maxlength: [100, 'Duration cannot exceed 100 characters']
  },
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: [1, 'Must allow at least 1 participant']
  },
  minParticipants: {
    type: Number,
    required: [true, 'Minimum participants is required'],
    min: [1, 'Must require at least 1 participant']
  },
  ageLimit: {
    min: {
      type: Number,
      required: true,
      min: [0, 'Minimum age cannot be negative']
    },
    max: {
      type: Number,
      required: true,
      max: [100, 'Maximum age cannot exceed 100']
    }
  },
  season: [{
    type: String,
    enum: ['SPRING', 'SUMMER', 'MONSOON', 'AUTUMN', 'WINTER']
  }],
  tags: [String],
  highlights: [String],
  thingsToCarry: [String],
  guide: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
EventSchema.index({ slug: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ difficulty: 1 });
EventSchema.index({ isActive: 1 });
EventSchema.index({ isFeatured: 1 });
EventSchema.index({ 'location.state': 1 });
EventSchema.index({ region: 1 });
EventSchema.index({ dates: 1 });
EventSchema.index({ price: 1 });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
