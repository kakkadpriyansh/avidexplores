import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DestinationCard, { IDestinationCard } from '@/models/DestinationCard';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/destination-cards - Public (active only) or Admin (all) with pagination
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const adminView = searchParams.get('admin') === 'true';

    if (adminView) {
      const session = await getServerSession(authOptions);
      const role = (session?.user as any)?.role;
      if (!session || !role || role !== 'ADMIN') {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }
    }

    const filter: any = {};
    if (!adminView) filter.isActive = true;

    const skip = (page - 1) * limit;

    const cards = await (DestinationCard as Model<IDestinationCard>).find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await (DestinationCard as Model<IDestinationCard>).countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: cards,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching destination cards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch destination cards' },
      { status: 500 }
    );
  }
}

// POST /api/destination-cards - Create new destination card (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;

    if (!session || !role || role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const { title, photo, link, isActive = true, order = 0 } = body;

    // Validation (title is now optional)
    if (!photo || !link) {
      return NextResponse.json(
        { success: false, error: 'Photo and link are required' },
        { status: 400 }
      );
    }

    const card = new DestinationCard({
      title,
      photo,
      link,
      isActive,
      order,
      createdBy: userId
    });

    await card.save();

    return NextResponse.json({
      success: true,
      data: card,
      message: 'Destination card created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating destination card:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create destination card' },
      { status: 500 }
    );
  }
}