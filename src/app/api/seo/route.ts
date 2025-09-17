import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SEO, { ISEO } from '@/models/SEO';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Model } from 'mongoose';

// GET /api/seo - Get SEO settings (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const pageType = url.searchParams.get('pageType');
    const pageId = url.searchParams.get('pageId');
    const slug = url.searchParams.get('slug');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const page = parseInt(url.searchParams.get('page') || '1');

    await connectDB();

    // Build query
    let query: any = { isActive: true };
    
    if (pageType) {
      query.pageType = pageType;
    }
    if (pageId) {
      query.pageId = pageId;
    }
    if (slug) {
      query.slug = slug;
    }

    // Get total count for pagination
    const total = await (SEO as Model<ISEO>).countDocuments(query);
    
    // Get SEO settings with pagination
    const seoSettings = await (SEO as Model<ISEO>)
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return NextResponse.json({
      success: true,
      data: seoSettings,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching SEO settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SEO settings' },
      { status: 500 }
    );
  }
}

// POST /api/seo - Create new SEO setting (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const seoData = await request.json();

    // Validate required fields
    if (!seoData.pageType || !seoData.title || !seoData.description) {
      return NextResponse.json(
        { error: 'Page type, title, and description are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for existing SEO setting
    let existingQuery: any = { pageType: seoData.pageType };
    if (seoData.pageId) {
      existingQuery.pageId = seoData.pageId;
    }
    if (seoData.slug) {
      existingQuery.slug = seoData.slug;
    }

    const existingSEO = await (SEO as Model<ISEO>).findOne(existingQuery);
    if (existingSEO) {
      return NextResponse.json(
        { error: 'SEO setting already exists for this page' },
        { status: 409 }
      );
    }

    // Create new SEO setting
    const newSEO = new (SEO as Model<ISEO>)(seoData);
    await newSEO.save();

    return NextResponse.json({
      success: true,
      message: 'SEO setting created successfully',
      data: newSEO
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating SEO setting:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'SEO setting already exists for this page' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create SEO setting' },
      { status: 500 }
    );
  }
}

// PUT /api/seo - Update SEO setting (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'SEO setting ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const updatedSEO = await (SEO as Model<ISEO>).findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedSEO) {
      return NextResponse.json(
        { error: 'SEO setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SEO setting updated successfully',
      data: updatedSEO
    });

  } catch (error) {
    console.error('Error updating SEO setting:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.message },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'SEO setting already exists for this page' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update SEO setting' },
      { status: 500 }
    );
  }
}

// DELETE /api/seo - Delete SEO setting (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'SEO setting ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedSEO = await (SEO as Model<ISEO>).findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deletedSEO) {
      return NextResponse.json(
        { error: 'SEO setting not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SEO setting deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting SEO setting:', error);
    return NextResponse.json(
      { error: 'Failed to delete SEO setting' },
      { status: 500 }
    );
  }
}