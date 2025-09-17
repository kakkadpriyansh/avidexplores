import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Booking, { IBooking } from '@/models/Booking';
import { Model } from 'mongoose';
import crypto from 'crypto';

// POST /api/payment/verify - Verify Razorpay payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      bookingId 
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify booking exists and belongs to user
    const booking = await (Booking as Model<IBooking>).findOne({ bookingId }).lean();
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Verify Razorpay signature
    const body_string = razorpay_order_id + '|' + razorpay_payment_id;
    const expected_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body_string)
      .digest('hex');

    if (expected_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update booking with payment success
    const updatedBooking = await (Booking as Model<IBooking>).findOneAndUpdate(
      { bookingId },
      {
        'paymentInfo.paymentStatus': 'SUCCESS',
        'paymentInfo.paymentId': razorpay_payment_id,
        'paymentInfo.transactionId': razorpay_payment_id,
        'paymentInfo.paidAt': new Date(),
        status: 'CONFIRMED'
      },
      { new: true, lean: true }
    );

    if (!updatedBooking) {
      return NextResponse.json(
        { success: false, error: 'Failed to update booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      booking: {
        bookingId: updatedBooking.bookingId,
        status: updatedBooking.status,
        paymentStatus: updatedBooking.paymentInfo.paymentStatus
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}