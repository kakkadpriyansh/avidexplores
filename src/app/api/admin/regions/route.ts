import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('events');
    
    // Get distinct regions from events
    const regions = await collection.distinct('region', { region: { $exists: true, $ne: null, $ne: '' } });
    
    return NextResponse.json({
      success: true,
      data: regions.sort()
    });
  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch regions' },
      { status: 500 }
    );
  }
}