import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking, { IBooking } from '@/models/Booking';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Model } from 'mongoose';

export const dynamic = 'force-dynamic';

// Helper to stringify event location (object -> "City, State, Country")
function stringifyLocation(loc: any): string {
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  const parts = [loc.name || loc.city, loc.state, loc.country].filter(Boolean);
  return parts.join(', ');
}

// GET /api/user/bookings - Get bookings for the authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Optional filters (status) for future use
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const filter: any = { userId: session.user.id };
    if (status) filter.status = status;

    const raw = await (Booking as Model<IBooking>)
      .find(filter)
      .populate('eventId', 'title slug price images location')
      .sort({ createdAt: -1 })
      .lean();

    const bookings = raw.map((b: any) => ({
      ...b,
      eventId: b.eventId ? {
        ...b.eventId,
        location: stringifyLocation((b.eventId as any).location)
      } : b.eventId
    }));

    return NextResponse.json({
      success: true,
      data: bookings,
      bookings,
      count: bookings.length
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user bookings' },
      { status: 500 }
    );
  }
}