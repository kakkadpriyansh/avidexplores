import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Testimonial, { ITestimonial } from '@/models/Testimonial';
import { Model } from 'mongoose';

// GET /api/testimonials - Get approved testimonials
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const eventId = searchParams.get('eventId');
    const featured = searchParams.get('featured');

    // Build filter - only show approved and public testimonials
    const filter: any = {
      isApproved: true,
      isPublic: true
    };

    if (eventId) filter.eventId = eventId;
    if (featured === 'true') filter.isFeatured = true;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get testimonials with populated data
    const testimonials = await (Testimonial as Model<ITestimonial>).find(filter)
      .populate('userId', 'name')
      .populate('eventId', 'title slug')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-adminResponse'); // Don't expose admin responses to public

    const total = await (Testimonial as Model<ITestimonial>).countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: testimonials,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST /api/testimonials - Create new testimonial
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      eventId,
      bookingId,
      rating,
      review,
      title,
      images
    } = body;

    // Validate required fields
    if (!eventId || !rating || !review) {
      return NextResponse.json(
        { success: false, error: 'Event ID, rating, and review are required' },
        { status: 400 }
      );
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create testimonial (placeholder userId - should come from auth)
    const testimonial = await (Testimonial as Model<ITestimonial>).create({
      userId: '507f1f77bcf86cd799439011', // Placeholder - replace with actual user ID from auth
      eventId,
      bookingId,
      rating,
      review,
      title,
      images: images || [],
      isApproved: false, // Requires admin approval
      isPublic: true
    });

    // Populate the created testimonial
    const populatedTestimonial = await (Testimonial as Model<ITestimonial>).findById(testimonial._id)
      .populate('userId', 'name')
      .populate('eventId', 'title slug');

    return NextResponse.json({
      success: true,
      data: populatedTestimonial,
      message: 'Testimonial submitted successfully. It will be visible after admin approval.'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}