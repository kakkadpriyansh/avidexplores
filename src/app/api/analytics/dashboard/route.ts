import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking, { IBooking } from '@/models/Booking';
import Event, { IEvent } from '@/models/Event';
import User, { IUser } from '@/models/User';
import Subscriber, { ISubscriber } from '@/models/Subscriber';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Model } from 'mongoose';

// GET /api/analytics/dashboard - Get comprehensive dashboard analytics (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '30'; // days
    const periodDays = parseInt(period);

    await connectDB();

    const now = new Date();
    const periodStart = new Date(now.getTime() - (periodDays * 24 * 60 * 60 * 1000));

    // Overall Statistics
    const [totalUsers, totalEvents, totalBookings, totalRevenue] = await Promise.all([
      (User as Model<IUser>).countDocuments({ isActive: true }),
      (Event as Model<IEvent>).countDocuments({ isActive: true }),
      (Booking as Model<IBooking>).countDocuments(),
      (Booking as Model<IBooking>).aggregate([
        { $match: { status: { $in: ['CONFIRMED', 'COMPLETED'] } } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ])
    ]);

    // Period-specific statistics
    const periodBookings = await (Booking as Model<IBooking>).countDocuments({
      createdAt: { $gte: periodStart }
    });

    const periodRevenue = await (Booking as Model<IBooking>).aggregate([
      { 
        $match: { 
          createdAt: { $gte: periodStart },
          status: { $in: ['CONFIRMED', 'COMPLETED'] }
        }
      },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);

    const newUsers = await (User as Model<IUser>).countDocuments({
      createdAt: { $gte: periodStart }
    });

    // Monthly revenue trend (last 12 months)
    const monthlyRevenue = await (Booking as Model<IBooking>).aggregate([
      {
        $match: {
          status: { $in: ['CONFIRMED', 'COMPLETED'] },
          createdAt: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$finalAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Popular tours (by booking count)
    const popularTours = await (Booking as Model<IBooking>).aggregate([
      { $match: { status: { $in: ['CONFIRMED', 'COMPLETED', 'PENDING'] } } },
      { $group: { _id: '$eventId', bookings: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' },
      {
        $project: {
          title: '$event.title',
          slug: '$event.slug',
          bookings: 1,
          revenue: 1
        }
      }
    ]);

    // Booking status distribution
    const bookingStatusStats = await (Booking as Model<IBooking>).aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // User growth trend (last 12 months)
    const userGrowth = await (User as Model<IUser>).aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Recent bookings
    const recentBookings = await (Booking as Model<IBooking>)
      .find()
      .populate('eventId', 'title slug')
      .populate('userId', 'name email')
      .select('bookingId status finalAmount createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

    // Payment method distribution
    const paymentMethods = await (Booking as Model<IBooking>).aggregate([
      { $match: { 'paymentInfo.paymentStatus': 'SUCCESS' } },
      { $group: { _id: '$paymentInfo.paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$finalAmount' } } },
      { $sort: { count: -1 } }
    ]);

    // Newsletter subscribers
    const subscriberStats = await (Subscriber as Model<ISubscriber>).aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      period: `${periodDays} days`,
      overview: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        periodBookings,
        periodRevenue: periodRevenue[0]?.total || 0,
        newUsers,
        subscribers: subscriberStats[0] || { total: 0, active: 0 }
      },
      charts: {
        monthlyRevenue,
        userGrowth,
        bookingStatusStats,
        paymentMethods
      },
      popularTours,
      recentBookings
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard analytics' },
      { status: 500 }
    );
  }
}