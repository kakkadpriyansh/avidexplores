import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromoCode, { IPromoCode } from '@/models/PromoCode';
import PromoCodeUsage, { IPromoCodeUsage } from '@/models/PromoCodeUsage';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Model } from 'mongoose';

// GET /api/promo-codes/analytics - Get promo code analytics (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const promoCodeId = searchParams.get('promoCodeId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build date filter
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.usedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      const periodDays = parseInt(period);
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - periodDays);
      dateFilter.usedAt = { $gte: fromDate };
    }

    // Overall statistics
    const totalPromoCodes = await (PromoCode as Model<IPromoCode>).countDocuments();
    const activePromoCodes = await (PromoCode as Model<IPromoCode>).countDocuments({ isActive: true });
    const expiredPromoCodes = await (PromoCode as Model<IPromoCode>).countDocuments({
      isActive: true,
      validUntil: { $lt: new Date() }
    });

    // Usage statistics for the period
    const usageFilter = promoCodeId ? { ...dateFilter, promoCode: promoCodeId } : dateFilter;
    
    const usageStats = await PromoCodeUsage.aggregate([
      { $match: usageFilter },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' },
          totalRevenue: { $sum: '$finalAmount' },
          averageDiscount: { $avg: '$discountAmount' },
          averageOrderValue: { $avg: '$originalAmount' }
        }
      }
    ]);

    const periodStats = usageStats[0] || {
      totalUsage: 0,
      totalDiscount: 0,
      totalRevenue: 0,
      averageDiscount: 0,
      averageOrderValue: 0
    };

    // Top performing promo codes
    const topPromoCodesByUsage = await PromoCodeUsage.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$promoCode',
          usageCount: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' },
          totalRevenue: { $sum: '$finalAmount' }
        }
      },
      {
        $lookup: {
          from: 'promocodes',
          localField: '_id',
          foreignField: '_id',
          as: 'promoCode'
        }
      },
      { $unwind: '$promoCode' },
      {
        $project: {
          code: '$promoCode.code',
          description: '$promoCode.description',
          type: '$promoCode.type',
          value: '$promoCode.value',
          usageCount: 1,
          totalDiscount: 1,
          totalRevenue: 1
        }
      },
      { $sort: { usageCount: -1 } },
      { $limit: 10 }
    ]);

    // Top performing promo codes by discount amount
    const topPromoCodesByDiscount = await PromoCodeUsage.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$promoCode',
          usageCount: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' },
          totalRevenue: { $sum: '$finalAmount' }
        }
      },
      {
        $lookup: {
          from: 'promocodes',
          localField: '_id',
          foreignField: '_id',
          as: 'promoCode'
        }
      },
      { $unwind: '$promoCode' },
      {
        $project: {
          code: '$promoCode.code',
          description: '$promoCode.description',
          type: '$promoCode.type',
          value: '$promoCode.value',
          usageCount: 1,
          totalDiscount: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalDiscount: -1 } },
      { $limit: 10 }
    ]);

    // Daily usage trends
    const dailyTrends = await PromoCodeUsage.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: '$usedAt' },
            month: { $month: '$usedAt' },
            day: { $dayOfMonth: '$usedAt' }
          },
          usageCount: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' },
          totalRevenue: { $sum: '$finalAmount' }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          usageCount: 1,
          totalDiscount: 1,
          totalRevenue: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Promo code type distribution
    const typeDistribution = await PromoCodeUsage.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'promocodes',
          localField: 'promoCode',
          foreignField: '_id',
          as: 'promoCode'
        }
      },
      { $unwind: '$promoCode' },
      {
        $group: {
          _id: '$promoCode.type',
          count: { $sum: 1 },
          totalDiscount: { $sum: '$discountAmount' }
        }
      }
    ]);

    // User engagement with promo codes
    const userEngagement = await PromoCodeUsage.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$user',
          usageCount: { $sum: 1 },
          totalSavings: { $sum: '$discountAmount' }
        }
      },
      {
        $group: {
          _id: null,
          uniqueUsers: { $sum: 1 },
          averageUsagePerUser: { $avg: '$usageCount' },
          totalUsers: { $sum: 1 }
        }
      }
    ]);

    const engagement = userEngagement[0] || {
      uniqueUsers: 0,
      averageUsagePerUser: 0,
      totalUsers: 0
    };

    // Recent activity
    const recentActivity = await (PromoCodeUsage as Model<IPromoCodeUsage>).find(dateFilter)
      .populate('promoCode', 'code description type value')
      .populate('user', 'name email')
      .populate('booking', 'bookingId')
      .sort({ usedAt: -1 })
      .limit(20);

    return NextResponse.json({
      overview: {
        totalPromoCodes,
        activePromoCodes,
        expiredPromoCodes,
        ...periodStats
      },
      topPerformers: {
        byUsage: topPromoCodesByUsage,
        byDiscount: topPromoCodesByDiscount
      },
      trends: {
        daily: dailyTrends
      },
      distribution: {
        byType: typeDistribution
      },
      userEngagement: engagement,
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        promoCode: activity.promoCode,
        user: activity.user,
        booking: activity.booking,
        usedAt: activity.usedAt,
        discount: activity.discountAmount,
        finalAmount: activity.finalAmount
      }))
    });
  } catch (error) {
    console.error('Error fetching promo code analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo code analytics' },
      { status: 500 }
    );
  }
}