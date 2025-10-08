import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Inquiry, { IInquiry } from '@/models/Inquiry';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/inquiries - Create new inquiry (Public)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { firstName, lastName, email, phone, adventureInterest, message } = body;

    // Validation
    if (!firstName || !lastName || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create inquiry
    const inquiry = new Inquiry({
      firstName,
      lastName,
      email,
      phone,
      adventureInterest,
      message
    });

    await inquiry.save();

    return NextResponse.json({
      message: 'Inquiry submitted successfully',
      inquiry: {
        id: inquiry._id,
        firstName: inquiry.firstName,
        lastName: inquiry.lastName,
        email: inquiry.email
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

// GET /api/inquiries - Get all inquiries (Admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Build filter
    const filter: any = {};
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { message: new RegExp(search, 'i') }
      ];
    }
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const inquiries = await Inquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Inquiry.countDocuments(filter);

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}