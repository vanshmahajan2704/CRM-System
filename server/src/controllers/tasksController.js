import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import Customer from '../models/Customer.js';
import Lead from '../models/Lead.js';
import mongoose from 'mongoose';

// Get all tasks with filters and pagination
const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const priority = req.query.priority;
    const search = req.query.search;
    const agent = req.query.agent;
    const skip = (page - 1) * limit;
    const sortBy = req.query.sortBy || 'dueDate';
    const sortOrder = req.query.sortOrder || 'asc';
    
    // Start with base query
    let query = {};
    
    // Apply middleware filter if it exists
    if (req.filter) {
      query = { ...req.filter };
    }
    
    // Apply agent filter
    if (agent && mongoose.Types.ObjectId.isValid(agent)) {
      query.agentId = agent;
    }
    
    // Apply status filter
    if (status && status !== 'All') {
      query.status = status;
    }
    
    // Apply priority filter
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    
    // Apply search filter
    if (search) {
      const searchConditions = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
      
      // If we already have a query, use $and to combine
      if (Object.keys(query).length > 0) {
        query = {
          $and: [
            query,
            { $or: searchConditions }
          ]
        };
      } else {
        query.$or = searchConditions;
      }
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('agentId', 'name email')
      .populate('owner', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Task.countDocuments(query);
    
    res.json({
      tasks,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTasks: total
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single task
const getTask = async (req, res) => {
  try {
    // req.document is already set by the checkOwnership middleware
    const task = req.document;
    
    // Populate assignedTo, agentId, and owner fields
    await task.populate('assignedTo', 'name email');
    await task.populate('agentId', 'name email');
    await task.populate('owner', 'name email');
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, relatedTo, relatedId, assignedTo, agentId } = req.body;
    
    // Validate due date is in the future
    if (new Date(dueDate) <= new Date()) {
      return res.status(400).json({ message: 'Due date must be in the future' });
    }
    
    // Validate agentId if provided
    if (agentId && !mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ message: 'Invalid agent ID' });
    }
    
    // For agents, they can only assign to themselves
    const assignedUser = req.user.role === 'admin' 
      ? assignedTo || req.user._id 
      : req.user._id;
    
    const task = await Task.create({
      title,
      description,
      dueDate: new Date(dueDate),
      priority: priority || 'Medium',
      status: status || 'Open',
      relatedTo,
      relatedId,
      owner: req.user._id,
      assignedTo: assignedUser,
      agentId: agentId || null,
      createdBy: req.user._id
    });
    
    // Log activity
    await Activity.create({
      action: 'Task created',
      entityType: 'Task',
      entityId: task._id,
      performedBy: req.user._id,
      details: { 
        title: task.title, 
        dueDate: task.dueDate,
        priority: task.priority,
        agentId: task.agentId
      }
    });
    
    await task.populate('assignedTo', 'name email');
    await task.populate('agentId', 'name email');
    await task.populate('owner', 'name email');
    
    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, status, relatedTo, relatedId, assignedTo, agentId } = req.body;
    
    // Validate due date is in the future if provided
    if (dueDate && new Date(dueDate) <= new Date()) {
      return res.status(400).json({ message: 'Due date must be in the future' });
    }
    
    // Validate agentId if provided
    if (agentId && !mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ message: 'Invalid agent ID' });
    }
    
    // For agents, they can't change the assigned user
    const updateData = { title, description, priority, status, relatedTo, relatedId };
    
    if (dueDate) {
      updateData.dueDate = new Date(dueDate);
    }
    
    // Handle agent assignment
    if (agentId === '') {
      updateData.agentId = null;
    } else if (agentId) {
      updateData.agentId = agentId;
    }
    
    if (req.user.role === 'admin' && assignedTo) {
      updateData.assignedTo = assignedTo;
    }
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('assignedTo', 'name email')
    .populate('agentId', 'name email')
    .populate('owner', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Log activity
    await Activity.create({
      action: 'Task updated',
      entityType: 'Task',
      entityId: task._id,
      performedBy: req.user._id,
      details: { 
        title: task.title, 
        status: task.status,
        agentId: task.agentId
      }
    });
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Log activity
    await Activity.create({
      action: 'Task deleted',
      entityType: 'Task',
      entityId: task._id,
      performedBy: req.user._id,
      details: { title: task.title }
    });
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update task status
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
    .populate('assignedTo', 'name email')
    .populate('agentId', 'name email')
    .populate('owner', 'name email');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Log activity
    await Activity.create({
      action: `Task marked as ${status}`,
      entityType: 'Task',
      entityId: task._id,
      performedBy: req.user._id,
      details: { title: task.title, status: task.status }
    });
    
    res.json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's tasks (for current user)
const getMyTasks = async (req, res) => {
  try {
    const { status, priority } = req.query;
    
    // Use the filter from middleware
    let query = req.filter ? { ...req.filter } : {};
    
    // Apply status filter
    if (status && status !== 'All') {
      query.status = status;
    }
    
    // Apply priority filter
    if (priority && priority !== 'All') {
      query.priority = priority;
    }
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('agentId', 'name email')
      .populate('owner', 'name email')
      .sort({ dueDate: 1, priority: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get overdue tasks
const getOverdueTasks = async (req, res) => {
  try {
    // Start with the filter from middleware
    let query = req.filter ? { ...req.filter } : {};
    
    // Add overdue conditions
    query = {
      ...query,
      dueDate: { $lt: new Date() },
      status: { $in: ['Open', 'In Progress'] }
    };
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('agentId', 'name email')
      .populate('owner', 'name email')
      .sort({ dueDate: 1 });
    
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching overdue tasks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get task statistics
const getTaskStats = async (req, res) => {
  try {
    // Start with the filter from middleware
    let query = req.filter ? { ...req.filter } : {};
    
    const stats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format the stats
    const formattedStats = {
      Open: stats.find(s => s._id === 'Open')?.count || 0,
      'In Progress': stats.find(s => s._id === 'In Progress')?.count || 0,
      Done: stats.find(s => s._id === 'Done')?.count || 0,
      Total: stats.reduce((sum, item) => sum + item.count, 0)
    };
    
    // Get overdue count
    const overdueQuery = { 
      ...query,
      dueDate: { $lt: new Date() },
      status: { $in: ['Open', 'In Progress'] }
    };
    
    const overdueCount = await Task.countDocuments(overdueQuery);
    formattedStats.Overdue = overdueCount;
    
    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get related entity name (for custom IDs)
const getRelatedEntityName = async (req, res) => {
  try {
    const { relatedTo, relatedId } = req.params;
    
    let entity;
    if (relatedTo === 'Customer') {
      entity = await Customer.findOne({ 
        $or: [
          { customId: relatedId },
          { _id: relatedId }
        ]
      }).select('name email');
    } else if (relatedTo === 'Lead') {
      entity = await Lead.findOne({ 
        $or: [
          { customId: relatedId },
          { _id: relatedId }
        ]
      }).select('name email');
    } else {
      return res.status(400).json({ message: 'Invalid related entity type' });
    }
    
    if (!entity) {
      return res.status(404).json({ message: 'Related entity not found' });
    }
    
    res.json({ 
      name: entity.name,
      email: entity.email 
    });
  } catch (error) {
    console.error('Error fetching related entity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getMyTasks,
  getOverdueTasks,
  getTaskStats,
  getRelatedEntityName
};