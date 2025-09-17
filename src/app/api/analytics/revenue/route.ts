import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking, { IBooking } from '@/models/Booking';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/analytics/revenue - Get detailed revenue analytics (Admin only)
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
    const period = url.searchParams.get('period') || 'month'; // day, week, month, year
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const eventId = url.searchParams.get('eventId');

    await connectDB();

    // Build date range
    let dateRange: any = {};
    const now = new Date();

    if (startDate && endDate) {
      dateRange = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      // Default ranges based on period
      switch (period) {
        case 'day':
          dateRange.createdAt = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
          break;
        case 'week':
          dateRange.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'month':
          dateRange.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
          break;
        case 'year':
          dateRange.createdAt = { $gte: new Date(now.getFullYear(), 0, 1) };
          break;
        default:
          dateRange.createdAt = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
      }
    }

    // Build match criteria
    const matchCriteria: any = {
      ...dateRange,
      status: { $in: ['CONFIRMED', 'COMPLETED'] }
    };

    if (eventId) {
      matchCriteria.eventId = eventId;
    }

    // Revenue by time period
    let groupBy: any;
    switch (period) {
      case 'day':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
        break;
      case 'week':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        };
        break;
      case 'month':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'year':
        groupBy = {
          year: { $year: '$createdAt' }
        };
        break;
      default:
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
    }

    const revenueByPeriod = await (Booking as Model<IBooking>).aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: groupBy,
          totalRevenue: { $sum: '$finalAmount' },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: '$finalAmount' },
          totalDiscount: { $sum: '$discountAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Revenue by event
    const revenueByEvent = await (Booking as Model<IBooking>).aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$eventId',
          totalRevenue: { $sum: '$finalAmount' },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: '$finalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 20 },
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
          eventTitle: '$event.title',
          eventSlug: '$event.slug',
          totalRevenue: 1,
          totalBookings: 1,
          averageBookingValue: 1
        }
      }
    ]);

    // Revenue by payment method
    const revenueByPaymentMethod = await (Booking as Model<IBooking>).aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: '$paymentInfo.paymentMethod',
          totalRevenue: { $sum: '$finalAmount' },
          totalBookings: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    // Overall statistics for the period
    const overallStats = await (Booking as Model<IBooking>).aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalBookings: { $sum: 1 },
          averageBookingValue: { $avg: '$finalAmount' },
          totalDiscount: { $sum: '$discountAmount' },
          maxBookingValue: { $max: '$finalAmount' },
          minBookingValue: { $min: '$finalAmount' }
        }
      }
    ]);

    // Revenue comparison with previous period
    let previousPeriodStart: Date;
    let previousPeriodEnd: Date;

    if (startDate && endDate) {
      const periodLength = new Date(endDate).getTime() - new Date(startDate).getTime();
      previousPeriodEnd = new Date(startDate);
      previousPeriodStart = new Date(previousPeriodEnd.getTime() - periodLength);
    } else {
      const currentStart = dateRange.createdAt.$gte;
      const periodLength = now.getTime() - currentStart.getTime();
      previousPeriodEnd = currentStart;
      previousPeriodStart = new Date(currentStart.getTime() - periodLength);
    }

    const previousPeriodStats = await (Booking as Model<IBooking>).aggregate([
      {
        $match: {
          createdAt: {
            $gte: previousPeriodStart,
            $lt: previousPeriodEnd
          },
          status: { $in: ['CONFIRMED', 'COMPLETED'] },
          ...(eventId && { eventId })
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$finalAmount' },
          totalBookings: { $sum: 1 }
        }
      }
    ]);

    const currentStats = overallStats[0] || {
      totalRevenue: 0,
      totalBookings: 0,
      averageBookingValue: 0,
      totalDiscount: 0,
      maxBookingValue: 0,
      minBookingValue: 0
    };

    const previousStats = previousPeriodStats[0] || {
      totalRevenue: 0,
      totalBookings: 0
    };

    const revenueGrowth = previousStats.totalRevenue > 0 
      ? ((currentStats.totalRevenue - previousStats.totalRevenue) / previousStats.totalRevenue) * 100
      : 0;

    const bookingGrowth = previousStats.totalBookings > 0
      ? ((currentStats.totalBookings - previousStats.totalBookings) / previousStats.totalBookings) * 100
      : 0;

    return NextResponse.json({
      success: true,
      period,
      dateRange: {
        start: dateRange.createdAt?.$gte || null,
        end: dateRange.createdAt?.$lte || now
      },
      overview: {
        ...currentStats,
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        bookingGrowth: Math.round(bookingGrowth * 100) / 100
      },
      charts: {
        revenueByPeriod,
        revenueByEvent,
        revenueByPaymentMethod
      }
    });

  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue analytics' },
      { status: 500 }
    );
  }
}