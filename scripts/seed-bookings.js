const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://localhost:27017/avid-explores';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  bookingId: { type: String, required: true, uppercase: true },
  date: { type: Date, required: true },
  selectedDeparture: String,
  selectedTransportMode: String,
  participants: [{
    name: String,
    age: Number,
    gender: String,
    phone: String,
    email: String,
    emergencyContact: { name: String, phone: String, relationship: String }
  }],
  totalAmount: Number,
  finalAmount: Number,
  status: { type: String, default: 'CONFIRMED' },
  paymentInfo: {
    paymentMethod: { type: String, default: 'RAZORPAY' },
    paymentStatus: { type: String, default: 'SUCCESS' }
  },
  confirmationSent: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false },
  feedbackRequested: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'USER' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const eventSchema = new mongoose.Schema({
  title: String,
  slug: String,
  price: Number,
  location: { name: String, state: String, country: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const Booking = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

    let user = await User.findOne({ email: 'user@test.com' });
    if (!user) {
      user = await User.create({
        name: 'Test User',
        email: 'user@test.com',
        password: '$2a$10$abcdefghijklmnopqrstuv',
        role: 'USER'
      });
    }

    let event = await Event.findOne({ slug: 'test-trek' });
    if (!event) {
      event = await Event.create({
        title: 'Test Trek',
        slug: 'test-trek',
        price: 5000,
        location: { name: 'Himalayas', state: 'Uttarakhand', country: 'India' }
      });
    }

    const bookings = [];
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const bookingCount = Math.floor(Math.random() * 8) + 3;
      
      for (let j = 0; j < bookingCount; j++) {
        bookings.push({
          userId: user._id,
          eventId: event._id,
          bookingId: `AE${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          date: new Date(month.getFullYear(), month.getMonth(), Math.floor(Math.random() * 28) + 1),
          participants: [{
            name: 'John Doe',
            age: 25,
            gender: 'MALE',
            phone: '9876543210',
            email: 'john@test.com',
            emergencyContact: { name: 'Jane Doe', phone: '9876543211', relationship: 'Sister' }
          }],
          totalAmount: 5000 + Math.floor(Math.random() * 3000),
          finalAmount: 5000 + Math.floor(Math.random() * 3000),
          status: 'CONFIRMED',
          paymentInfo: { paymentMethod: 'RAZORPAY', paymentStatus: 'SUCCESS' },
          createdAt: month
        });
      }
    }

    await Booking.insertMany(bookings);
    console.log(`✓ Seeded ${bookings.length} bookings across 12 months`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
