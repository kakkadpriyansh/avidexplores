import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Event, { IEvent } from '@/models/Event';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/events - Get all events with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const location = searchParams.get('location');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const adminView = searchParams.get('admin') === 'true';

    // Determine if this is an admin/guide view (can include inactive events)
    if (adminView) {
      const session = await getServerSession(authOptions);
      const role = (session?.user as any)?.role;
      if (!session || !role || (role !== 'ADMIN' && role !== 'GUIDE')) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 403 }
        );
      }
    }

    // Build filter object
    const filter: any = {};

    // Show only active events by default (both public and admin)
    // Admin can see inactive events only if specifically requested with showDeleted=true
    const showDeleted = searchParams.get('showDeleted') === 'true';
    if (!showDeleted) {
      filter.isActive = true;
    }

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (location) filter['location.state'] = new RegExp(location, 'i');
    if (featured === 'true') filter.isFeatured = true;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get events with pagination
    const events = await (Event as Model<IEvent>).find(filter)
      .populate('guide', 'name email')
      .populate('createdBy', 'name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await (Event as Model<IEvent>).countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: events,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create new event (Admin/Guide only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || !role || (role !== 'ADMIN' && role !== 'GUIDE')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      shortDescription,
      price,
      dates,
      availableMonths,
      availableDates,
      departures,
      itinerary,
      inclusions,
      exclusions,
      preparation,
      category,
      difficulty,
      images,
      location,
      duration,
      maxParticipants,
      minParticipants,
      ageLimit,
      season,
      tags,
      highlights,
      thingsToCarry,
      guide,
      discountedPrice
    } = body;

    // Validate price fields
    if (price !== undefined && price < 0) {
      return NextResponse.json(
        { success: false, error: 'Price cannot be negative' },
        { status: 400 }
      );
    }
    
    if (discountedPrice !== undefined && discountedPrice < 0) {
      return NextResponse.json(
        { success: false, error: 'Discounted price cannot be negative' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingEvent = await (Event as Model<IEvent>).findOne({ slug });
    if (existingEvent) {
      return NextResponse.json(
        { success: false, error: 'Event with this title already exists' },
        { status: 400 }
      );
    }

    // Transform location string to structured object if needed
    const locationObj = typeof location === 'string' ? {
      name: location,
      state: 'Unknown',
      country: 'India'
    } : location;

    // Ensure itinerary has required fields
    const processedItinerary = itinerary?.map((item: any, index: number) => ({
      day: item.day || index + 1,
      title: item.title || `Day ${index + 1}`,
      location: item.location || '',
      description: item.description || 'No description provided',
      activities: item.activities || [],
      meals: item.meals || [],
      accommodation: item.accommodation || ''
    })) || [];

    // Sanitize availableDates: include only valid entries, coerce types
    const sanitizedAvailableDates = Array.isArray(availableDates)
      ? availableDates
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
          .filter((e: any) => e.dates.length > 0)
      : [];

    // Sanitize departures: label, origin, destination, transport options, and nested availableDates
    const sanitizedDepartures = Array.isArray(departures)
      ? departures
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
                dateTransportModes: entry.dateTransportModes && typeof entry.dateTransportModes === 'object'
                  ? Object.fromEntries(
                      Object.entries(entry.dateTransportModes)
                        .filter(([k, v]: any) => Number.isFinite(Number(k)) && Array.isArray(v))
                        .map(([k, v]: any) => [
                          Number(k),
                          (v as any[])
                            .map((m: any) => String(m))
                            .filter((m: string) => ['AC_TRAIN','NON_AC_TRAIN','FLIGHT','BUS'].includes(m))
                        ])
                    )
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
          }))
      : [];

    // Set default values for required fields
    const eventData = {
      title,
      slug,
      description,
      shortDescription,
      price,
      // Persist discountedPrice only if provided (>= 0)
      discountedPrice: typeof discountedPrice === 'number' && discountedPrice >= 0 ? discountedPrice : undefined,
      dates: dates || [],
      availableMonths: availableMonths || [],
      availableDates: sanitizedAvailableDates,
      departures: sanitizedDepartures,
      itinerary: processedItinerary,
      inclusions: inclusions?.filter((item: string) => item.trim() !== '') || [],
      exclusions: exclusions?.filter((item: string) => item.trim() !== '') || [],
      preparation: preparation || {
        physicalRequirements: '',
        medicalRequirements: '',
        experienceLevel: '',
        safetyGuidelines: [],
        additionalNotes: ''
      },
      category,
      difficulty,
      images: images?.filter((item: string) => item.trim() !== '') || [],
      location: locationObj,
      duration: duration || '1 Day',
      maxParticipants: parseInt(maxParticipants) || 10,
      minParticipants: parseInt(minParticipants) || 1,
      ageLimit: ageLimit || { min: 18, max: 65 },
      season: season || [],
      tags: tags || [],
      highlights: highlights || [],
      thingsToCarry: thingsToCarry || [],
      guide: guide || (session.user as any).id,
      createdBy: (session.user as any).id,
      isActive: true
    };

    const event = new Event(eventData);

    await event.save();

    const populatedEvent = await (Event as Model<IEvent>).findById(event._id)
      .populate('guide', 'name email')
      .populate('createdBy', 'name email');

    return NextResponse.json(
      {
        success: true,
        data: populatedEvent,
        message: 'Event created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create event' },
      { status: 500 }
    );
  }
}