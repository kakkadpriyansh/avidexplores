import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Team, { ITeam } from '@/models/Team';
import { Model } from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/teams - Public (active only) or Admin (all) with pagination and search
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search');
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
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { role: new RegExp(search, 'i') },
        { specialties: new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;

    const team = await (Team as Model<ITeam>).find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await (Team as Model<ITeam>).countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: team,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch teams' }, { status: 500 });
  }
}

// POST /api/teams - Create new team member (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const role = (session?.user as any)?.role;

    if (!session || !role || role !== 'ADMIN') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();
    const {
      name,
      role: memberRole,
      experience,
      image,
      specialties,
      bio,
      email,
      phone,
      socialMedia,
      isActive,
      order
    } = body;

    const teamData = {
      name,
      role: memberRole,
      experience,
      image,
      specialties: (specialties || []).filter((s: string) => s.trim() !== ''),
      bio,
      email,
      phone,
      socialMedia,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
      createdBy: (session.user as any).id
    } as Partial<ITeam> as any;

    const member = new Team(teamData);
    await member.save();

    return NextResponse.json({ success: true, data: member, message: 'Team member created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json({ success: false, error: 'Failed to create team member' }, { status: 500 });
  }
}