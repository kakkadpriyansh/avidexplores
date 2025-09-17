import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Model } from 'mongoose';

// GET /api/admin/users - Get all users with filtering and pagination (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status'); // active, banned, unverified
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter
    const filter: any = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role && ['USER', 'ADMIN', 'GUIDE'].includes(role)) {
      filter.role = role;
    }

    if (status) {
      switch (status) {
        case 'banned':
          filter.isBanned = true;
          break;
        case 'active':
          filter.isBanned = { $ne: true };
          filter.isVerified = true;
          break;
        case 'unverified':
          filter.isVerified = false;
          break;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get users
    const users = await (User as unknown as import('mongoose').Model<IUser>).find(filter)
      .select('-password')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await (User as unknown as import('mongoose').Model<IUser>).countDocuments(filter);

    // Calculate statistics
    const stats = await (User as unknown as import('mongoose').Model<IUser>).aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: {
              $cond: [
                { $and: [{ $ne: ['$isBanned', true] }, { $eq: ['$isVerified', true] }] },
                1,
                0
              ]
            }
          },
          bannedUsers: {
            $sum: {
              $cond: [{ $eq: ['$isBanned', true] }, 1, 0]
            }
          },
          unverifiedUsers: {
            $sum: {
              $cond: [{ $eq: ['$isVerified', false] }, 1, 0]
            }
          },
          adminUsers: {
            $sum: {
              $cond: [{ $eq: ['$role', 'ADMIN'] }, 1, 0]
            }
          },
          guideUsers: {
            $sum: {
              $cond: [{ $eq: ['$role', 'GUIDE'] }, 1, 0]
            }
          }
        }
      }
    ]);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      statistics: stats[0] || {
        totalUsers: 0,
        activeUsers: 0,
        bannedUsers: 0,
        unverifiedUsers: 0,
        adminUsers: 0,
        guideUsers: 0
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, email, password, role = 'USER', isVerified = false } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (!['USER', 'ADMIN', 'GUIDE'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await (User as unknown as import('mongoose').Model<IUser>).findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const newUser = new (User as unknown as import('mongoose').Model<IUser>)({
      name,
      email,
      password, // Will be hashed by pre-save middleware
      role,
      isVerified,
      createdBy: session.user.id
    });

    await newUser.save();

    // Remove password from response
    const userResponse = (newUser as any).toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: 'User created successfully',
      user: userResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}