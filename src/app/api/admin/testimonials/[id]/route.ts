import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Testimonial, { ITestimonial } from '@/models/Testimonial';
import { Model } from 'mongoose';
import mongoose from 'mongoose';

// GET /api/admin/testimonials/[id] - Get single testimonial
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    await connectDB();

    // First check if testimonial exists without populate
    const testimonial = await (Testimonial as Model<ITestimonial>).findById(id).lean();

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    // Try to populate, but handle errors gracefully
    try {
      const populatedTestimonial = await (Testimonial as Model<ITestimonial>).findById(id)
        .populate('userId', 'name email avatar')
        .populate('eventId', 'title slug location images')
        .populate('bookingId', 'bookingId status')
        .lean();

      return NextResponse.json({
        success: true,
        data: populatedTestimonial
      });
    } catch (populateError) {
      // If populate fails, return the basic testimonial without populated fields
      console.warn('Populate failed, returning basic testimonial:', populateError);
      return NextResponse.json({
        success: true,
        data: testimonial
      });
    }

  } catch (error: any) {
    console.error('Error fetching testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonial' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/testimonials/[id] - Update testimonial
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      rating,
      review,
      title,
      images,
      approved,
      isFeatured,
      isPublic,
      adminResponse,
      customerName,
      customerEmail,
      eventName
    } = body;

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: any = {};
    if (rating !== undefined) updateData.rating = rating;
    if (review !== undefined) updateData.review = review;
    if (title !== undefined) updateData.title = title;
    if (images !== undefined) updateData.images = images;
    if (approved !== undefined) updateData.approved = approved;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (customerName !== undefined) updateData.customerName = customerName;
    if (customerEmail !== undefined) updateData.customerEmail = customerEmail;
    if (eventName !== undefined) updateData.eventName = eventName;
    if (adminResponse !== undefined) {
      updateData.adminResponse = {
        ...adminResponse,
        respondedAt: new Date()
      };
    }

    const testimonial = await (Testimonial as Model<ITestimonial>).findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name email avatar')
      .populate('eventId', 'title slug location images');

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: testimonial,
      message: 'Testimonial updated successfully'
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update testimonial' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/testimonials/[id] - Delete testimonial
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid testimonial ID' },
        { status: 400 }
      );
    }

    const testimonial = await (Testimonial as Model<ITestimonial>).findByIdAndDelete(id);

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete testimonial' },
      { status: 500 }
    );
  }
}