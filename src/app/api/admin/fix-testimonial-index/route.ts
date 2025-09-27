import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST() {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const collection = db.collection('testimonials');
    
    // Drop the existing problematic index
    try {
      await collection.dropIndex('userId_1_eventId_1');
      console.log('Dropped old index');
    } catch (error: any) {
      console.log('Index may not exist:', error.message);
    }
    
    // Create the new index with partial filter
    await collection.createIndex(
      { userId: 1, eventId: 1 }, 
      { 
        unique: true, 
        partialFilterExpression: { 
          userId: { $exists: true, $ne: null }, 
          eventId: { $exists: true, $ne: null } 
        } 
      }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Index fixed successfully'
    });
    
  } catch (error) {
    console.error('Error fixing index:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix index' },
      { status: 500 }
    );
  }
}