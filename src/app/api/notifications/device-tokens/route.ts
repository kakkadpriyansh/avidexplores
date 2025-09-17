import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeviceToken from '@/models/DeviceToken';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { Model } from 'mongoose';

// GET /api/notifications/device-tokens - Get device tokens (Admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const platform = searchParams.get('platform');
    const isActive = searchParams.get('isActive');
    const isValid = searchParams.get('isValid');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search');

    // Verify admin access
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    // Build query
    const query: any = {};

    if (platform) {
      query.platform = platform;
    }

    if (isActive !== null && isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (isValid !== null && isValid !== undefined) {
      query.isValid = isValid === 'true';
    }

    if (userId) {
      query.user = userId;
    }

    if (search) {
      query.$or = [
        { token: { $regex: search, $options: 'i' } },
        { 'deviceInfo.deviceName': { $regex: search, $options: 'i' } },
        { 'deviceInfo.deviceId': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [tokens, total] = await Promise.all([
      (DeviceToken as Model<any>).find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (DeviceToken as Model<any>).countDocuments(query)
    ]);

    // Get summary statistics
    const stats = await (DeviceToken as Model<any>).aggregate([
      {
        $group: {
          _id: null,
          totalTokens: { $sum: 1 },
          activeTokens: {
            $sum: {
              $cond: [{ $and: ['$isActive', '$isValid'] }, 1, 0]
            }
          },
          androidTokens: {
            $sum: {
              $cond: [{ $eq: ['$platform', 'android'] }, 1, 0]
            }
          },
          iosTokens: {
            $sum: {
              $cond: [{ $eq: ['$platform', 'ios'] }, 1, 0]
            }
          },
          webTokens: {
            $sum: {
              $cond: [{ $eq: ['$platform', 'web'] }, 1, 0]
            }
          },
          avgDeliveryRate: { $avg: '$deliveryRate' },
          avgClickRate: { $avg: '$clickRate' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tokens,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          totalTokens: 0,
          activeTokens: 0,
          androidTokens: 0,
          iosTokens: 0,
          webTokens: 0,
          avgDeliveryRate: 0,
          avgClickRate: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching device tokens:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/device-tokens - Register device token
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      token,
      platform,
      deviceInfo,
      preferences,
      location
    } = body;

    // Validation
    if (!token || !platform) {
      return NextResponse.json(
        { success: false, message: 'Token and platform are required' },
        { status: 400 }
      );
    }

    if (!['android', 'ios', 'web'].includes(platform)) {
      return NextResponse.json(
        { success: false, message: 'Invalid platform' },
        { status: 400 }
      );
    }

    // Get user if authenticated
    const session = await getServerSession(authOptions);
    const sessionUserId = session?.user?.id;

    // Check if token already exists
    const existingToken = await (DeviceToken as Model<any>).findOne({ token });

    if (existingToken) {
      // Update existing token
      existingToken.user = sessionUserId || existingToken.user;
      existingToken.platform = platform;
      existingToken.deviceInfo = { ...existingToken.deviceInfo, ...deviceInfo };
      existingToken.preferences = { ...existingToken.preferences, ...preferences };
      existingToken.location = { ...existingToken.location, ...location };
      existingToken.isActive = true;
      existingToken.isValid = true;
      existingToken.lastUsedAt = new Date();
      existingToken.invalidatedAt = undefined;
      existingToken.invalidationReason = undefined;

      await existingToken.save();

      return NextResponse.json({
        success: true,
        data: { deviceToken: existingToken },
        message: 'Device token updated successfully'
      });
    }

    // Create new device token
    const deviceToken = new DeviceToken({
      user: sessionUserId,
      token,
      platform,
      deviceInfo: deviceInfo || {},
      preferences: {
        enabled: true,
        promotional: true,
        transactional: true,
        reminders: true,
        news: true,
        ...preferences
      },
      location: location || {},
      isActive: true,
      isValid: true
    });

    await deviceToken.save();

    return NextResponse.json({
      success: true,
      data: { deviceToken },
      message: 'Device token registered successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error registering device token:', error);
    
    // Handle duplicate key error
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { success: false, message: 'Device token already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/device-tokens - Cleanup old tokens (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin access
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '90');

    // Clean up old tokens
    const result = await (DeviceToken as any).cleanupOldTokens(days);

    return NextResponse.json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      },
      message: `Cleaned up ${result.deletedCount} old device tokens`
    });
  } catch (error) {
    console.error('Error cleaning up device tokens:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}