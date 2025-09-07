import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value) {
        return value > Date.now();
      },
      message: 'Due date must be in the future'
    }
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Done'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  relatedTo: {
    type: String,
    enum: ['Lead', 'Customer'],
    required: [true, 'Related entity type is required']
  },
  // CHANGED: From ObjectId to String to accept custom IDs
  relatedId: {
    type: String,
    required: [true, 'Related entity ID is required']
  },
  // ADDED: Owner field (same as Customer model)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Assigned user is required']
  },
  // ADDED: Agent assignment field
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
taskSchema.index({ owner: 1 });        // ADDED: Index for owner
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ agentId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ relatedTo: 1, relatedId: 1 });
taskSchema.index({ completedAt: 1 });

// Virtual for agent information
taskSchema.virtual('agent', {
  ref: 'User',
  localField: 'agentId',
  foreignField: '_id',
  justOne: true
});

// Virtual for owner information
taskSchema.virtual('ownerInfo', {
  ref: 'User',
  localField: 'owner',
  foreignField: '_id',
  justOne: true
});

// Virtual to check if task is overdue
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'Done';
});

// Middleware to handle task completion
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Done' && !this.completedAt) {
    this.completedAt = new Date();
  } else if (this.isModified('status') && this.status !== 'Done' && this.completedAt) {
    this.completedAt = undefined;
  }
  next();
});

// Middleware to validate agentId if provided
taskSchema.pre('save', async function(next) {
  if (this.agentId && this.agentId.toString() !== this.assignedTo.toString()) {
    try {
      const User = mongoose.model('User');
      const agent = await User.findById(this.agentId);
      if (!agent) {
        throw new Error('Invalid agent ID');
      }
      // Optional: Check if the user has agent permissions
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Ensure virtual fields are serialized
taskSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Task', taskSchema);