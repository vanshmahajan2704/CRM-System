import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lead name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot exceed 20 characters']
  },
  status: {
    type: String,
    enum: ['New', 'In Progress', 'Closed Won', 'Closed Lost'],
    default: 'New'
  },
  source: {
    type: String,
    trim: true,
    maxlength: [50, 'Source cannot exceed 50 characters']
  },
  assignedAgent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned agent is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  convertedToCustomer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
leadSchema.index({ assignedAgent: 1 });
leadSchema.index({ status: 1 });
leadSchema.index({ email: 1 });
leadSchema.index({ isArchived: 1 });
leadSchema.index({ createdAt: -1 });

// Virtual for lead age (days since creation)
leadSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
leadSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Lead', leadSchema);