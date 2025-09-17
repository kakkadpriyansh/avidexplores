import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PromoCode, { IPromoCode } from '@/models/PromoCode';
import PromoCodeUsage from '@/models/PromoCodeUsage';
import Booking, { IBooking } from '@/models/Booking';
import { Model } from 'mongoose';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/promo-codes/apply - Apply promo code to a booking
export async function POST(request: NextRequest) {
  const session = await mongoose.startSession();
  
  try {
    const auth = await getServerSession(authOptions);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { code, bookingId, originalAmount } = body;

    if (!code || !bookingId || !originalAmount) {
      return NextResponse.json(
        { error: 'Code, booking ID, and original amount are required' },
        { status: 400 }
      );
    }

    await session.withTransaction(async () => {
      // Find the promo code
      const promoCode = await (PromoCode as Model<IPromoCode>).findOne({
        code: code.toUpperCase(),
        isActive: true
      }).session(session);

      if (!promoCode) {
        throw new Error('Invalid promo code');
      }

      // Find the booking
      const booking = await (Booking as Model<IBooking>).findById(bookingId)
        .populate('eventId')
        .session(session);

      if (!booking) {
        throw new Error('Booking not found');
      }

      // Verify booking belongs to user (unless admin)
      if (auth.user.role !== 'ADMIN' && booking.userId.toString() !== auth.user.id) {
        throw new Error('Unauthorized to modify this booking');
      }

      // Check if booking already has a promo code applied
      const existingUsage = await (PromoCodeUsage as any).findOne({ booking: bookingId }).session(session);
      if (existingUsage) {
        throw new Error('A promo code has already been applied to this booking');
      }

      // Validate promo code (similar to validate endpoint but within transaction)
      const now = new Date();
      if (promoCode.validFrom > now || promoCode.validUntil < now) {
        throw new Error('Promo code has expired or is not yet active');
      }

      if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
        throw new Error('Promo code usage limit exceeded');
      }

      if (promoCode.userUsageLimit) {
        const userUsageCount = await (PromoCodeUsage as any).countDocuments({
          promoCode: promoCode._id,
          user: booking.userId
        }).session(session);

        if (userUsageCount >= promoCode.userUsageLimit) {
          throw new Error('User has exceeded the usage limit for this promo code');
        }
      }

      if (promoCode.minOrderAmount && originalAmount < promoCode.minOrderAmount) {
        throw new Error(`Minimum order amount of ₹${promoCode.minOrderAmount} required`);
      }

      // Event-specific validations
      const event = booking.eventId as any;
      if (promoCode.applicableEvents && promoCode.applicableEvents.length > 0) {
        const isApplicableEvent = promoCode.applicableEvents.some(
          eventObjId => eventObjId.toString() === event._id.toString()
        );
        if (!isApplicableEvent) {
          throw new Error('This promo code is not applicable to the selected event');
        }
      }

      if (promoCode.applicableCategories && promoCode.applicableCategories.length > 0) {
        if (!promoCode.applicableCategories.includes(event.category)) {
          throw new Error('This promo code is not applicable to this event category');
        }
      }

      if (promoCode.excludedEvents && promoCode.excludedEvents.length > 0) {
        const isExcludedEvent = promoCode.excludedEvents.some(
          eventObjId => eventObjId.toString() === event._id.toString()
        );
        if (isExcludedEvent) {
          throw new Error('This promo code cannot be used for the selected event');
        }
      }

      if (!promoCode.isPublic && promoCode.targetUsers && promoCode.targetUsers.length > 0) {
        const isTargetUser = promoCode.targetUsers.some(
          userObjId => userObjId.toString() === booking.userId.toString()
        );
        if (!isTargetUser) {
          throw new Error('This promo code is not available for this user');
        }
      }

      // Calculate discount
      let discountAmount = 0;
      if (promoCode.type === 'PERCENTAGE') {
        discountAmount = (originalAmount * promoCode.value) / 100;
      } else if (promoCode.type === 'FIXED_AMOUNT') {
        discountAmount = promoCode.value;
      }

      if (promoCode.maxDiscountAmount && discountAmount > promoCode.maxDiscountAmount) {
        discountAmount = promoCode.maxDiscountAmount;
      }

      if (discountAmount > originalAmount) {
        discountAmount = originalAmount;
      }

      const finalAmount = originalAmount - discountAmount;

      // Update booking with discount
      await (Booking as Model<IBooking>).findByIdAndUpdate(
        bookingId,
        {
          discountAmount: Math.round(discountAmount * 100) / 100,
          finalAmount: Math.round(finalAmount * 100) / 100
        },
        { session }
      );

      // Create usage record
      const usage = new PromoCodeUsage({
        promoCode: promoCode._id,
        user: booking.userId,
        booking: bookingId,
        originalAmount,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100
      });
      await usage.save({ session });

      // Increment promo code usage count
      await (PromoCode as Model<IPromoCode>).findByIdAndUpdate(
        promoCode._id,
        { $inc: { usageCount: 1 } },
        { session }
      );

      return {
        success: true,
        discount: {
          originalAmount,
          discountAmount: Math.round(discountAmount * 100) / 100,
          finalAmount: Math.round(finalAmount * 100) / 100,
          savings: Math.round(discountAmount * 100) / 100
        },
        promoCode: {
          code: promoCode.code,
          description: promoCode.description
        }
      };
    });

    return NextResponse.json({
      message: 'Promo code applied successfully',
      success: true
    });

  } catch (error) {
    console.error('Error applying promo code:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to apply promo code';
    const statusCode = errorMessage.includes('Invalid') || 
                      errorMessage.includes('expired') || 
                      errorMessage.includes('exceeded') ||
                      errorMessage.includes('Minimum') ||
                      errorMessage.includes('not applicable') ||
                      errorMessage.includes('cannot be used') ||
                      errorMessage.includes('not available') ||
                      errorMessage.includes('already been applied') ? 400 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  } finally {
    await session.endSession();
  }
}

// DELETE /api/promo-codes/apply - Remove promo code from booking
export async function DELETE(request: NextRequest) {
  const session = await mongoose.startSession();
  
  try {
    const auth = await getServerSession(authOptions);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    await session.withTransaction(async () => {
      // Find booking
      const booking = await (Booking as Model<IBooking>).findById(bookingId).session(session);
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (auth.user.role !== 'ADMIN' && booking.userId.toString() !== auth.user.id) {
        throw new Error('Unauthorized to modify this booking');
      }

      // Find and delete usage record
      const usage = await (PromoCodeUsage as any).findOneAndDelete(
        { booking: bookingId },
        { session }
      );

      if (!usage) {
        throw new Error('No promo code applied to this booking');
      }

      // Revert booking amounts
      await (Booking as Model<IBooking>).findByIdAndUpdate(
        bookingId,
        {
          discountAmount: 0,
          finalAmount: booking.totalAmount
        },
        { session }
      );

      // Decrement promo code usage count
      await (PromoCode as Model<IPromoCode>).findByIdAndUpdate(
        usage.promoCode,
        { $inc: { usageCount: -1 } },
        { session }
      );
    });

    return NextResponse.json({
      message: 'Promo code removed successfully'
    });

  } catch (error) {
    console.error('Error removing promo code:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove promo code';
    const statusCode = errorMessage.includes('not found') || 
                      errorMessage.includes('No promo code') ? 404 : 
                      errorMessage.includes('Unauthorized') ? 401 : 500;

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  } finally {
    await session.endSession();
  }
}