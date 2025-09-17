import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PushNotification from '@/models/PushNotification';
import DeviceToken from '@/models/DeviceToken';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { Model } from 'mongoose';

// GET /api/notifications/push - Get push notifications
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const campaign = searchParams.get('campaign');
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Verify admin/guide access
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['ADMIN', 'GUIDE'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Build query
    const query: any = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (campaign) {
      query['campaign.id'] = campaign;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { 'campaign.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      (PushNotification as any).find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (PushNotification as any).countDocuments(query)
    ]);

    // Get summary statistics
    const stats = await (PushNotification as any).aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSent: { $sum: '$analytics.sent' },
          totalDelivered: { $sum: '$analytics.delivered' },
          totalClicked: { $sum: '$analytics.clicked' },
          totalFailed: { $sum: '$analytics.failed' },
          avgDeliveryRate: { $avg: '$analytics.deliveryRate' },
          avgClickRate: { $avg: '$analytics.clickRate' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          totalSent: 0,
          totalDelivered: 0,
          totalClicked: 0,
          totalFailed: 0,
          avgDeliveryRate: 0,
          avgClickRate: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching push notifications:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/push - Create and send push notification
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Verify admin/guide access
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !['ADMIN', 'GUIDE'].includes(session.user.role)) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      body: notificationBody,
      targeting,
      scheduledFor,
      priority = 'normal',
      ttl = 86400, // 24 hours
      actions,
      campaign,
      platformSettings,
      advancedSettings,
      sendImmediately = false
    } = body;

    // Validation
    if (!title || !notificationBody) {
      return NextResponse.json(
        { success: false, message: 'Title and body are required' },
        { status: 400 }
      );
    }

    if (!targeting || !targeting.type) {
      return NextResponse.json(
        { success: false, message: 'Targeting configuration is required' },
        { status: 400 }
      );
    }

    // Create notification
    const notification = new PushNotification({
      title,
      body: notificationBody,
      targeting,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      status: sendImmediately ? 'sending' : (scheduledFor ? 'scheduled' : 'draft'),
      priority,
      ttl,
      actions: actions || [],
      campaign,
      platformSettings: platformSettings || {},
      advancedSettings: advancedSettings || {},
      createdBy: session.user.id
    });

    await notification.save();

    // If sending immediately, process the notification
    if (sendImmediately) {
      try {
        // Get target device tokens based on targeting criteria
        let deviceTokens: any[] = [];

        switch (targeting.type) {
          case 'all':
            deviceTokens = await (DeviceToken as any).findActiveTokens();
            break;

          case 'users':
            if (targeting.userIds && targeting.userIds.length > 0) {
              deviceTokens = await (DeviceToken as Model<any>).find({
                user: { $in: targeting.userIds },
                isActive: true,
                isValid: true,
                'preferences.enabled': true
              });
            }
            break;

          case 'roles':
            if (targeting.roles && targeting.roles.length > 0) {
              const users = await (User as Model<any>).find(
                { role: { $in: targeting.roles } },
                { _id: 1 }
              );
              const userIds = users.map(u => u._id);
              deviceTokens = await (DeviceToken as Model<any>).find({
                user: { $in: userIds },
                isActive: true,
                isValid: true,
                'preferences.enabled': true
              });
            }
            break;

          case 'segments':
            // Implement segment-based targeting based on your criteria
            if (targeting.segments) {
              const segmentQuery: any = {
                isActive: true,
                isValid: true,
                'preferences.enabled': true
              };

              // Add segment filters
              if (targeting.segments.platform) {
                segmentQuery.platform = { $in: targeting.segments.platform };
              }
              if (targeting.segments.location) {
                if (targeting.segments.location.countries) {
                  segmentQuery['location.country'] = { $in: targeting.segments.location.countries };
                }
                if (targeting.segments.location.regions) {
                  segmentQuery['location.region'] = { $in: targeting.segments.location.regions };
                }
              }

              deviceTokens = await (DeviceToken as Model<any>).find(segmentQuery);
            }
            break;

          case 'devices':
            if (targeting.deviceTokens && targeting.deviceTokens.length > 0) {
              deviceTokens = await (DeviceToken as Model<any>).find({
                token: { $in: targeting.deviceTokens },
                isActive: true,
                isValid: true
              });
            }
            break;
        }

        // Send notifications (mock implementation for now)
        const results = {
          sent: deviceTokens.length,
          delivered: deviceTokens.length,
          failed: 0
        };

        // Update notification with results
        notification.analytics.sent = results.sent;
        notification.analytics.delivered = results.delivered;
        notification.analytics.failed = results.failed;
        notification.status = 'sent';
        notification.sentAt = new Date();

        await notification.save();

        return NextResponse.json({
          success: true,
          data: {
            notification,
            results: {
              sent: results.sent,
              delivered: results.delivered,
              failed: results.failed
            }
          },
          message: 'Push notification sent successfully'
        });
      } catch (sendError) {
        console.error('Error sending push notification:', sendError);
        
        // Update notification status to failed
        notification.status = 'failed';
        await notification.save();

        return NextResponse.json(
          { 
            success: false, 
            message: 'Failed to send push notification',
            data: { notification }
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: { notification },
      message: sendImmediately ? 'Push notification sent' : 'Push notification created'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating push notification:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}