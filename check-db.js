const { MongoClient } = require('mongodb');

async function checkDatabase() {
  const client = new MongoClient('mongodb://localhost:27017/avid-explores');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('avid-explores');
    const events = db.collection('events');
    
    const event = await events.findOne({ title: 'Spiti Valley Road Trip' });
    
    if (event && event.departures && event.departures.length > 0) {
      console.log('\n=== Event Found ===');
      console.log('Title:', event.title);
      console.log('\n=== Departures ===');
      console.log(JSON.stringify(event.departures, null, 2));
      
      if (event.departures[0].availableDates && event.departures[0].availableDates.length > 0) {
        console.log('\n=== dateTransportModes ===');
        console.log(JSON.stringify(event.departures[0].availableDates[0].dateTransportModes, null, 2));
      }
    } else {
      console.log('Event not found or no departures');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkDatabase();
