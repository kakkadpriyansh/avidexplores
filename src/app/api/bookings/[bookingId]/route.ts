import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking, { IBooking } from '@/models/Booking';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Model, Types } from 'mongoose';

// helper to stringify location
function stringifyLocation(loc: any): string {
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  const parts = [loc.name, loc.state, loc.country].filter(Boolean);
  return parts.join(', ');
}

// GET /api/bookings/[bookingId] - Get specific booking
export async function GET(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idParam = params.bookingId;
    const orConditions: any[] = [{ bookingId: idParam }];
    if (Types.ObjectId.isValid(idParam)) {
      orConditions.push({ _id: new Types.ObjectId(idParam) });
    }

    const booking = await (Booking as Model<IBooking>).findOne({ $or: orConditions })
      .populate('userId', 'name email')
      .populate('eventId', 'title slug price location duration images')
      .lean();

    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user owns this booking or is admin
    // userId is populated, so it contains _id
    if ((booking.userId as any)._id?.toString() !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // normalize location
    if ((booking as any).eventId && (booking as any).eventId.location) {
      const loc = (booking as any).eventId.location;
      (booking as any).eventId.location = stringifyLocation(loc);
    }

    return NextResponse.json({
      success: true,
      data: booking,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

// PUT /api/bookings/[bookingId] - Update booking
export async function PUT(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
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
    const { status, paymentInfo, cancellationReason, adminNotes } = body;

    const idParam = params.bookingId;
    const orConditions: any[] = [{ bookingId: idParam }];
    if (Types.ObjectId.isValid(idParam)) {
      orConditions.push({ _id: new Types.ObjectId(idParam) });
    }

    const booking = await (Booking as Model<IBooking>).findOne({ $or: orConditions }).lean();
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user owns this booking or is admin
    if (booking.userId.toString() !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update booking
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentInfo) updateData.paymentInfo = { ...booking.paymentInfo, ...paymentInfo };
    if (cancellationReason) {
      updateData.cancellationReason = cancellationReason;
      updateData.cancelledAt = new Date();
      updateData.cancelledBy = session.user.id;
    }
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updatedBooking = await (Booking as Model<IBooking>).findOneAndUpdate(
      { $or: orConditions },
      updateData,
      { new: true, lean: true }
    );

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

// DELETE /api/bookings/[bookingId] - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idParam = params.bookingId;
    const orConditions: any[] = [{ bookingId: idParam }];
    if (Types.ObjectId.isValid(idParam)) {
      orConditions.push({ _id: new Types.ObjectId(idParam) });
    }

    const booking = await (Booking as Model<IBooking>).findOne({ $or: orConditions }).lean();
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if user owns this booking or is admin
    if (booking.userId.toString() !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if booking can be cancelled
    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, error: 'Booking cannot be cancelled' },
        { status: 400 }
      );
    }

    // Update booking status to cancelled
    const updatedBooking = await (Booking as Model<IBooking>).findOneAndUpdate(
      { $or: orConditions },
      {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: session.user.id
      },
      { new: true, lean: true }
    );

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}