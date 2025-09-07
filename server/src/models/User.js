import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,  // ← This automatically creates an index
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'agent'],
    default: 'agent'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Keep these indexes (they're not duplicates)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });



// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    console.log('Pre-save hook called for:', this.email);
    if (!this.isModified('password')) {
      console.log('Password not modified, skipping hash');
      return next();
    }
    console.log('Hashing password for:', this.email);
    this.password = await bcrypt.hash(this.password, 12);
    console.log('Password hashed successfully for:', this.email);
    next();
  } catch (error) {
    console.error('Error in pre-save hook for', this.email, ':', error.message);
    next(error);
  }
});
// Update lastLogin on login//
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Check password method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Get public profile (remove sensitive data)
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

export default mongoose.model('User', userSchema);