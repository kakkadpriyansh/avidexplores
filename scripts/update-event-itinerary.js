const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Event Schema (matching the one in models/Event.ts)
const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  images: [{
    type: String,
    required: true
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Challenging', 'Extreme'],
    required: [true, 'Difficulty is required']
  },
  category: {
    type: String,
    enum: ['Trekking', 'Climbing', 'Safari', 'Cultural', 'Adventure', 'Relaxation'],
    required: [true, 'Category is required']
  },
  location: {
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    region: {
      type: String,
      required: [true, 'Region is required']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    activities: [String],
    meals: [String],
    accommodation: {
      type: String
    },
    images: [String]
  }],
  included: [String],
  excluded: [String],
  requirements: [String],
  maxGroupSize: {
    type: Number,
    required: [true, 'Max group size is required'],
    min: [1, 'Max group size must be at least 1']
  },
  availableDates: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    availableSpots: {
      type: Number,
      required: true,
      min: [0, 'Available spots cannot be negative']
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

async function updateEventItinerary() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const eventId = '68b828c76e5b5a4225aab7ba';
    
    // New 2-day itinerary
    const newItinerary = [
      {
        day: 1,
        title: "Arrival and Base Camp Setup",
        location: "Himalayan Base Camp",
        description: "Arrive at the base camp, meet your team, and prepare for the adventure ahead. Acclimatization activities and equipment check.",
        activities: [
          "Team briefing and introductions",
          "Equipment check and distribution",
          "Acclimatization walk",
          "Base camp orientation"
        ],
        meals: ["Lunch", "Dinner"],
        accommodation: "Mountain Lodge",
        images: [
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        ]
      },
      {
        day: 2,
        title: "Summit Day and Return",
        location: "Himalayan Peak",
        description: "Early morning start for the summit attempt. Experience breathtaking views from the peak and safely return to base camp.",
        activities: [
          "Pre-dawn departure",
          "Summit attempt",
          "Photography at the peak",
          "Descent to base camp",
          "Celebration dinner"
        ],
        meals: ["Early Breakfast", "Summit Snacks", "Celebration Dinner"],
        accommodation: "Mountain Lodge",
        images: [
          "https://images.unsplash.com/photo-1464822759844-d150baec93c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        ]
      }
    ];

    // Update the event
    const result = await Event.findByIdAndUpdate(
      eventId,
      { 
        itinerary: newItinerary,
        duration: 2 // Also update duration to match
      },
      { new: true }
    );

    if (result) {
      console.log('✅ Event itinerary updated successfully!');
      console.log('📅 New itinerary days:', result.itinerary.length);
      console.log('🏔️ Event:', result.title);
      console.log('🔗 Slug:', result.slug);
    } else {
      console.log('❌ Event not found');
    }
    
  } catch (error) {
    console.error('❌ Error updating event itinerary:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateEventItinerary();