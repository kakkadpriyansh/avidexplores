import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import Subscriber from '@/models/Subscriber';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { Model } from 'mongoose';

// GET /api/notifications/newsletter - Get newsletters
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const audienceType = searchParams.get('audienceType');
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

    if (audienceType) {
      query['targeting.audienceType'] = audienceType;
    }

    if (campaign) {
      query['campaign.id'] = campaign;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
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

    const [newsletters, total] = await Promise.all([
      (Newsletter as Model<any>).find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      (Newsletter as Model<any>).countDocuments(query)
    ]);

    // Get summary statistics
    const stats = await (Newsletter as Model<any>).aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSent: { $sum: '$analytics.sent' },
          totalDelivered: { $sum: '$analytics.delivered' },
          totalOpened: { $sum: '$analytics.opened' },
          totalClicked: { $sum: '$analytics.clicked' },
          totalUnsubscribed: { $sum: '$analytics.unsubscribed' },
          avgOpenRate: { $avg: '$analytics.openRate' },
          avgClickRate: { $avg: '$analytics.clickRate' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        newsletters,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          totalSent: 0,
          totalDelivered: 0,
          totalOpened: 0,
          totalClicked: 0,
          totalUnsubscribed: 0,
          avgOpenRate: 0,
          avgClickRate: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/newsletter - Create newsletter
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
      subject,
      content,
      targeting,
      scheduledFor,
      campaign,
      abTest,
      attachments,
      sendImmediately = false
    } = body;

    // Validation
    if (!title || !subject || !content) {
      return NextResponse.json(
        { success: false, message: 'Title, subject, and content are required' },
        { status: 400 }
      );
    }

    if (!targeting || !targeting.audienceType) {
      return NextResponse.json(
        { success: false, message: 'Targeting configuration is required' },
        { status: 400 }
      );
    }

    // Create newsletter
    const newsletter = new Newsletter({
      title,
      subject,
      content,
      targeting,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      status: sendImmediately ? 'sending' : (scheduledFor ? 'scheduled' : 'draft'),
      campaign,
      abTest,
      attachments: attachments || [],
      createdBy: session.user.id
    });

    await newsletter.save();

    // If sending immediately, process the newsletter
    if (sendImmediately) {
      try {
        // Get target subscribers based on targeting criteria
        let subscribers: any[] = [];

        switch (targeting.audienceType) {
          case 'all':
            subscribers = await (Subscriber as Model<any>).find({
              isActive: true,
              isSubscribed: true
            });
            break;

          case 'subscribers':
            if (targeting.subscriberIds && targeting.subscriberIds.length > 0) {
              subscribers = await (Subscriber as Model<any>).find({
                _id: { $in: targeting.subscriberIds },
                isActive: true,
                isSubscribed: true
              });
            }
            break;

          case 'users':
            if (targeting.userIds && targeting.userIds.length > 0) {
              const users = await (User as Model<any>).find(
                { _id: { $in: targeting.userIds } },
                { email: 1, name: 1 }
              );
              subscribers = users.map(u => ({
                email: u.email,
                name: u.name,
                isActive: true,
                isSubscribed: true
              }));
            }
            break;

          case 'segments':
            // Implement segment-based targeting
            if (targeting.segments) {
              const segmentQuery: any = {
                isActive: true,
                isSubscribed: true
              };

              // Add segment filters
              if (targeting.segments.tags && targeting.segments.tags.length > 0) {
                segmentQuery.tags = { $in: targeting.segments.tags };
              }
              if (targeting.segments.location) {
                if (targeting.segments.location.countries) {
                  segmentQuery['location.country'] = { $in: targeting.segments.location.countries };
                }
                if (targeting.segments.location.regions) {
                  segmentQuery['location.region'] = { $in: targeting.segments.location.regions };
                }
              }
              if (targeting.segments.subscriptionDate) {
                if (targeting.segments.subscriptionDate.after) {
                  segmentQuery.subscribedAt = { $gte: new Date(targeting.segments.subscriptionDate.after) };
                }
                if (targeting.segments.subscriptionDate.before) {
                  segmentQuery.subscribedAt = { ...segmentQuery.subscribedAt, $lte: new Date(targeting.segments.subscriptionDate.before) };
                }
              }

              subscribers = await (Subscriber as Model<any>).find(segmentQuery);
            }
            break;
        }

        // Mock email sending (implement actual email service)
        const results = {
          sent: subscribers.length,
          delivered: Math.floor(subscribers.length * 0.95), // 95% delivery rate
          opened: Math.floor(subscribers.length * 0.25), // 25% open rate
          clicked: Math.floor(subscribers.length * 0.05), // 5% click rate
          bounced: Math.floor(subscribers.length * 0.02), // 2% bounce rate
          complained: Math.floor(subscribers.length * 0.001), // 0.1% complaint rate
          unsubscribed: Math.floor(subscribers.length * 0.005) // 0.5% unsubscribe rate
        };

        // Update newsletter with results
        newsletter.analytics.sent = results.sent;
        newsletter.analytics.delivered = results.delivered;
        newsletter.analytics.opened = results.opened;
        newsletter.analytics.clicked = results.clicked;
        newsletter.analytics.bounced = results.bounced;
        newsletter.analytics.complained = results.complained;
        newsletter.analytics.unsubscribed = results.unsubscribed;
        newsletter.status = 'sent';
        newsletter.sentAt = new Date();

        await newsletter.save();

        return NextResponse.json({
          success: true,
          data: {
            newsletter,
            results
          },
          message: 'Newsletter sent successfully'
        });
      } catch (sendError) {
        console.error('Error sending newsletter:', sendError);
        
        // Update newsletter status to failed
        newsletter.status = 'failed';
        await newsletter.save();

        return NextResponse.json(
          { 
            success: false, 
            message: 'Failed to send newsletter',
            data: { newsletter }
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: { newsletter },
      message: sendImmediately ? 'Newsletter sent' : 'Newsletter created'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating newsletter:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}