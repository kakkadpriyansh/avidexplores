import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeviceToken from '@/models/DeviceToken';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { Model } from 'mongoose';
import mongoose from 'mongoose';

// GET /api/notifications/device-tokens/[id] - Get device token by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid device token ID' },
        { status: 400 }
      );
    }

    // Get session if authenticated
    const session = await getServerSession(authOptions);

    const deviceToken = await (DeviceToken as Model<any>).findById(id)
      .populate('user', 'name email')
      .lean();

    if (!deviceToken) {
      return NextResponse.json(
        { success: false, message: 'Device token not found' },
        { status: 404 }
      );
    }

    // Check permissions - user can only see their own tokens, admin can see all
    const isAdmin = !!session?.user && session.user.role === 'ADMIN';
    const isOwner = session?.user?.id && (deviceToken as any).user?._id?.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { deviceToken }
    });
  } catch (error) {
    console.error('Error fetching device token:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/device-tokens/[id] - Update device token
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid device token ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const body = await request.json();

    const deviceToken = await (DeviceToken as Model<any>).findById(id);

    if (!deviceToken) {
      return NextResponse.json(
        { success: false, message: 'Device token not found' },
        { status: 404 }
      );
    }

    // Check permissions - user can only update their own tokens, admin can update all
    const isAdmin = !!session?.user && session.user.role === 'ADMIN';
    const isOwner = session?.user?.id && deviceToken.user?.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const {
      preferences,
      deviceInfo,
      location,
      isActive,
      isValid,
      invalidationReason
    } = body;

    // Update allowed fields
    if (preferences) {
      (deviceToken as any).preferences = { ...(deviceToken as any).preferences, ...preferences };
    }

    if (deviceInfo) {
      (deviceToken as any).deviceInfo = { ...(deviceToken as any).deviceInfo, ...deviceInfo };
    }

    if (location) {
      (deviceToken as any).location = { ...(deviceToken as any).location, ...location };
    }

    // Admin-only fields
    if (isAdmin) {
      if (typeof isActive === 'boolean') {
        (deviceToken as any).isActive = isActive;
      }

      if (typeof isValid === 'boolean') {
        (deviceToken as any).isValid = isValid;
        if (!isValid && !(deviceToken as any).invalidatedAt) {
          (deviceToken as any).invalidatedAt = new Date();
          (deviceToken as any).invalidationReason = invalidationReason || 'ADMIN_DISABLED';
        } else if (isValid) {
          (deviceToken as any).invalidatedAt = undefined;
          (deviceToken as any).invalidationReason = undefined;
        }
      }
    }

    (deviceToken as any).lastUsedAt = new Date();
    await deviceToken.save();

    return NextResponse.json({
      success: true,
      data: { deviceToken },
      message: 'Device token updated successfully'
    });
  } catch (error) {
    console.error('Error updating device token:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications/device-tokens/[id] - Delete device token
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid device token ID' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    const deviceToken = await (DeviceToken as Model<any>).findById(id);

    if (!deviceToken) {
      return NextResponse.json(
        { success: false, message: 'Device token not found' },
        { status: 404 }
      );
    }

    // Check permissions - user can only delete their own tokens, admin can delete all
    const isAdmin = !!session?.user && session.user.role === 'ADMIN';
    const isOwner = session?.user?.id && deviceToken.user?.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    await (DeviceToken as Model<any>).findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Device token deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting device token:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}