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

    await connectDB();

    // Use direct MongoDB query to avoid model issues
    const db = mongoose.connection.db;
    const collection = db.collection('testimonials');
    
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid testimonial ID format' },
        { status: 400 }
      );
    }
    
    const testimonial = await collection.findOne({ _id: objectId });

    if (!testimonial) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: testimonial
    });

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
    const body = await request.json();
    const {
      rating,
      review,
      title,
      customerPhoto,
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
    const updateData: any = { updatedAt: new Date() };
    if (rating !== undefined) updateData.rating = rating;
    if (review !== undefined) updateData.review = review;
    if (title !== undefined) updateData.title = title;
    if (customerPhoto !== undefined) updateData.customerPhoto = customerPhoto;
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

    // Use direct MongoDB update
    const db = mongoose.connection.db;
    const collection = db.collection('testimonials');
    
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid testimonial ID format' },
        { status: 400 }
      );
    }
    
    const result = await collection.findOneAndUpdate(
      { _id: objectId },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result.value) {
      return NextResponse.json(
        { success: false, error: 'Testimonial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.value,
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

    // Use direct MongoDB delete
    const db = mongoose.connection.db;
    const collection = db.collection('testimonials');
    
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(id);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid testimonial ID format' },
        { status: 400 }
      );
    }
    
    const result = await collection.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
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