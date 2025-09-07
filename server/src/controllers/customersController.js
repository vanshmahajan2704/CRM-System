import Customer from '../models/Customer.js';
import Activity from '../models/Activity.js';
import mongoose from 'mongoose';

// Get all customers with filters and pagination
// Get all customers with filters and pagination
const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;
    const agent = req.query.agent;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    const skip = (page - 1) * limit;
    
    // Start with the filter from middleware (ensure it's always an object)
    let query = req.filter ? { ...req.filter } : {};
    
    // Apply agent filter if provided
    if (agent) {
      if (mongoose.Types.ObjectId.isValid(agent)) {
        query.agentId = agent;
      } else {
        return res.status(400).json({ message: 'Invalid agent ID' });
      }
    }
    
    // Apply search filter (handle case where query.$or already exists)
    if (search) {
      const searchConditions = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { 'tags': { $regex: search, $options: 'i' } }
      ];
      
      if (query.$or) {
        // If $or already exists (from middleware), combine with search
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
    
    const customers = await Customer.find(query)
      .populate('owner', 'name email')
      .populate('agentId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Customer.countDocuments(query);
    
    res.json({
      customers,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalCustomers: total
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single customer
const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('agentId', 'name email') // Populate agent details
      .populate('convertedFrom', 'name email status');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new customer - FIXED VERSION
const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, tags, notes, agentId } = req.body;
    
    // Check if customer already exists with this email
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this email already exists' });
    }
    
    // Validate agentId if provided
    if (agentId && !mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ message: 'Invalid agent ID' });
    }
    
    // Handle tags whether they come as string or array
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(tags)) {
        processedTags = tags;
      }
    }
    
    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      tags: processedTags,
      owner: req.user._id,
      agentId: agentId || null
    });
    
    // Add initial note if provided
    if (notes) {
      customer.notes.push({
        content: notes,
        createdBy: req.user._id
      });
      await customer.save();
    }
    
    // Log activity
    await Activity.create({
      action: 'Customer created',
      entityType: 'Customer',
      entityId: customer._id,
      performedBy: req.user._id,
      details: { 
        name: customer.name, 
        email: customer.email,
        agentId: customer.agentId 
      }
    });

    // Populate the customer with owner and agent details
    const populatedCustomer = await Customer.findById(customer._id)
      .populate('owner', 'name email')
      .populate('agentId', 'name email');
    
    res.status(201).json(populatedCustomer);
    
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update customer - FIXED tags handling
const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, company, tags, agentId } = req.body;
    
    // Validate agentId if provided
    if (agentId && !mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ message: 'Invalid agent ID' });
    }
    
    // Handle tags whether they come as string or array
    let processedTags = [];
    if (tags) {
      if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim());
      } else if (Array.isArray(tags)) {
        processedTags = tags;
      }
    }
    
    const updateData = {
      name,
      email,
      phone,
      company,
      tags: processedTags
    };
    
    // Handle agentId assignment (set to null if empty string)
    if (agentId === '') {
      updateData.agentId = null;
    } else if (agentId) {
      updateData.agentId = agentId;
    }
    
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('owner', 'name email')
    .populate('agentId', 'name email');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Log activity
    await Activity.create({
      action: 'Customer updated',
      entityType: 'Customer',
      entityId: customer._id,
      performedBy: req.user._id,
      details: { 
        name: customer.name, 
        email: customer.email,
        agentId: customer.agentId 
      }
    });
    
    res.json(customer);
  } catch (error) {
    console.error('Error updating customer:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    // Log activity
    await Activity.create({
      action: 'Customer deleted',
      entityType: 'Customer',
      entityId: customer._id,
      performedBy: req.user._id,
      details: { name: customer.name, email: customer.email }
    });
    
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add note to customer
const addNote = async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Note content is required' });
    }
    
    const customer = await Customer.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    customer.notes.push({
      content,
      createdBy: req.user._id
    });
    
    await customer.save();
    
    // Log activity
    await Activity.create({
      action: 'Note added to customer',
      entityType: 'Customer',
      entityId: customer._id,
      performedBy: req.user._id,
      details: { customerName: customer.name, notePreview: content.substring(0, 50) }
    });
    
    // Populate the latest note
    await customer.populate('notes.createdBy', 'name');
    
    res.status(201).json(customer.notes[customer.notes.length - 1]);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get customer notes
const getNotes = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('notes.createdBy', 'name')
      .select('notes');
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    
    res.json(customer.notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Default export
export default {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addNote,
  getNotes
};