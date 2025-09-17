import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromoCode, { IPromoCode } from '@/models/PromoCode';
import PromoCodeUsage from '@/models/PromoCodeUsage';
import Event, { IEvent } from '@/models/Event';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/promo-codes/validate - Validate promo code for a booking
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { code, eventId, amount, userId } = body;

    if (!code || !eventId || !amount) {
      return NextResponse.json(
        { error: 'Code, event ID, and amount are required' },
        { status: 400 }
      );
    }

    // Find the promo code
    const promoCode = await (PromoCode as Model<IPromoCode>).findOne({
      code: code.toUpperCase(),
      isActive: true
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Invalid promo code' },
        { status: 400 }
      );
    }

    // Check if code is currently valid (date range)
    const now = new Date();
    if (promoCode.validFrom > now || promoCode.validUntil < now) {
      return NextResponse.json(
        { error: 'Promo code has expired or is not yet active' },
        { status: 400 }
      );
    }

    // Check usage limit
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return NextResponse.json(
        { error: 'Promo code usage limit exceeded' },
        { status: 400 }
      );
    }

    // Check user usage limit
    if (promoCode.userUsageLimit) {
      const userUsageCount = await PromoCodeUsage.countDocuments({
        promoCode: promoCode._id,
        user: userId || session.user.id
      });

      if (userUsageCount >= promoCode.userUsageLimit) {
        return NextResponse.json(
          { error: 'You have exceeded the usage limit for this promo code' },
          { status: 400 }
        );
      }
    }

    // Check minimum order amount
    if (promoCode.minOrderAmount && amount < promoCode.minOrderAmount) {
      return NextResponse.json(
        { 
          error: `Minimum order amount of ₹${promoCode.minOrderAmount} required for this promo code` 
        },
        { status: 400 }
      );
    }

    // Get event details for category/event-specific validation
    const event = await (Event as Model<IEvent>).findById(eventId);
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if code is applicable to this event
    if (promoCode.applicableEvents && promoCode.applicableEvents.length > 0) {
      const isApplicableEvent = promoCode.applicableEvents.some(
        eventObjId => eventObjId.toString() === eventId
      );
      if (!isApplicableEvent) {
        return NextResponse.json(
          { error: 'This promo code is not applicable to the selected event' },
          { status: 400 }
        );
      }
    }

    // Check if code is applicable to this event category
    if (promoCode.applicableCategories && promoCode.applicableCategories.length > 0) {
      if (!promoCode.applicableCategories.includes(event.category)) {
        return NextResponse.json(
          { error: 'This promo code is not applicable to this event category' },
          { status: 400 }
        );
      }
    }

    // Check if event is excluded
    if (promoCode.excludedEvents && promoCode.excludedEvents.length > 0) {
      const isExcludedEvent = promoCode.excludedEvents.some(
        eventObjId => eventObjId.toString() === eventId
      );
      if (isExcludedEvent) {
        return NextResponse.json(
          { error: 'This promo code cannot be used for the selected event' },
          { status: 400 }
        );
      }
    }

    // Check if code is for specific users only
    if (!promoCode.isPublic && promoCode.targetUsers && promoCode.targetUsers.length > 0) {
      const isTargetUser = promoCode.targetUsers.some(
        userObjId => userObjId.toString() === (userId || session.user.id)
      );
      if (!isTargetUser) {
        return NextResponse.json(
          { error: 'This promo code is not available for your account' },
          { status: 400 }
        );
      }
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.type === 'PERCENTAGE') {
      discountAmount = (amount * promoCode.value) / 100;
    } else if (promoCode.type === 'FIXED_AMOUNT') {
      discountAmount = promoCode.value;
    }

    // Apply maximum discount limit
    if (promoCode.maxDiscountAmount && discountAmount > promoCode.maxDiscountAmount) {
      discountAmount = promoCode.maxDiscountAmount;
    }

    // Ensure discount doesn't exceed the order amount
    if (discountAmount > amount) {
      discountAmount = amount;
    }

    const finalAmount = amount - discountAmount;

    return NextResponse.json({
      valid: true,
      promoCode: {
        id: promoCode._id,
        code: promoCode.code,
        description: promoCode.description,
        type: promoCode.type,
        value: promoCode.value
      },
      discount: {
        originalAmount: amount,
        discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
        finalAmount: Math.round(finalAmount * 100) / 100,
        savings: Math.round(discountAmount * 100) / 100
      }
    });

  } catch (error) {
    console.error('Error validating promo code:', error);
    return NextResponse.json(
      { error: 'Failed to validate promo code' },
      { status: 500 }
    );
  }
}