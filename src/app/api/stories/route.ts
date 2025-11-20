import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story, { IStory } from '@/models/Story';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/stories - Get all published stories with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Check if user is admin to show all stories or only published ones
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUB_ADMIN';
    
    // Build filter object
    const filter: any = isAdmin ? {} : { isPublished: true };

    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (userId) filter.userId = userId;
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { excerpt: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get stories with pagination
    const stories = await (Story as Model<IStory>).find(filter)
      .populate('userId', 'name avatar')
      .populate('eventId', 'title slug')
      .select('-content') // Exclude full content for list view
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await (Story as Model<IStory>).countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: stories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

// POST /api/stories - Create new story (Authenticated users)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    
    await connectDB();

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      coverImage,
      images,
      tags,
      category,
      eventId,
      isPublished = false
    } = body;

    // Validate required fields
    if (!title || !content || !excerpt || !coverImage || !category) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title, content, excerpt, cover image, and category are required' 
        },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug already exists
    const existingStory = await (Story as Model<IStory>).findOne({ slug });
    if (existingStory) {
      return NextResponse.json(
        { success: false, error: 'Story with this title already exists' },
        { status: 400 }
      );
    }

    const story = new Story({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      images: images || [],
      tags: tags || [],
      category,
      userId: '507f1f77bcf86cd799439011', // TODO: Replace with actual user ID from session
      eventId: eventId || undefined,
      isPublished
    });

    await story.save();

    const populatedStory = await (Story as Model<IStory>).findById(story._id)
      .populate('userId', 'name avatar')
      .populate('eventId', 'title slug');

    return NextResponse.json(
      {
        success: true,
        data: populatedStory,
        message: 'Story created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating story:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(
        (err: any) => err.message
      );
      return NextResponse.json(
        { success: false, error: validationErrors.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create story' },
      { status: 500 }
    );
  }
}