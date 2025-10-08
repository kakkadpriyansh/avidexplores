const { MongoClient, ObjectId } = require('mongodb');

async function checkEvent() {
  const client = new MongoClient('mongodb://localhost:27017');
  try {
    await client.connect();
    const db = client.db('avid-explores');
    
    const event = await db.collection('events').findOne({ _id: new ObjectId('b4c84c2e951b4a6590550b03') });
    
    if (event && event.departures) {
      console.log('Event departures:');
      event.departures.forEach((dep, idx) => {
        console.log(`\nDeparture ${idx + 1}: ${dep.label}`);
        if (dep.availableDates) {
          dep.availableDates.forEach(d => {
            console.log(`  Month: ${d.month}, Year: ${d.year}, Dates: ${d.dates}`);
          });
        }
      });
    }
  } finally {
    await client.close();
  }
}

checkEvent().catch(console.error);
