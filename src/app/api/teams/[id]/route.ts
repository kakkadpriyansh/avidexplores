import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team, { ITeam } from '@/models/Team';
import { Model, isValidObjectId } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/teams/[id] - Public for active, Admin can view any
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const member = await (Team as Model<ITeam>).findById(id);
    if (!member) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (!member.isActive) {
      const session = await getServerSession(authOptions);
      const role = (session?.user as any)?.role;
      if (!session || !role || (role !== 'ADMIN' && role !== 'SUB_ADMIN')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    console.error('Error fetching team member:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch team member' }, { status: 500 });
  }
}

// PUT /api/teams/[id] - Admin only
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || !role || (role !== 'ADMIN' && role !== 'SUB_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();

    const update: any = { ...body };
    if (update.specialties) {
      update.specialties = update.specialties.filter((s: string) => s.trim() !== '');
    }

    const member = await (Team as Model<ITeam>).findByIdAndUpdate(id, update, { new: true });
    if (!member) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: member, message: 'Team member updated' });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json({ success: false, error: 'Failed to update team member' }, { status: 500 });
  }
}

// DELETE /api/teams/[id] - Admin only
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || !role || (role !== 'ADMIN' && role !== 'SUB_ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const { id } = params;
    if (!isValidObjectId(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const member = await (Team as Model<ITeam>).findByIdAndDelete(id);
    if (!member) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Team member deleted' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete team member' }, { status: 500 });
  }
}