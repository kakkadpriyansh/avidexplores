import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const admins = await User.find({ role: { $in: ['ADMIN', 'SUB_ADMIN'] } })
      .select('name email role permissions createdAt')
      .sort({ createdAt: -1 });

    return NextResponse.json({ admins });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, permissions } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    await connectDB();
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'SUB_ADMIN',
      permissions: permissions || [],
      isActive: true,
      emailVerified: true,
      isVerified: true,
      createdBy: session.user.id,
    });

    return NextResponse.json({ success: true, admin: newAdmin });
  } catch (error: any) {
    console.error('Create sub-admin error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create sub-admin' }, { status: 500 });
  }
}
