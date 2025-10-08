const { MongoClient } = require('mongodb');

async function checkBookings() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('avid-explores');
    
    const bookings = await db.collection('bookings').find({}).toArray();
    console.log('Total bookings:', bookings.length);
    
    if (bookings.length > 0) {
      console.log('\nLatest booking:');
      console.log(JSON.stringify(bookings[bookings.length - 1], null, 2));
    }
  } finally {
    await client.close();
  }
}

checkBookings().catch(console.error);
