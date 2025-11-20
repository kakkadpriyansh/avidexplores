import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Story, { IStory } from '@/models/Story';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/stories/[id] - Get single story by ID or slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;
    let story;

    // Check if id is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      story = await (Story as Model<IStory>).findById(id)
        .populate('userId', 'name avatar')
        .populate('eventId', 'title slug');
    } else {
      // Treat as slug
      story = await (Story as Model<IStory>).findOne({ slug: id, isPublished: true })
        .populate('userId', 'name avatar')
        .populate('eventId', 'title slug');
    }

    if (!story) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Increment views count
    await (Story as Model<IStory>).findByIdAndUpdate(
      story._id,
      { $inc: { views: 1 } }
    );

    return NextResponse.json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}

// PUT /api/stories/[id] - Update story (Admin/Author only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();

    // Find existing story
    const existingStory = await (Story as Model<IStory>).findById(id);
    if (!existingStory) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if user is admin or story author
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUB_ADMIN';
    const isAuthor = existingStory.userId.toString() === session.user.id;
    
    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to update this story' },
        { status: 403 }
      );
    }

    // Extract update data
    const {
      title,
      content,
      excerpt,
      coverImage,
      images,
      tags,
      category,
      eventId,
      isPublished,
      isFeatured
    } = body;

    const updateData: any = {};

    if (title) {
      updateData.title = title;
      // Update slug if title changed
      updateData.slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      // Check if new slug already exists (excluding current story)
      const existingSlug = await (Story as Model<IStory>).findOne({ 
        slug: updateData.slug, 
        _id: { $ne: id } 
      });
      if (existingSlug) {
        return NextResponse.json(
          { success: false, error: 'Story with this title already exists' },
          { status: 400 }
        );
      }
    }

    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (images !== undefined) updateData.images = images;
    if (tags !== undefined) updateData.tags = tags;
    if (category !== undefined) updateData.category = category;
    if (eventId !== undefined) updateData.eventId = eventId;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    
    // Only admins can set featured status
    if (isAdmin && isFeatured !== undefined) {
      updateData.isFeatured = isFeatured;
    }

    updateData.updatedAt = new Date();

    const updatedStory = await (Story as Model<IStory>).findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('userId', 'name avatar')
      .populate('eventId', 'title slug');

    return NextResponse.json({
      success: true,
      data: updatedStory,
      message: 'Story updated successfully'
    });
  } catch (error) {
    console.error('Error updating story:', error);
    
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
      { success: false, error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

// DELETE /api/stories/[id] - Delete story (Admin/Author only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = params;

    // Find existing story
    const existingStory = await (Story as Model<IStory>).findById(id);
    if (!existingStory) {
      return NextResponse.json(
        { success: false, error: 'Story not found' },
        { status: 404 }
      );
    }

    // Check if user is admin or story author
    const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'SUB_ADMIN';
    const isAuthor = existingStory.userId.toString() === session.user.id;
    
    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized to delete this story' },
        { status: 403 }
      );
    }

    await (Story as Model<IStory>).findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}