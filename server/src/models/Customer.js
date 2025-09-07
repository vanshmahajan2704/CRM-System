import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true,
    maxlength: [1000, 'Note cannot exceed 1000 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  notes: [noteSchema],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner is required']
  },
  convertedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Prospect', 'At Risk', 'Churned'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
customerSchema.index({ owner: 1 });
customerSchema.index({ agentId: 1 }); // Add index for agentId
customerSchema.index({ status: 1 });
customerSchema.index({ tags: 1 });
customerSchema.index({ createdAt: -1 });

// Virtual for latest note
customerSchema.virtual('latestNote').get(function() {
  if (this.notes.length === 0) return null;
  return this.notes[this.notes.length - 1];
});

// Virtual for note count
customerSchema.virtual('noteCount').get(function() {
  return this.notes.length;
});

// Virtual for agent information
customerSchema.virtual('agent', {
  ref: 'User',
  localField: 'agentId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
customerSchema.set('toJSON', { virtuals: true });

// Middleware to ensure agentId is valid if provided
customerSchema.pre('save', async function(next) {
  if (this.agentId && this.agentId !== this.owner) {
    try {
      const User = mongoose.model('User');
      const agent = await User.findById(this.agentId);
      if (!agent) {
        throw new Error('Invalid agent ID');
      }
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

export default mongoose.model('Customer', customerSchema);