import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog, { IBlog } from '@/models/Blog';
import Comment, { IComment } from '@/models/Comment';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/blog/[slug]/comments - Get comments for a blog post
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const status = searchParams.get('status') || 'APPROVED';

    // Find blog post
    const blog = await (Blog as Model<IBlog>).findOne({ 
      slug, 
      isActive: true,
      status: 'PUBLISHED'
    }).select('_id allowComments');

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    if (!blog.allowComments) {
      return NextResponse.json({ error: 'Comments are disabled for this post' }, { status: 403 });
    }

    // Build query
    const query: any = {
      blog: blog._id,
      parentComment: null, // Only top-level comments
      isActive: true
    };

    // Optional auth: admins/guides can see all or filter by status
    const session = await getServerSession(authOptions).catch(() => null as any);
    const canSeeAllComments = session && (session.user.role === 'ADMIN' || session.user.role === 'GUIDE');
    
    if (!canSeeAllComments) {
      query.status = 'APPROVED';
    } else if (status && status !== 'ALL') {
      query.status = status;
    }

    // Get comments with pagination
    const skip = (page - 1) * limit;
    let comments = await (Comment as Model<IComment>).find(query)
      .populate('author', 'name avatar')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get replies for each comment
    const commentIds = comments.map(c => c._id);
    const replies = await (Comment as Model<IComment>).find({
      parentComment: { $in: commentIds },
      isActive: true,
      status: canSeeAllComments ? undefined : 'APPROVED'
    })
    .populate('author', 'name avatar')
    .sort({ createdAt: 1 })
    .lean();

    // Group replies by parent comment
    const repliesMap = replies.reduce((acc: any, reply: any) => {
      const parentId = reply.parentComment.toString();
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(reply);
      return acc;
    }, {});

    // Add replies to comments
    comments = comments.map((comment: any) => ({
      ...comment,
      replies: repliesMap[comment._id.toString()] || []
    }));

    // Get total count
    const totalComments = await (Comment as Model<IComment>).countDocuments(query);

    return NextResponse.json({
      comments,
      pagination: {
        page,
        limit,
        total: totalComments,
        pages: Math.ceil(totalComments / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/blog/[slug]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const { slug } = params;
    const body = await request.json();
    const { content, parentId, guestName, guestEmail } = body;

    // Validate required fields
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

    // Find blog post
    const blog = await (Blog as Model<IBlog>).findOne({ 
      slug, 
      isActive: true,
      status: 'PUBLISHED'
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    if (!blog.allowComments) {
      return NextResponse.json({ error: 'Comments are disabled for this post' }, { status: 403 });
    }

    // Check authentication (optional)
    const session = await getServerSession(authOptions).catch(() => null as any);
    
    // For guest comments, validate guest info
    if (!session && (!guestName || !guestEmail)) {
      return NextResponse.json(
        { error: 'Guest name and email are required for anonymous comments' },
        { status: 400 }
      );
    }

    // Validate parent comment if provided
    let parentComment = null;
    if (parentId) {
      parentComment = await (Comment as Model<IComment>).findById(parentId);
      if (!parentComment || parentComment.blog.toString() !== blog._id.toString()) {
        return NextResponse.json(
          { error: 'Invalid parent comment' },
          { status: 400 }
        );
      }

      // Prevent deep nesting by not allowing replies to replies
      if (parentComment.parentComment) {
        return NextResponse.json(
          { error: 'Cannot reply to a reply. Please reply to the original comment.' },
          { status: 400 }
        );
      }
    }

    // Create comment data
    const commentData: any = {
      content: content.trim(),
      blog: blog._id,
      parentComment: parentId || null,
      status: 'PENDING', // Default to pending for moderation
      isActive: true
    };

    if (session) {
      commentData.author = session.user.id;
      commentData.authorType = 'USER';
      // Auto-approve comments from admins and guides
      if (session.user.role === 'ADMIN' || session.user.role === 'GUIDE') {
        commentData.status = 'APPROVED';
      }
    } else {
      commentData.authorType = 'GUEST';
      commentData.guestName = guestName.trim();
      commentData.guestEmail = guestEmail.trim().toLowerCase();
    }

    // Create comment
    const comment = await (Comment as Model<IComment>).create(commentData);

    // Populate author info for response
    await comment.populate('author', 'name avatar');

    // Update blog comments count if approved
    if (comment.status === 'APPROVED') {
      await (Blog as Model<IBlog>).findByIdAndUpdate(
        blog._id,
        { $inc: { commentsCount: 1 } }
      );

      // Note: Parent comment reply count is calculated dynamically
    }

    return NextResponse.json({
      message: comment.status === 'APPROVED' 
        ? 'Comment posted successfully' 
        : 'Comment submitted for moderation',
      comment,
      needsModeration: comment.status === 'PENDING'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}