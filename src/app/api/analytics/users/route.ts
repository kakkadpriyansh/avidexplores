import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import Booking, { IBooking } from '@/models/Booking';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/analytics/users - Get detailed user analytics (Admin only)
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

    // Overall user statistics
    const totalUsers = await (User as Model<IUser>).countDocuments();
    const activeUsers = await (User as Model<IUser>).countDocuments({ isActive: true });
    const newUsers = await (User as Model<IUser>).countDocuments({
      createdAt: { $gte: periodStart }
    });

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

    // User role distribution
    const roleDistribution = await (User as Model<IUser>).aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // User engagement - users with bookings
    const usersWithBookings = await (Booking as Model<IBooking>).aggregate([
      { $group: { _id: '$userId' } },
      { $count: 'totalUsersWithBookings' }
    ]);

    const engagementRate = totalUsers > 0 
      ? ((usersWithBookings[0]?.totalUsersWithBookings || 0) / totalUsers) * 100
      : 0;

    // Top users by booking count
    const topUsersByBookings = await (Booking as Model<IBooking>).aggregate([
      {
        $group: {
          _id: '$userId',
          bookingCount: { $sum: 1 },
          totalSpent: { $sum: '$finalAmount' },
          averageBookingValue: { $avg: '$finalAmount' }
        }
      },
      { $sort: { bookingCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userName: '$user.name',
          userEmail: '$user.email',
          bookingCount: 1,
          totalSpent: 1,
          averageBookingValue: 1
        }
      }
    ]);

    // Top users by revenue
    const topUsersByRevenue = await (Booking as Model<IBooking>).aggregate([
      {
        $match: {
          status: { $in: ['CONFIRMED', 'COMPLETED'] }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$finalAmount' },
          bookingCount: { $sum: 1 },
          averageBookingValue: { $avg: '$finalAmount' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          userName: '$user.name',
          userEmail: '$user.email',
          totalSpent: 1,
          bookingCount: 1,
          averageBookingValue: 1
        }
      }
    ]);

    // User registration sources (if available)
    const registrationSources = await (User as Model<IUser>).aggregate([
      {
        $group: {
          _id: '$registrationSource',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent user registrations
    const recentUsers = await (User as Model<IUser>)
      .find()
      .select('name email role createdAt isActive')
      .sort({ createdAt: -1 })
      .limit(10);

    // User activity metrics
    const userActivityMetrics = await (User as Model<IUser>).aggregate([
      {
        $lookup: {
          from: 'bookings',
          localField: '_id',
          foreignField: 'userId',
          as: 'bookings'
        }
      },
      {
        $addFields: {
          bookingCount: { $size: '$bookings' },
          totalSpent: { $sum: '$bookings.finalAmount' },
          lastBookingDate: { $max: '$bookings.createdAt' }
        }
      },
      {
        $group: {
          _id: null,
          averageBookingsPerUser: { $avg: '$bookingCount' },
          averageSpentPerUser: { $avg: '$totalSpent' },
          usersWithNoBookings: {
            $sum: { $cond: [{ $eq: ['$bookingCount', 0] }, 1, 0] }
          },
          usersWithMultipleBookings: {
            $sum: { $cond: [{ $gt: ['$bookingCount', 1] }, 1, 0] }
          }
        }
      }
    ]);

    // User retention - users who made bookings in different periods
    const retentionMetrics = await (Booking as Model<IBooking>).aggregate([
      {
        $group: {
          _id: '$userId',
          firstBooking: { $min: '$createdAt' },
          lastBooking: { $max: '$createdAt' },
          bookingCount: { $sum: 1 }
        }
      },
      {
        $addFields: {
          daysBetweenFirstAndLast: {
            $divide: [
              { $subtract: ['$lastBooking', '$firstBooking'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          averageRetentionDays: { $avg: '$daysBetweenFirstAndLast' },
          repeatCustomers: {
            $sum: { $cond: [{ $gt: ['$bookingCount', 1] }, 1, 0] }
          },
          oneTimeCustomers: {
            $sum: { $cond: [{ $eq: ['$bookingCount', 1] }, 1, 0] }
          }
        }
      }
    ]);

    const activityMetrics = userActivityMetrics[0] || {
      averageBookingsPerUser: 0,
      averageSpentPerUser: 0,
      usersWithNoBookings: 0,
      usersWithMultipleBookings: 0
    };

    const retention = retentionMetrics[0] || {
      averageRetentionDays: 0,
      repeatCustomers: 0,
      oneTimeCustomers: 0
    };

    const repeatCustomerRate = (retention.repeatCustomers + retention.oneTimeCustomers) > 0
      ? (retention.repeatCustomers / (retention.repeatCustomers + retention.oneTimeCustomers)) * 100
      : 0;

    return NextResponse.json({
      success: true,
      period: `${periodDays} days`,
      overview: {
        totalUsers,
        activeUsers,
        newUsers,
        engagementRate: Math.round(engagementRate * 100) / 100,
        repeatCustomerRate: Math.round(repeatCustomerRate * 100) / 100
      },
      charts: {
        userGrowth,
        roleDistribution,
        registrationSources
      },
      topUsers: {
        byBookings: topUsersByBookings,
        byRevenue: topUsersByRevenue
      },
      metrics: {
        ...activityMetrics,
        ...retention,
        averageBookingsPerUser: Math.round((activityMetrics.averageBookingsPerUser || 0) * 100) / 100,
        averageSpentPerUser: Math.round((activityMetrics.averageSpentPerUser || 0) * 100) / 100,
        averageRetentionDays: Math.round((retention.averageRetentionDays || 0) * 100) / 100
      },
      recentUsers
    });

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user analytics' },
      { status: 500 }
    );
  }
}