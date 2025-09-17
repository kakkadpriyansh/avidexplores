const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

// User Schema (matching the one in models/User.ts)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'GUIDE'],
    default: 'USER'
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  preferences: {
    newsletter: {
      type: Boolean,
      default: true
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Admin credentials
    const adminEmail = 'admin@avidexplorers.com';
    const adminPassword = 'admin123';
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      process.exit(0);
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);

    // Create admin user
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      emailVerified: true
    });

    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('\n🚀 You can now login as admin at: http://localhost:3001/login');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createAdmin();