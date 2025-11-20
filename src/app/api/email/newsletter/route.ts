import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subscriber, { ISubscriber } from '@/models/Subscriber';
import { sendNewsletterEmail } from '@/lib/email';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/email/newsletter - Send newsletter to subscribers (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { subject, content, tags } = await request.json();

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Build query based on tags
    const query: any = { isActive: true };
    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Get active subscribers
    const subscribers = await (Subscriber as Model<ISubscriber>)
      .find(query)
      .select('email name preferences');

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found' },
        { status: 404 }
      );
    }

    // Send newsletter to all subscribers
    const subscriberEmails = subscribers.map(sub => sub.email);
    
    await sendNewsletterEmail(subscriberEmails, subject, content);

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${subscribers.length} subscribers`,
      recipientCount: subscribers.length
    });

  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}

// GET /api/email/newsletter/stats - Get newsletter statistics (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    // Get subscriber statistics
    const totalSubscribers = await (Subscriber as Model<ISubscriber>).countDocuments();
    const activeSubscribers = await (Subscriber as Model<ISubscriber>).countDocuments({ isActive: true });
    const inactiveSubscribers = totalSubscribers - activeSubscribers;

    // Get subscribers by tags
    const tagStats = await (Subscriber as Model<ISubscriber>).aggregate([
      { $match: { isActive: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get recent subscribers (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSubscribers = await (Subscriber as Model<ISubscriber>)
      .countDocuments({ 
        createdAt: { $gte: thirtyDaysAgo },
        isActive: true 
      });

    return NextResponse.json({
      success: true,
      stats: {
        total: totalSubscribers,
        active: activeSubscribers,
        inactive: inactiveSubscribers,
        recent: recentSubscribers,
        tagBreakdown: tagStats
      }
    });

  } catch (error) {
    console.error('Error fetching newsletter stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter statistics' },
      { status: 500 }
    );
  }
}