import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking, { IBooking } from '@/models/Booking';
import Event, { IEvent } from '@/models/Event';
import User, { IUser } from '@/models/User';
import { sendBookingConfirmation } from '@/lib/email';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/email/booking-reminder - Send booking reminders (Admin only or automated)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Allow admin access or system calls (no auth for automated reminders)
    if (session && session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { bookingId, daysAhead } = await request.json();

    await connectDB();

    let bookings: any[];

    if (bookingId) {
      // Send reminder for specific booking
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

      bookings = [booking];
    } else {
      // Send reminders for upcoming bookings
      const reminderDate = new Date();
      reminderDate.setDate(reminderDate.getDate() + (daysAhead || 1));
      
      const startOfDay = new Date(reminderDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(reminderDate);
      endOfDay.setHours(23, 59, 59, 999);

      bookings = await (Booking as Model<IBooking>)
        .find({
          date: { $gte: startOfDay, $lte: endOfDay },
          status: { $in: ['CONFIRMED', 'PENDING'] },
          reminderSent: false
        })
        .populate('eventId')
        .populate('userId');
    }

    if (bookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No bookings found for reminders',
        remindersSent: 0
      });
    }

    // Send reminder emails
    const reminderPromises = bookings.map(async (booking) => {
      const event = booking.eventId as unknown as IEvent;
      const user = booking.userId as unknown as IUser;

      // Create reminder email content (reusing booking confirmation template for now)
      await sendBookingConfirmation(booking, event, user);

      // Mark reminder as sent
      await (Booking as Model<IBooking>).findByIdAndUpdate(
        booking._id,
        { reminderSent: true },
        { new: true }
      );
    });

    await Promise.all(reminderPromises);

    return NextResponse.json({
      success: true,
      message: `Booking reminders sent successfully`,
      remindersSent: bookings.length
    });

  } catch (error) {
    console.error('Error sending booking reminders:', error);
    return NextResponse.json(
      { error: 'Failed to send booking reminders' },
      { status: 500 }
    );
  }
}

// GET /api/email/booking-reminder/pending - Get bookings that need reminders (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const daysAhead = parseInt(url.searchParams.get('days') || '1');

    await connectDB();

    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + daysAhead);
    
    const startOfDay = new Date(reminderDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(reminderDate);
    endOfDay.setHours(23, 59, 59, 999);

    const pendingReminders = await (Booking as Model<IBooking>)
      .find({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $in: ['CONFIRMED', 'PENDING'] },
        reminderSent: false
      })
      .populate('eventId', 'title slug')
      .populate('userId', 'name email')
      .select('bookingId date finalAmount participants reminderSent')
      .sort({ date: 1 });

    return NextResponse.json({
      success: true,
      pendingReminders,
      count: pendingReminders.length,
      reminderDate: reminderDate.toISOString()
    });

  } catch (error) {
    console.error('Error fetching pending reminders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending reminders' },
      { status: 500 }
    );
  }
}