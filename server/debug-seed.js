import mongoose from 'mongoose';
import User from './src/models/User.js';

async function debugSeed() {
  try {
    console.log('1. Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/crm');
    console.log('✅ Connected');
    
    console.log('2. Clearing users...');
    await User.deleteMany({});
    console.log('✅ Cleared');
    
    console.log('3. Creating single user...');
    const user = new User({
      name: 'Admin User',
      email: 'admin@crm.com',
      password: 'admin123',
      role: 'admin'
    });
    
    await user.save();
    console.log('✅ User saved');
    
    console.log('4. Checking database...');
    const users = await User.find();
    console.log('Users in DB:', users.length);
    users.forEach(u => console.log(`- ${u.email}: ${u.password}`));
    
    await mongoose.connection.close();
    console.log('✅ Done');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

debugSeed();