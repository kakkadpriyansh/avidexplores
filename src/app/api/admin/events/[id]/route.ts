import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event, { IEvent } from '@/models/Event';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/admin/events/[id] - Get single event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const event = await (Event as any).findById(params.id)
      .populate('guide', 'name email')
      .populate('createdBy', 'name email');

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/events/[id] - Update event by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Remove system fields that shouldn't be updated
    const { _id, createdAt, updatedAt, ...updateData } = body as any;

    // Strip populated references that should not be updated directly
    if (updateData.guide && typeof updateData.guide === 'object') {
      delete updateData.guide;
    }
    if (updateData.createdBy && typeof updateData.createdBy === 'object') {
      delete updateData.createdBy;
    }

    // Normalize fields
    if (updateData.duration !== undefined && updateData.duration !== null) {
      // Ensure duration is stored as a string (e.g., "5 Days 4 Nights")
      updateData.duration = String(updateData.duration).trim();
    }

    // Sanitize availableDates: include only valid entries, coerce types
    // IMPORTANT: Preserve explicit clearing when an empty array is sent
    if (Array.isArray(updateData.availableDates)) {
      const validAvailableDates = updateData.availableDates
        .filter((entry: any) => entry && typeof entry.month === 'string' && entry.month.trim() !== ''
          && entry.year !== undefined && entry.year !== null
          && Array.isArray(entry.dates) && entry.dates.length > 0
          && entry.dates.every((d: any) => Number.isFinite(Number(d))))
        .map((entry: any) => ({
          month: String(entry.month).trim(),
          year: Number(entry.year),
          dates: entry.dates.map((d: any) => Number(d)),
          location: entry.location ? String(entry.location) : undefined,
          availableSeats: entry.availableSeats !== undefined ? Number(entry.availableSeats) : undefined,
          totalSeats: entry.totalSeats !== undefined ? Number(entry.totalSeats) : undefined,
        }))
        .filter((e: any) => e.dates.length > 0);
      // If client provided availableDates, always set it (even empty) to allow clearing
      updateData.availableDates = validAvailableDates;
    }

    // Sanitize departures: label, origin, destination, transport options, and nested availableDates
    if (Array.isArray(updateData.departures)) {
      const validDepartures = updateData.departures
        .filter((dep: any) => dep && typeof dep.label === 'string' && dep.label.trim() !== ''
          && typeof dep.origin === 'string' && dep.origin.trim() !== ''
          && typeof dep.destination === 'string' && dep.destination.trim() !== '')
        .map((dep: any) => ({
          label: String(dep.label).trim(),
          origin: String(dep.origin).trim(),
          destination: String(dep.destination).trim(),
          transportOptions: Array.isArray(dep.transportOptions) ? dep.transportOptions
            .filter((opt: any) => opt && typeof opt.mode === 'string' && ['AC_TRAIN','NON_AC_TRAIN','FLIGHT','BUS'].includes(opt.mode)
              && opt.price !== undefined && opt.price !== null)
            .map((opt: any) => ({
              mode: String(opt.mode),
              price: Number(opt.price)
            })) : [],
          availableDates: Array.isArray(dep.availableDates) ? dep.availableDates
            .filter((entry: any) => entry && typeof entry.month === 'string' && entry.month.trim() !== ''
              && entry.year !== undefined && entry.year !== null
              && Array.isArray(entry.dates) && entry.dates.length > 0
              && entry.dates.every((d: any) => Number.isFinite(Number(d))))
            .map((entry: any) => ({
              month: String(entry.month).trim(),
              year: Number(entry.year),
              dates: entry.dates.map((d: any) => Number(d)),
              availableTransportModes: Array.isArray(entry.availableTransportModes)
                ? entry.availableTransportModes
                    .map((m: any) => String(m))
                    .filter((m: string) => ['AC_TRAIN','NON_AC_TRAIN','FLIGHT','BUS'].includes(m))
                : undefined,
              availableSeats: entry.availableSeats !== undefined ? Number(entry.availableSeats) : undefined,
              totalSeats: entry.totalSeats !== undefined ? Number(entry.totalSeats) : undefined,
            })) : []
        }));
      updateData.departures = validDepartures;
    }

    // Handle discountedPrice explicitly: allow clearing by sending null
    if (updateData.discountedPrice === undefined) {
      // don't touch if not provided
      delete updateData.discountedPrice;
    } else if (updateData.discountedPrice === '' || updateData.discountedPrice === null) {
      updateData.discountedPrice = null;
    } else {
      // Coerce to number when provided
      updateData.discountedPrice = Number(updateData.discountedPrice);
    }
    
    console.log('PUT /api/admin/events/[id] - Raw body received:', JSON.stringify(body, null, 2));
    console.log('PUT /api/admin/events/[id] - Update data after processing:', JSON.stringify(updateData, null, 2));
    
    // Build a minimal safeUpdate with only the fields that are actually provided
    const safeUpdate: any = {};
    
    // Only include fields that are actually present in updateData
    if (updateData.title !== undefined) safeUpdate.title = updateData.title;
    if (updateData.price !== undefined) safeUpdate.price = Number(updateData.price);
    if (updateData.discountedPrice !== undefined) safeUpdate.discountedPrice = updateData.discountedPrice;
    if (updateData.duration !== undefined) safeUpdate.duration = String(updateData.duration).trim();
    if (updateData.availableDates !== undefined) safeUpdate.availableDates = updateData.availableDates;
    if (updateData.departures !== undefined) safeUpdate.departures = updateData.departures;

    // Set updatedAt to current time
    safeUpdate.updatedAt = new Date();

    await connectDB();

    console.log('PUT /api/admin/events/[id] - Final safeUpdate payload:', JSON.stringify(safeUpdate, null, 2));
    console.log('PUT /api/admin/events/[id] - Duration field type:', typeof safeUpdate.duration);
    console.log('PUT /api/admin/events/[id] - Duration field value:', safeUpdate.duration);

    try {
      console.log('PUT /api/admin/events/[id] - About to call findByIdAndUpdate with ID:', params.id);
      
      // Try using direct MongoDB update without Mongoose casting
      const event = await (Event as any).findByIdAndUpdate(
        params.id,
        { $set: safeUpdate },
        { 
          new: true, 
          runValidators: false, // Disable validators to prevent casting
          strict: false // Allow fields not in schema
        }
      );

      if (!event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      
      console.log('PUT /api/admin/events/[id] - Updated event result:', {
        id: event._id?.toString?.(),
        title: event.title,
        price: event.price,
        discountedPrice: event.discountedPrice,
        duration: event.duration,
        updatedAt: event.updatedAt
      });

      return NextResponse.json({
        success: true,
        id: event._id?.toString?.(),
        title: event.title,
        price: event.price,
        discountedPrice: event.discountedPrice,
        duration: event.duration,
        updatedAt: event.updatedAt
      });
    } catch (mongoError: any) {
      console.error('PUT /api/admin/events/[id] - MongoDB update error:', mongoError);
      if (mongoError?.name === 'ValidationError') {
        const validationErrors = Object.values(mongoError.errors || {}).map((err: any) => err.message);
        return NextResponse.json(
          { error: 'Validation failed', details: validationErrors },
          { status: 400 }
        );
      }
      if (mongoError?.name === 'CastError') {
        const castInfo = mongoError?.message || `CastError at ${mongoError?.path}`;
        return NextResponse.json(
          { error: 'Invalid value for field', details: castInfo },
          { status: 400 }
        );
      }
      if (mongoError?.code === 11000) {
        const field = Object.keys(mongoError.keyPattern || {})[0];
        return NextResponse.json(
          { error: 'Duplicate key', details: `${field} already exists` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error: 'Database update failed',
          details: {
            name: mongoError?.name,
            code: mongoError?.code,
            message: mongoError?.message,
            stack: mongoError?.stack,
          }
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error updating event:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events/[id] - Delete event by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    await connectDB();

    const event = await (Event as any).findByIdAndDelete(params.id);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Event deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}