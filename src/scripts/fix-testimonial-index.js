const { MongoClient } = require('mongodb');

async function fixTestimonialIndex() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database');
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('testimonials');
    
    // Drop the existing problematic index
    try {
      await collection.dropIndex({ userId: 1, eventId: 1 });
      console.log('Dropped old index');
    } catch (error) {
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
    console.log('Created new index with partial filter');
    
  } finally {
    await client.close();
  }
}

fixTestimonialIndex().catch(console.error);