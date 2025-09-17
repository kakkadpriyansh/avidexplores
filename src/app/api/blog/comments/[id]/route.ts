import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog, { IBlog } from '@/models/Blog';
import Comment, { IComment } from '@/models/Comment';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/blog/comments/[id] - Get comment by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { id } = params;

    const comment = await (Comment as Model<IComment>).findById(id)
      .populate('author', 'name avatar')
      .populate('blog', 'title slug')
      .populate({
        path: 'replies',
        match: { isActive: true },
        populate: {
          path: 'author',
          select: 'name avatar'
        },
        options: { sort: { createdAt: 1 } }
      })
      .lean();

    if (!comment || !comment.isActive) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Optional auth for viewing non-approved comments
    const session = await getServerSession(authOptions).catch(() => null as any);
    const canView = comment.status === 'APPROVED' || 
                   (session && (session.user.role === 'ADMIN' || session.user.role === 'GUIDE' || 
                   session.user.id === comment.author?._id?.toString()));

    if (!canView) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    return NextResponse.json({ comment });

  } catch (error) {
    console.error('Error fetching comment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comment' },
      { status: 500 }
    );
  }
}

// PUT /api/blog/comments/[id] - Update comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = params;
    const body = await request.json();
    const { content, status, moderationReason } = body;

    // Find existing comment
    const existingComment = await (Comment as Model<IComment>).findById(id);
    if (!existingComment || !existingComment.isActive) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check permissions
    const isAuthor = session.user.id === existingComment.author?.toString();
    const isModerator = session.user.role === 'ADMIN' || session.user.role === 'GUIDE';
    
    if (!isAuthor && !isModerator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {};

    // Content update (only by author within 15 minutes or moderators)
    if (content !== undefined) {
      if (!isAuthor) {
        return NextResponse.json(
          { error: 'Only the author can edit comment content' },
          { status: 403 }
        );
      }

      // Check edit time limit (15 minutes)
      const editTimeLimit = 15 * 60 * 1000; // 15 minutes in milliseconds
      const timeSinceCreation = Date.now() - existingComment.createdAt.getTime();
      
      if (timeSinceCreation > editTimeLimit && session.user.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Comment can only be edited within 15 minutes of posting' },
          { status: 403 }
        );
      }

      if (!content || content.trim().length === 0) {
        return NextResponse.json(
          { error: 'Comment content is required' },
          { status: 400 }
        );
      }

      if (content.length > 1000) {
        return NextResponse.json(
          { error: 'Comment content cannot exceed 1000 characters' },
          { status: 400 }
        );
      }

      updateData.content = content.trim();
      updateData.isEdited = true;
      updateData.editedAt = new Date();
    }

    // Status update (only by moderators)
    if (status !== undefined && isModerator) {
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SPAM'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }

      const oldStatus = existingComment.status;
      updateData.status = status;
      updateData.moderatedBy = session.user.id;
      updateData.moderatedAt = new Date();
      
      if (moderationReason) {
        updateData.moderationReason = moderationReason;
      }

      // Update blog comments count based on status change
      if (oldStatus !== 'APPROVED' && status === 'APPROVED') {
        // Comment approved - increment count
        await (Blog as Model<IBlog>).findByIdAndUpdate(
          existingComment.blog,
          { $inc: { commentsCount: 1 } }
        );
      } else if (oldStatus === 'APPROVED' && status !== 'APPROVED') {
        // Comment unapproved - decrement count
        await (Blog as Model<IBlog>).findByIdAndUpdate(
          existingComment.blog,
          { $inc: { commentsCount: -1 } }
        );
      }
    }

    // Update comment
    const updatedComment = await (Comment as Model<IComment>).findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('author', 'name avatar');

    return NextResponse.json({
      message: 'Comment updated successfully',
      comment: updatedComment
    });

  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/comments/[id] - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = params;

    // Find existing comment
    const existingComment = await (Comment as Model<IComment>).findById(id);
    if (!existingComment || !existingComment.isActive) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Check permissions
    const isAuthor = session.user.id === existingComment.author?.toString();
    const isModerator = session.user.role === 'ADMIN' || session.user.role === 'GUIDE';
    
    if (!isAuthor && !isModerator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete comment
    await (Comment as Model<IComment>).findByIdAndUpdate(
      id,
      { 
        isActive: false,
        deletedBy: session.user.id,
        deletedAt: new Date(),
        updatedAt: new Date()
      }
    );

    // Update blog comments count if comment was approved
    if (existingComment.status === 'APPROVED') {
      await (Blog as Model<IBlog>).findByIdAndUpdate(
        existingComment.blog,
        { $inc: { commentsCount: -1 } }
      );
    }

    // Note: Parent comment reply count is calculated dynamically

    return NextResponse.json({
      message: 'Comment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}