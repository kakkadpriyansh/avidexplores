import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Blog, { IBlog } from '@/models/Blog';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Model } from 'mongoose';

// GET /api/blog - Get all blog posts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    const status = searchParams.get('status') || 'PUBLISHED';
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter
    const filter: any = { isActive: true };

    // Only show published posts for public access, allow all statuses for authenticated users
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GUIDE')) {
      filter.status = 'PUBLISHED';
      filter.publishedAt = { $lte: new Date() };
    } else if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (tag) {
      filter.tags = { $in: [tag] };
    }

    if (author) {
      filter.author = author;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get blog posts
    const blogs = await (Blog as Model<IBlog>).find(filter)
      .populate('author', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await (Blog as Model<IBlog>).countDocuments(filter);

    // Get categories for filtering
    const categories = await (Blog as Model<IBlog>).distinct('category', { 
      isActive: true, 
      status: 'PUBLISHED' 
    });

    // Get popular tags
    const popularTags = await (Blog as Model<IBlog>).aggregate([
      { 
        $match: { 
          isActive: true, 
          status: 'PUBLISHED',
          tags: { $exists: true, $ne: [] }
        } 
      },
      { $unwind: '$tags' },
      { 
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        categories,
        popularTags: popularTags.map(tag => ({
          name: tag._id,
          count: tag.count
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST /api/blog - Create new blog post (Admin/Guide only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'GUIDE')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      images,
      category,
      tags,
      status = 'DRAFT',
      scheduledAt,
      contentBlocks,
      relatedPosts,
      allowComments = true,
      seo,
      isFeatured = false
    } = body;

    // Validation
    if (!title || !excerpt || !content || !category) {
      return NextResponse.json(
        { error: 'Title, excerpt, content, and category are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    if (slug) {
      const existingBlog = await (Blog as Model<IBlog>).findOne({ slug, isActive: true });
      if (existingBlog) {
        return NextResponse.json(
          { error: 'A blog post with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Create blog post
    const newBlog = new Blog({
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      images: images || [],
      author: session.user.id,
      category,
      tags: tags || [],
      status,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      contentBlocks: contentBlocks || [],
      relatedPosts: relatedPosts || [],
      allowComments,
      seo: seo || {},
      isFeatured,
      createdBy: session.user.id
    });

    await newBlog.save();

    // Populate author information
    await newBlog.populate('author', 'name email avatar');

    return NextResponse.json({
      message: 'Blog post created successfully',
      blog: newBlog
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating blog post:', error);
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { error: 'A blog post with this slug already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}