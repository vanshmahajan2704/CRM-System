import mongoose from 'mongoose';
import User from './src/models/User.js';

async function test() {
  try {
    await mongoose.connect('mongodb://localhost:27017/crm');
    
    // Create a simple user
    const user = new User({
      name: 'Test User',
      email: 'test@test.com',
      password: 'test123',
      role: 'agent'
    });
    
    await user.save();
    console.log('✅ User saved successfully!');
    
    // Check if user exists
    const users = await User.find();
    console.log('Users in database:', users.length);
    
    await mongoose.connection.close();
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

test();