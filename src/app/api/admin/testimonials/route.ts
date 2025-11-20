import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Testimonial, { ITestimonial } from '@/models/Testimonial';
import { Model } from 'mongoose';
import mongoose from 'mongoose';

// GET /api/admin/testimonials - Get all testimonials for admin
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected'
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');

    // Build filter
    const filter: any = {};

    if (status === 'pending') filter.approved = false;
    if (status === 'approved') filter.approved = true;
    if (featured === 'true') filter.isFeatured = true;
    if (featured === 'false') filter.isFeatured = false;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build aggregation pipeline for search
    const pipeline: any[] = [
      { $match: filter }
    ];

    // Add lookup for user and event data
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId'
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'eventId'
        }
      },
      {
        $unwind: { path: '$userId', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$eventId', preserveNullAndEmptyArrays: true }
      }
    );

    // Add search functionality
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userId.name': { $regex: search, $options: 'i' } },
            { 'eventId.title': { $regex: search, $options: 'i' } },
            { customerName: { $regex: search, $options: 'i' } },
            { customerEmail: { $regex: search, $options: 'i' } },
            { eventName: { $regex: search, $options: 'i' } },
            { review: { $regex: search, $options: 'i' } },
            { title: { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add sorting, skip, and limit
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    );

    // Execute aggregation
    const testimonials = await (Testimonial as Model<ITestimonial>).aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [...pipeline.slice(0, -2)]; // Remove skip and limit
    countPipeline.push({ $count: 'total' });
    const countResult = await (Testimonial as Model<ITestimonial>).aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

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
    console.error('Error fetching admin testimonials:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}

// POST /api/admin/testimonials - Create testimonial manually by admin
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      customerName,
      customerEmail,
      eventName,
      rating,
      review,
      title,
      customerPhoto,
      images,
      approved = true,
      isFeatured = false,
      isPublic = true
    } = body;

    // Validate required fields
    if (!customerName || !customerEmail || !eventName || !rating || !review) {
      return NextResponse.json(
        { success: false, error: 'Customer name, email, event name, rating, and review are required' },
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

    // Use direct MongoDB insertion to bypass Mongoose model constraints
    const db = mongoose.connection.db;
    const collection = db.collection('testimonials');
    
    const testimonialData = {
      customerName,
      customerEmail,
      eventName,
      rating,
      review,
      title,
      customerPhoto: customerPhoto || (images && images.length > 0 ? images[0] : ''),
      images: images || [],
      approved,
      isPublic,
      isFeatured,
      helpfulVotes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(testimonialData);
    const createdTestimonial = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json({
      success: true,
      data: createdTestimonial,
      message: 'Testimonial created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating testimonial:', error);

    // Handle validation errors
    if (error?.name === 'ValidationError') {
      const details = Object.values(error.errors || {}).map((e: any) => e.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', details },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create testimonial' },
      { status: 500 }
    );
  }
}