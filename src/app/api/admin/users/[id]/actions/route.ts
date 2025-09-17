import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import { logAdminAction } from '@/lib/adminAudit';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/admin/users/[id]/actions - Perform user actions (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { action, reason, role } = body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Prevent admin from performing actions on their own account
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot perform actions on your own account' },
        { status: 400 }
      );
    }

    const targetUser = await (User as Model<IUser>).findById(id);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let updateData: any = {
      updatedBy: session.user.id,
      updatedAt: new Date()
    };
    let message = '';

    switch (action) {
      case 'ban':
        if (!reason) {
          return NextResponse.json(
            { error: 'Ban reason is required' },
            { status: 400 }
          );
        }
        updateData.isBanned = true;
        updateData.banReason = reason;
        updateData.bannedAt = new Date();
        updateData.bannedBy = session.user.id;
        message = 'User banned successfully';
        break;

      case 'unban':
        updateData.isBanned = false;
        updateData.banReason = undefined;
        updateData.bannedAt = undefined;
        updateData.bannedBy = undefined;
        message = 'User unbanned successfully';
        break;

      case 'verify':
        updateData.isVerified = true;
        updateData.verifiedAt = new Date();
        updateData.verifiedBy = session.user.id;
        message = 'User verified successfully';
        break;

      case 'unverify':
        updateData.isVerified = false;
        updateData.verifiedAt = undefined;
        updateData.verifiedBy = undefined;
        message = 'User verification removed successfully';
        break;

      case 'changeRole':
        if (!role || !['USER', 'ADMIN', 'GUIDE'].includes(role)) {
          return NextResponse.json(
            { error: 'Valid role is required' },
            { status: 400 }
          );
        }
        updateData.role = role;
        updateData.roleChangedAt = new Date();
        updateData.roleChangedBy = session.user.id;
        message = `User role changed to ${role} successfully`;
        break;

      case 'resetPassword':
        // Generate a temporary password or send reset email
        // For now, we'll just mark that password reset is required
        updateData.passwordResetRequired = true;
        updateData.passwordResetRequestedAt = new Date();
        updateData.passwordResetRequestedBy = session.user.id;
        message = 'Password reset initiated successfully';
        break;

      case 'activate':
        updateData.isActive = true;
        message = 'User activated successfully';
        break;

      case 'deactivate':
        updateData.isActive = false;
        message = 'User deactivated successfully';
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updatedUser = await (User as Model<IUser>).findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    // Log the action for audit purposes
    await logAdminAction({
      adminId: session.user.id,
      adminEmail: session.user.email,
      action: `USER_${action.toUpperCase()}`,
      targetType: 'USER',
      targetId: id,
      targetIdentifier: targetUser.email,
      details: {
        before: {
          role: targetUser.role,
          isVerified: targetUser.isVerified,
          isBanned: targetUser.isBanned,
          isActive: targetUser.isActive
        },
        after: updateData,
        reason
      },
      request,
      success: true
    });

    return NextResponse.json({
      message,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error performing user action:', error);
    return NextResponse.json(
      { error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}