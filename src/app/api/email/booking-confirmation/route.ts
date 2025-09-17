import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking, { IBooking } from '@/models/Booking';
import Event, { IEvent } from '@/models/Event';
import User, { IUser } from '@/models/User';
import { sendBookingConfirmation } from '@/lib/email';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/email/booking-confirmation - Send booking confirmation email
export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find booking with populated event and user data
    const booking = await (Booking as Model<IBooking>)
      .findById(bookingId)
      .populate('eventId')
      .populate('userId');

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const event = booking.eventId as unknown as IEvent;
    const user = booking.userId as unknown as IUser;

    // Send confirmation email
    await sendBookingConfirmation(booking as any, event, user);

    // Update booking to mark confirmation as sent
    await (Booking as Model<IBooking>).findByIdAndUpdate(
      bookingId,
      { confirmationSent: true },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Booking confirmation email sent successfully'
    });

  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return NextResponse.json(
      { error: 'Failed to send confirmation email' },
      { status: 500 }
    );
  }
}

// GET /api/email/booking-confirmation/[bookingId] - Resend confirmation for specific booking (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const bookingId = url.pathname.split('/').pop();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const booking = await (Booking as Model<IBooking>)
      .findById(bookingId)
      .populate('eventId')
      .populate('userId');

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const event = booking.eventId as unknown as IEvent;
    const bookingUser = booking.userId as unknown as IUser;

    await sendBookingConfirmation(booking as any, event, bookingUser);

    return NextResponse.json({
      success: true,
      message: 'Booking confirmation email resent successfully'
    });

  } catch (error) {
    console.error('Error resending booking confirmation:', error);
    return NextResponse.json(
      { error: 'Failed to resend confirmation email' },
      { status: 500 }
    );
  }
}