import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromoCode, { IPromoCode } from '@/models/PromoCode';
import PromoCodeUsage from '@/models/PromoCodeUsage';
import { verifyToken } from '@/lib/auth';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/promo-codes - Get all promo codes with filtering and pagination (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const isPublic = searchParams.get('isPublic');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter object
    const filter: any = {};

    if (search) {
      filter.$or = [
        { code: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }

    if (type) filter.type = type;
    if (isActive !== null && isActive !== undefined) filter.isActive = isActive === 'true';
    if (isPublic !== null && isPublic !== undefined) filter.isPublic = isPublic === 'true';
    if (category) filter.applicableCategories = category;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get promo codes with pagination
    const promoCodes = await (PromoCode as Model<IPromoCode>).find(filter)
      .populate('createdBy', 'name email')
      .populate('applicableEvents', 'title slug')
      .populate('excludedEvents', 'title slug')
      .populate('targetUsers', 'name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await (PromoCode as Model<IPromoCode>).countDocuments(filter);

    // Get usage statistics for each promo code
    const promoCodesWithStats = await Promise.all(
      promoCodes.map(async (promoCode) => {
        const usageStats = await PromoCodeUsage.aggregate([
          { $match: { promoCode: promoCode._id } },
          {
            $group: {
              _id: null,
              totalUsage: { $sum: 1 },
              totalDiscount: { $sum: '$discountAmount' },
              totalRevenue: { $sum: '$finalAmount' }
            }
          }
        ]);

        return {
          ...promoCode.toObject(),
          stats: usageStats[0] || {
            totalUsage: 0,
            totalDiscount: 0,
            totalRevenue: 0
          }
        };
      })
    );

    return NextResponse.json({
      promoCodes: promoCodesWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching promo codes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch promo codes' },
      { status: 500 }
    );
  }
}

// POST /api/promo-codes - Create new promo code (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      code,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      userUsageLimit,
      validFrom,
      validUntil,
      applicableEvents,
      applicableCategories,
      excludedEvents,
      isActive = true,
      isPublic = true,
      targetUsers
    } = body;

    // Validation
    if (!code || !description || !type || value === undefined || !validFrom || !validUntil) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingCode = await (PromoCode as Model<IPromoCode>).findOne({ code: code.toUpperCase() });
    if (existingCode) {
      return NextResponse.json(
        { error: 'Promo code already exists' },
        { status: 400 }
      );
    }

    // Additional validations
    if (new Date(validUntil) <= new Date(validFrom)) {
      return NextResponse.json(
        { error: 'Valid until date must be after valid from date' },
        { status: 400 }
      );
    }

    if (type === 'PERCENTAGE' && (value < 0 || value > 100)) {
      return NextResponse.json(
        { error: 'Percentage value must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (type === 'FIXED_AMOUNT' && value < 0) {
      return NextResponse.json(
        { error: 'Fixed amount cannot be negative' },
        { status: 400 }
      );
    }

    // Create promo code
    const promoCode = new PromoCode({
      code: code.toUpperCase(),
      description,
      type,
      value,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      userUsageLimit,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      applicableEvents,
      applicableCategories,
      excludedEvents,
      isActive,
      isPublic,
      targetUsers,
      createdBy: session.user.id
    });

    await promoCode.save();

    // Populate references for response
    await promoCode.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'applicableEvents', select: 'title slug' },
      { path: 'excludedEvents', select: 'title slug' },
      { path: 'targetUsers', select: 'name email' }
    ]);

    return NextResponse.json({
      message: 'Promo code created successfully',
      promoCode
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to create promo code' },
      { status: 500 }
    );
  }
}

// PUT /api/promo-codes - Update promo code (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Promo code ID is required' },
        { status: 400 }
      );
    }

    // Find and update promo code
    const promoCode = await (PromoCode as Model<IPromoCode>).findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'applicableEvents', select: 'title slug' },
      { path: 'excludedEvents', select: 'title slug' },
      { path: 'targetUsers', select: 'name email' }
    ]);

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Promo code not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Promo code updated successfully',
      promoCode
    });

  } catch (error) {
    console.error('Error updating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to update promo code' },
      { status: 500 }
    );
  }
}

// DELETE /api/promo-codes - Delete promo code (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Promo code ID is required' },
        { status: 400 }
      );
    }

    // Check if promo code has been used
    const usageCount = await PromoCodeUsage.countDocuments({ promoCode: id });
    
    if (usageCount > 0) {
      // Soft delete - deactivate instead of removing
      const promoCode = await (PromoCode as Model<IPromoCode>).findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!promoCode) {
        return NextResponse.json(
          { error: 'Promo code not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Promo code deactivated (has usage history)',
        promoCode
      });
    } else {
      // Hard delete if never used
      const promoCode = await (PromoCode as Model<IPromoCode>).findByIdAndDelete(id);

      if (!promoCode) {
        return NextResponse.json(
          { error: 'Promo code not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        message: 'Promo code deleted successfully'
      });
    }

  } catch (error) {
    console.error('Error deleting promo code:', error);
    return NextResponse.json(
      { error: 'Failed to delete promo code' },
      { status: 500 }
    );
  }
}