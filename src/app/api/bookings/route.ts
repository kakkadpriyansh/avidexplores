import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking, { IBooking } from '@/models/Booking';
import { Model } from 'mongoose';
import Event, { IEvent } from '@/models/Event';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper to stringify event location
function stringifyLocation(loc: any): string {
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  const parts = [loc.name, loc.state, loc.country].filter(Boolean);
  return parts.join(', ');
}

// GET /api/bookings - Get bookings (with filters)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Admin-only access
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const eventId = searchParams.get('eventId');

    // Build filter object
    const filter: any = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (eventId) filter.eventId = eventId;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get bookings with populated data
    const rawBookings = await (Booking as Model<IBooking>).find(filter)
      .populate('userId', 'name email phone')
      .populate('eventId', 'title slug price location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Normalize event location field to string for frontend compatibility
    const bookings = rawBookings.map((b: any) => ({
      ...b,
      eventId: b.eventId ? { 
        ...b.eventId, 
        location: stringifyLocation((b.eventId as any).location) 
      } : b.eventId
    }));

    const total = await (Booking as Model<IBooking>).countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: bookings,
      bookings: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

// POST /api/bookings - Create new booking
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      eventId,
      selectedDate,
      participants,
      totalAmount,
      specialRequests
    } = body;

    // Validate required fields
    if (!eventId || !selectedDate || !participants || participants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if event exists and is active
    const event = await (Event as Model<IEvent>).findById(eventId);
    if (!event || !event.isActive) {
      return NextResponse.json(
        { success: false, error: 'Event not found or inactive' },
        { status: 404 }
      );
    }

    // Calculate amounts
    const computedTotal = totalAmount || event.price * participants.length;
    const discountAmount = 0; // apply promo/discounts here if any
    const finalAmount = computedTotal - discountAmount;

    // Check availability (simplified - you might want more complex logic)
    const existingBookings = await (Booking as Model<IBooking>).countDocuments({
      eventId,
      date: new Date(selectedDate),
      status: { $in: ['CONFIRMED', 'PENDING'] }
    });

    if (existingBookings >= event.maxParticipants) {
      return NextResponse.json(
        { success: false, error: 'Event is fully booked for this date' },
        { status: 400 }
      );
    }

    // Create booking with authenticated user ID and required schema fields
    const booking = await (Booking as Model<IBooking>).create({
      userId: session.user.id,
      eventId,
      date: new Date(selectedDate),
      participants,
      totalAmount: computedTotal,
      discountAmount,
      finalAmount,
      paymentInfo: {
        paymentMethod: 'RAZORPAY',
        paymentStatus: 'PENDING'
      },
      specialRequests,
      status: 'PENDING'
    });

    // Populate the created booking
    const populatedBooking = await (Booking as Model<IBooking>).findById(booking._id)
      .populate('userId', 'name email')
      .populate('eventId', 'title slug price location');

    return NextResponse.json({
      success: true,
      data: populatedBooking,
      message: 'Booking created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}