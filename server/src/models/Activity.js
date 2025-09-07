import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    maxlength: [100, 'Action cannot exceed 100 characters']
  },
  entityType: {
    type: String,
    required: [true, 'Entity type is required'],
    enum: ['Lead', 'Customer', 'Task', 'User']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Entity ID is required']
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Performed by user is required']
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
activitySchema.index({ performedBy: 1 });
activitySchema.index({ entityType: 1, entityId: 1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ action: 1 });

// Virtual for readable timestamp
activitySchema.virtual('readableTime').get(function() {
  return this.createdAt.toLocaleString();
});

// Ensure virtual fields are serialized
activitySchema.set('toJSON', { virtuals: true });

export default mongoose.model('Activity', activitySchema);