import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog, { IBlog } from '@/models/Blog';
import Comment, { IComment } from '@/models/Comment';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/blog/[slug] - Get blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const { slug } = params;
    const { searchParams } = new URL(request.url);
    const includeComments = searchParams.get('includeComments') === 'true';
    const incrementViews = searchParams.get('incrementViews') === 'true';

    // Find blog post
    const blog = await (Blog as Model<IBlog>).findOne({ 
      slug, 
      isActive: true 
    })
    .populate('author', 'name email avatar')
    .populate('relatedPosts', 'title slug excerpt featuredImage publishedAt readTime')
    .lean();

    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Check if user can view unpublished posts
    const session = await getServerSession(authOptions).catch(() => null as any);
    const canViewUnpublished = session && (session.user.role === 'ADMIN' || session.user.role === 'GUIDE' || session.user.id === (blog as any).author._id?.toString());
    
    if (blog.status !== 'PUBLISHED' && !canViewUnpublished) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Increment views if requested (usually from client-side)
    if (incrementViews && blog.status === 'PUBLISHED') {
      await (Blog as Model<IBlog>).findByIdAndUpdate(
        blog._id,
        { 
          $inc: { 
            views: 1,
            'analytics.uniqueViews': 1
          }
        }
      );
      (blog as any).views += 1;
    }

    let comments = null;
    if (includeComments && (blog as any).allowComments) {
      // Get comments with replies
      comments = await (Comment as any).getCommentsWithReplies((blog as any)._id.toString());
    }

    // Get related posts if not already populated
    let relatedPosts: any = (blog as any).relatedPosts;
    if (!relatedPosts || relatedPosts.length === 0) {
      // Find related posts by category and tags
      const foundRelatedPosts = await (Blog as Model<IBlog>).find({
        _id: { $ne: (blog as any)._id },
        isActive: true,
        status: 'PUBLISHED',
        $or: [
          { category: (blog as any).category },
          { tags: { $in: (blog as any).tags } }
        ]
      })
      .select('title slug excerpt featuredImage publishedAt readTime')
      .sort({ views: -1, publishedAt: -1 })
      .limit(3)
      .lean();
      
      relatedPosts = foundRelatedPosts;
    }

    return NextResponse.json({
      blog: {
        ...(blog as any),
        relatedPosts: relatedPosts || []
      },
      ...(comments && { comments })
    });

  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
  }
}

// PUT /api/blog/[slug] - Update blog post (Admin/Guide/Author only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { slug } = params;
    const body = await request.json();

    // Find existing blog post
    const existingBlog = await (Blog as Model<IBlog>).findOne({ slug, isActive: true });
    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Check permissions
    const canEdit = session.user.role === 'ADMIN' || 
                   session.user.role === 'GUIDE' || 
                   session.user.id === existingBlog.author.toString();
    
    if (!canEdit) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Extract allowed fields for update
    const allowedUpdates = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      featuredImage: body.featuredImage,
      images: body.images,
      category: body.category,
      tags: body.tags,
      status: body.status,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      contentBlocks: body.contentBlocks,
      relatedPosts: body.relatedPosts,
      allowComments: body.allowComments,
      seo: body.seo,
      isFeatured: body.isFeatured,
      updatedBy: session.user.id
    } as any;

    // Remove undefined fields
    Object.keys(allowedUpdates).forEach(key => {
      if ((allowedUpdates as any)[key] === undefined) {
        delete (allowedUpdates as any)[key];
      }
    });

    // Check if new slug conflicts with existing posts
    if (body.slug && body.slug !== existingBlog.slug) {
      const slugConflict = await (Blog as Model<IBlog>).findOne({ 
        slug: body.slug, 
        _id: { $ne: existingBlog._id },
        isActive: true 
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: 'A blog post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update blog post
    const updatedBlog = await (Blog as Model<IBlog>).findByIdAndUpdate(
      existingBlog._id,
      { ...allowedUpdates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('author', 'name email avatar');

    return NextResponse.json({
      message: 'Blog post updated successfully',
      blog: updatedBlog
    });

  } catch (error) {
    console.error('Error updating blog post:', error);
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'A blog post with this slug already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
  }
}

// DELETE /api/blog/[slug] - Delete blog post (Admin/Author only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { slug } = params;

    // Find existing blog post
    const existingBlog = await (Blog as Model<IBlog>).findOne({ slug, isActive: true });
    if (!existingBlog) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Check permissions
    const canDelete = session.user.role === 'ADMIN' || session.user.id === existingBlog.author.toString();
    
    if (!canDelete) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Soft delete (set isActive to false)
    await (Blog as Model<IBlog>).findByIdAndUpdate(
      existingBlog._id,
      { 
        isActive: false,
        updatedBy: session.user.id,
        updatedAt: new Date()
      }
    );

    return NextResponse.json({
      message: 'Blog post deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}