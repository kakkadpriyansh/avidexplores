import AdminAuditLog, { IAdminAuditLog } from '@/models/AdminAuditLog';
import { Model } from 'mongoose';
import { NextRequest } from 'next/server';
import mongoose from 'mongoose';

interface LogAdminActionParams {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: 'USER' | 'EVENT' | 'BOOKING' | 'PROMO_CODE' | 'SYSTEM';
  targetId?: string;
  targetIdentifier?: string;
  details?: {
    before?: any;
    after?: any;
    reason?: string;
    metadata?: any;
  };
  request?: NextRequest;
  success?: boolean;
  errorMessage?: string;
}

export async function logAdminAction(params: LogAdminActionParams): Promise<void> {
  try {
    const {
      adminId,
      adminEmail,
      action,
      targetType,
      targetId,
      targetIdentifier,
      details = {},
      request,
      success = true,
      errorMessage
    } = params;

    // Extract IP address and user agent from request if provided
    let ipAddress: string | undefined;
    let userAgent: string | undefined;

    if (request) {
      // Get IP address from various headers
      ipAddress = 
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        request.ip ||
        'unknown';

      userAgent = request.headers.get('user-agent') || 'unknown';
    }

    const logEntry = new AdminAuditLog({
      adminId: new mongoose.Types.ObjectId(adminId),
      adminEmail,
      action,
      targetType,
      targetId: targetId ? new mongoose.Types.ObjectId(targetId) : undefined,
      targetIdentifier,
      details,
      ipAddress,
      userAgent,
      success,
      errorMessage
    });

    await logEntry.save();

    // Also log to console for immediate visibility
    console.log(`[ADMIN_AUDIT] ${adminEmail} performed ${action} on ${targetType}${targetId ? ` (${targetId})` : ''}`, {
      success,
      timestamp: new Date().toISOString(),
      ipAddress,
      ...(errorMessage && { error: errorMessage })
    });

  } catch (error) {
    // Don't throw error to avoid breaking the main operation
    // Just log the audit logging failure
    console.error('Failed to log admin action:', error);
  }
}

// Helper function to get audit logs with filtering and pagination
export interface GetAuditLogsParams {
  adminId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  success?: boolean;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function getAuditLogs(params: GetAuditLogsParams = {}) {
  const {
    adminId,
    action,
    targetType,
    targetId,
    success,
    startDate,
    endDate,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = params;

  // Build filter
  const filter: any = {};

  if (adminId) {
    filter.adminId = new mongoose.Types.ObjectId(adminId);
  }

  if (action) {
    filter.action = action;
  }

  if (targetType) {
    filter.targetType = targetType;
  }

  if (targetId) {
    filter.targetId = new mongoose.Types.ObjectId(targetId);
  }

  if (success !== undefined) {
    filter.success = success;
  }

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) {
      filter.createdAt.$gte = startDate;
    }
    if (endDate) {
      filter.createdAt.$lte = endDate;
    }
  }

  // Calculate pagination
  const skip = (page - 1) * limit;
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Get logs
  const logs = await (AdminAuditLog as Model<IAdminAuditLog>).find(filter)
    .populate('adminId', 'name email')
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean();

  // Get total count
  const total = await (AdminAuditLog as Model<IAdminAuditLog>).countDocuments(filter);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

// Helper function to get audit statistics
export async function getAuditStatistics(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await AdminAuditLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalActions: { $sum: 1 },
        successfulActions: {
          $sum: { $cond: [{ $eq: ['$success', true] }, 1, 0] }
        },
        failedActions: {
          $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] }
        },
        uniqueAdmins: { $addToSet: '$adminId' },
        actionsByType: {
          $push: {
            action: '$action',
            targetType: '$targetType'
          }
        }
      }
    },
    {
      $project: {
        totalActions: 1,
        successfulActions: 1,
        failedActions: 1,
        uniqueAdminsCount: { $size: '$uniqueAdmins' },
        successRate: {
          $multiply: [
            { $divide: ['$successfulActions', '$totalActions'] },
            100
          ]
        }
      }
    }
  ]);

  // Get top actions
  const topActions = await AdminAuditLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Get most active admins
  const topAdmins = await AdminAuditLog.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$adminId',
        adminEmail: { $first: '$adminEmail' },
        actionCount: { $sum: 1 }
      }
    },
    {
      $sort: { actionCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  return {
    overview: stats[0] || {
      totalActions: 0,
      successfulActions: 0,
      failedActions: 0,
      uniqueAdminsCount: 0,
      successRate: 0
    },
    topActions,
    topAdmins
  };
}