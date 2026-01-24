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

    // Check if user is admin or sub-admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUB_ADMIN') {
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

    return NextResponse.json(event.toObject ? event.toObject() : event);
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

    // Check if user is admin or sub-admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUB_ADMIN') {
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
        .map((dep: any) => {
          const depObj: any = {
            label: String(dep.label).trim(),
            origin: String(dep.origin).trim(),
            destination: String(dep.destination).trim(),
            isSelected: Boolean(dep.isSelected || false)
          };
          if (dep.price !== undefined && dep.price !== null && typeof dep.price === 'number' && !isNaN(dep.price)) {
            depObj.price = dep.price;
          }
          if (dep.discountedPrice !== undefined && dep.discountedPrice !== null && typeof dep.discountedPrice === 'number' && !isNaN(dep.discountedPrice)) {
            depObj.discountedPrice = dep.discountedPrice;
          }
          return {
            ...depObj,
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
              dateTransportModes: entry.dateTransportModes && typeof entry.dateTransportModes === 'object'
                ? (() => {
                    const result: Record<string, string[]> = {};
                    for (const [key, value] of Object.entries(entry.dateTransportModes)) {
                      if (Array.isArray(value) && value.length > 0) {
                        const validModes = value
                          .map((m: any) => String(m))
                          .filter((m: string) => ['AC_TRAIN','NON_AC_TRAIN','FLIGHT','BUS'].includes(m));
                        if (validModes.length > 0) {
                          result[String(key)] = validModes;
                        }
                      }
                    }
                    console.log('Processing dateTransportModes:', { original: entry.dateTransportModes, processed: result });
                    return Object.keys(result).length > 0 ? result : undefined;
                  })()
                : undefined,
              availableTransportModes: Array.isArray(entry.availableTransportModes)
                ? entry.availableTransportModes
                    .map((m: any) => String(m))
                    .filter((m: string) => ['AC_TRAIN','NON_AC_TRAIN','FLIGHT','BUS'].includes(m))
                : undefined,
              availableSeats: entry.availableSeats !== undefined ? Number(entry.availableSeats) : undefined,
              totalSeats: entry.totalSeats !== undefined ? Number(entry.totalSeats) : undefined,
            })) : [],
          itinerary: Array.isArray(dep.itinerary)
            ? dep.itinerary
                .filter((item: any) => item && typeof item.title === 'string' && item.title.trim() !== '')
                .map((item: any, index: number) => ({
                  day: Number(item.day ?? index + 1),
                  title: String(item.title || `Day ${index + 1}`),
                  location: item.location ? String(item.location) : undefined,
                  description: String(item.description || 'No description provided'),
                  activities: Array.isArray(item.activities) ? item.activities.map((a: any) => String(a)) : [],
                  meals: Array.isArray(item.meals) ? item.meals.map((m: any) => String(m)) : [],
                  accommodation: item.accommodation ? String(item.accommodation) : undefined,
                  images: Array.isArray(item.images) ? item.images.map((img: any) => String(img)) : []
                }))
            : []
          };
        });
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
    
    // Only include fields that are actually present in updateData
    const safeUpdate: any = {};
    
    // Only include fields that are actually present in updateData
    if (updateData.title !== undefined) safeUpdate.title = updateData.title;
    if (updateData.slug !== undefined) safeUpdate.slug = updateData.slug;
    if (updateData.description !== undefined) safeUpdate.description = updateData.description;
    if (updateData.shortDescription !== undefined) safeUpdate.shortDescription = updateData.shortDescription;
    if (updateData.price !== undefined) {
      safeUpdate.price = Number(updateData.price);
    }
    if (updateData.discountedPrice !== undefined) safeUpdate.discountedPrice = updateData.discountedPrice;
    if (updateData.duration !== undefined) safeUpdate.duration = String(updateData.duration).trim();
    if (updateData.category !== undefined) safeUpdate.category = updateData.category;
    if (updateData.difficulty !== undefined) safeUpdate.difficulty = updateData.difficulty;
    if (updateData.minParticipants !== undefined) safeUpdate.minParticipants = updateData.minParticipants;
    if (updateData.maxParticipants !== undefined) safeUpdate.maxParticipants = updateData.maxParticipants;
    if (updateData.ageLimit !== undefined) safeUpdate.ageLimit = updateData.ageLimit;
    if (updateData.isActive !== undefined) safeUpdate.isActive = updateData.isActive;
    if (updateData.isFeatured !== undefined) safeUpdate.isFeatured = updateData.isFeatured;
    if (updateData.location !== undefined) safeUpdate.location = updateData.location;
    if (updateData.region !== undefined) safeUpdate.region = updateData.region;
    if (updateData.images !== undefined) safeUpdate.images = updateData.images;
    if (updateData.tags !== undefined) safeUpdate.tags = updateData.tags;
    if (updateData.highlights !== undefined) safeUpdate.highlights = updateData.highlights;
    if (updateData.availableMonths !== undefined) safeUpdate.availableMonths = updateData.availableMonths;
    if (updateData.availableDates !== undefined) safeUpdate.availableDates = updateData.availableDates;
    if (updateData.departures !== undefined) safeUpdate.departures = updateData.departures;
    if (updateData.itinerary !== undefined) safeUpdate.itinerary = updateData.itinerary;
    if (updateData.inclusions !== undefined) safeUpdate.inclusions = updateData.inclusions;
    if (updateData.exclusions !== undefined) safeUpdate.exclusions = updateData.exclusions;
    if (updateData.thingsToCarry !== undefined) safeUpdate.thingsToCarry = updateData.thingsToCarry;
    if (updateData.brochure !== undefined) {
      safeUpdate.brochure = updateData.brochure === '' ? null : updateData.brochure;
    }
    if (updateData.preparation !== undefined) safeUpdate.preparation = updateData.preparation;

    // Set updatedAt to current time
    safeUpdate.updatedAt = new Date();

    await connectDB();

    try {
      
      // Try using direct MongoDB update without Mongoose casting
      const event = await (Event as any).findByIdAndUpdate(
        params.id,
        { $set: safeUpdate },
        { 
          new: true, 
          runValidators: false, // Disable validators to prevent casting
          strict: false, // Allow fields not in schema
          overwrite: false // Don't overwrite, just update specified fields
        }
      );

      if (!event) {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      
      // Verify isSelected was saved
      if (event.departures && event.departures.length > 0) {
      }

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

    // Check if user is admin or sub-admin
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUB_ADMIN') {
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