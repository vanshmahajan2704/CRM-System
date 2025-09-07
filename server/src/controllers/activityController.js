import Activity from '../models/Activity.js';

// Get activity logs with pagination and filters
export const getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { entityType, action, userId } = req.query;
    
    let query = {};
    
    // Apply filters if provided
    if (entityType) query.entityType = entityType;
    if (action) query.action = action;
    if (userId) query.performedBy = userId;
    
    // For agents, only show their own activity
    if (req.user.role === 'agent') {
      query.performedBy = req.user._id;
    }
    
    const activities = await Activity.find(query)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Activity.countDocuments(query);
    
    res.json({
      activities,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalActivities: total
    });
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get recent activity for dashboard
export const getRecentActivity = async (req, res) => {
  try {
    let query = {};
    
    // For agents, only show their own activity
    if (req.user.role === 'agent') {
      query.performedBy = req.user._id;
    }
    
    const activities = await Activity.find(query)
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Log a new activity
export const logActivity = async (req, res) => {
  try {
    const { action, entityType, entityId, details } = req.body;
    
    const activity = await Activity.create({
      action,
      entityType,
      entityId,
      details,
      performedBy: req.user._id
    });
    
    // Populate the performer info
    await activity.populate('performedBy', 'name email');
    
    res.status(201).json(activity);
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get activity for a specific entity
export const getEntityActivity = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    
    let query = { entityType, entityId };
    
    // For agents, only show their own activity
    if (req.user.role === 'agent') {
      query.performedBy = req.user._id;
    }
    
    const activities = await Activity.find(query)
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching entity activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};