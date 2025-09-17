import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Subscriber, { ISubscriber } from '@/models/Subscriber';
import { Model } from 'mongoose';

// GET /api/subscribers - Get subscribers (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const source = searchParams.get('source');

    // Build filter object
    const filter: any = {};
    if (status) filter.isActive = status === 'active';
    if (source) filter.source = source;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get subscribers
    const subscribers = await (Subscriber as Model<ISubscriber>).find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    const total = await (Subscriber as Model<ISubscriber>).countDocuments(filter);

    return NextResponse.json({
      success: true,
      data: subscribers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// POST /api/subscribers - Subscribe to newsletter
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, name, source = 'NEWSLETTER', preferences } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingSubscriber = await (Subscriber as Model<ISubscriber>).findOne({
      email: email.toLowerCase()
    });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return NextResponse.json(
          { success: false, error: 'Email is already subscribed' },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.unsubscribedAt = undefined;
        await existingSubscriber.save();

        return NextResponse.json({
          success: true,
          message: 'Successfully resubscribed to newsletter'
        });
      }
    }

    // Create new subscriber
    const subscriber = await (Subscriber as Model<ISubscriber>).create({
      email: email.toLowerCase(),
      name,
      source,
      preferences: preferences || {
        eventUpdates: true,
        storyUpdates: true,
        promotions: false,
        weeklyDigest: false
      },
      isActive: true
    });

    return NextResponse.json({
      success: true,
      data: subscriber,
      message: 'Successfully subscribed to newsletter'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating subscriber:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}