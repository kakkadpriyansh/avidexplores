import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DestinationCard, { IDestinationCard } from '@/models/DestinationCard';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import mongoose from 'mongoose';

// GET /api/destination-cards/[id] - Get single destination card
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid destination card ID' },
        { status: 400 }
      );
    }

    const card = await (DestinationCard as Model<IDestinationCard>).findById(id);

    if (!card) {
      return NextResponse.json(
        { success: false, error: 'Destination card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: card
    });
  } catch (error) {
    console.error('Error fetching destination card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch destination card' },
      { status: 500 }
    );
  }
}

// PUT /api/destination-cards/[id] - Update destination card (Admin only)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || !role || (role !== 'ADMIN' && role !== 'SUB_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid destination card ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, photo, link, isActive, order } = body;

    // Validation
    if (!photo || !link) {
      return NextResponse.json(
        { success: false, error: 'Photo and link are required' },
        { status: 400 }
      );
    }

    const card = await (DestinationCard as Model<IDestinationCard>).findByIdAndUpdate(
      id,
      { title, photo, link, isActive, order },
      { new: true, runValidators: true }
    );

    if (!card) {
      return NextResponse.json(
        { success: false, error: 'Destination card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: card,
      message: 'Destination card updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating destination card:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update destination card' },
      { status: 500 }
    );
  }
}

// DELETE /api/destination-cards/[id] - Delete destination card (Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || !role || (role !== 'ADMIN' && role !== 'SUB_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid destination card ID' },
        { status: 400 }
      );
    }

    const card = await (DestinationCard as Model<IDestinationCard>).findByIdAndDelete(id);

    if (!card) {
      return NextResponse.json(
        { success: false, error: 'Destination card not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Destination card deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting destination card:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete destination card' },
      { status: 500 }
    );
  }
}