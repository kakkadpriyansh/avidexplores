const { MongoClient, ObjectId } = require('mongodb');

async function updateBooking() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('avid-explores');
    
    const result = await db.collection('bookings').updateOne(
      { _id: new ObjectId('68e6f0d8ab1653db6a6bba1e') },
      { 
        $set: { 
          selectedDeparture: 'rajkot to rajkot',
          selectedTransportMode: 'AC_TRAIN'
        } 
      }
    );
    
    console.log('Updated:', result.modifiedCount);
    
    const booking = await db.collection('bookings').findOne({ _id: new ObjectId('68e6f0d8ab1653db6a6bba1e') });
    console.log('Booking now has:', { 
      selectedDeparture: booking.selectedDeparture, 
      selectedTransportMode: booking.selectedTransportMode 
    });
  } finally {
    await client.close();
  }
}

updateBooking().catch(console.error);
