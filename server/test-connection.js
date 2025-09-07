import mongoose from 'mongoose';

async function test() {
  try {
    console.log('Step 1: Testing MongoDB connection...');
    
    // Test with timeout
    await mongoose.connect('mongodb://localhost:27017/crm', {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Step 2: MongoDB connected successfully!');
    
    // Check if users collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Step 3: Collections found:');
    collections.forEach(collection => {
      console.log('  -', collection.name);
    });
    
    // Check if users exist
    const users = await mongoose.connection.db.collection('users').find().toArray();
    console.log('Step 4: Users in database:', users.length);
    
    await mongoose.connection.close();
    console.log('✅ Step 5: Connection closed');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

test();