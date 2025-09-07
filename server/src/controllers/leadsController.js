import Lead from '../models/Lead.js';
import Customer from '../models/Customer.js';
import Activity from '../models/Activity.js';
import mongoose from 'mongoose';

// Get all leads with filters, pagination, and dynamic sorting
const getLeads = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    const skip = (page - 1) * limit;

    let query = { isArchived: false };

    // Apply role-based filtering
    if (req.user.role === 'agent') {
      query.assignedAgent = req.user._id;
    }

    // Apply status filter
    if (status && status !== 'All') {
      query.status = status;
    }

    // Apply search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const leads = await Lead.find(query)
      .populate('assignedAgent', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Lead.countDocuments(query);

    res.json({
      leads,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalLeads: total
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single lead
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedAgent', 'name email');

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    res.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new lead
const createLead = async (req, res) => {
  try {
    const { name, email, phone, status, source } = req.body;

    // Check if lead already exists with this email
    const existingLead = await Lead.findOne({ email, isArchived: false });
    if (existingLead) {
      return res.status(400).json({ message: 'Lead with this email already exists' });
    }

    // For agents, they can only assign to themselves
    const assignedAgent = req.user.role === 'admin' 
      ? req.body.assignedAgent || req.user._id 
      : req.user._id;

    const lead = await Lead.create({
      name,
      email,
      phone,
      status: status || 'New',
      source,
      assignedAgent
    });

    // Log activity
    await Activity.create({
      action: 'Lead created',
      entityType: 'Lead',
      entityId: lead._id,
      performedBy: req.user._id,
      details: { name: lead.name, status: lead.status, source: lead.source }
    });

    const populatedLead = await Lead.findById(lead._id)
      .populate('assignedAgent', 'name email');

    res.status(201).json(populatedLead);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update lead - handles both PUT (full update) and PATCH (partial update)
const updateLead = async (req, res) => {
  try {
    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid lead ID' });
    }

    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check permissions - agents can only update their own leads
    if (req.user.role === 'agent' && lead.assignedAgent.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update your own leads.' 
      });
    }

    let updatedLead;

    // Determine update strategy based on HTTP method
    if (req.method === 'PUT') {
      // PUT - Full document replacement
      const { name, email, phone, status, source, assignedAgent } = req.body;

      // For agents, they can't change the assigned agent
      const updateData = { name, email, phone, status, source };
      if (req.user.role === 'admin' && assignedAgent) {
        updateData.assignedAgent = assignedAgent;
      }

      updatedLead = await Lead.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('assignedAgent', 'name email');

    } else {
      // PATCH - Partial update
      const allowedUpdates = ['name', 'email', 'phone', 'status', 'source', 'notes'];
      const updates = Object.keys(req.body);
      
      // Check if trying to update restricted fields
      if (req.user.role === 'agent' && updates.includes('assignedAgent')) {
        return res.status(403).json({ 
          message: 'Agents cannot change assignment of leads.' 
        });
      }

      // Allow admin to update assignedAgent
      if (req.user.role === 'admin' && updates.includes('assignedAgent')) {
        allowedUpdates.push('assignedAgent');
      }

      // Validate allowed updates
      const isValidOperation = updates.every(update => allowedUpdates.includes(update));
      
      if (!isValidOperation) {
        return res.status(400).json({ 
          message: 'Invalid updates!',
          allowedUpdates 
        });
      }

      // Apply partial updates
      updates.forEach(update => {
        lead[update] = req.body[update];
      });

      await lead.save();
      updatedLead = await Lead.findById(lead._id).populate('assignedAgent', 'name email');
    }

    // Log activity
    await Activity.create({
      action: req.method === 'PUT' ? 'Lead updated (full)' : 'Lead updated (partial)',
      entityType: 'Lead',
      entityId: updatedLead._id,
      performedBy: req.user._id,
      details: { 
        name: updatedLead.name, 
        status: updatedLead.status,
        updatedFields: Object.keys(req.body)
      }
    });

    res.json(updatedLead);
  } catch (error) {
    console.error('Error updating lead:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation error', errors });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete lead (soft delete - archive)
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Log activity
    await Activity.create({
      action: 'Lead archived',
      entityType: 'Lead',
      entityId: lead._id,
      performedBy: req.user._id,
      details: { name: lead.name }
    });

    res.json({ message: 'Lead archived successfully' });
  } catch (error) {
    console.error('Error archiving lead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Convert lead to customer
const convertLeadToCustomer = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }

    // Check if customer already exists with this email
    const existingCustomer = await Customer.findOne({ email: lead.email });
    if (existingCustomer) {
      return res.status(400).json({ message: 'Customer with this email already exists' });
    }

    // Create customer from lead
    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.source || 'Not specified',
      owner: lead.assignedAgent,
      convertedFrom: lead._id,
      tags: ['converted-lead']
    });

    // Archive the lead and mark as converted
    lead.isArchived = true;
    lead.status = 'Closed Won';
    await lead.save();

    // Log activities
    await Activity.create({
      action: 'Lead converted to customer',
      entityType: 'Lead',
      entityId: lead._id,
      performedBy: req.user._id,
      details: { 
        leadName: lead.name, 
        customerId: customer._id,
        customerName: customer.name
      }
    });

    await Activity.create({
      action: 'Customer created from lead',
      entityType: 'Customer',
      entityId: customer._id,
      performedBy: req.user._id,
      details: { name: customer.name, source: 'Lead conversion' }
    });

    // Populate customer data
    await customer.populate('owner', 'name email');

    res.status(201).json({
      customer,
      message: 'Lead successfully converted to customer'
    });
  } catch (error) {
    console.error('Error converting lead:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get lead statistics
const getLeadStats = async (req, res) => {
  try {
    let query = { isArchived: false };

    if (req.user.role === 'agent') {
      query.assignedAgent = req.user._id;
    }

    const stats = await Lead.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      New: stats.find(s => s._id === 'New')?.count || 0,
      'In Progress': stats.find(s => s._id === 'In Progress')?.count || 0,
      'Closed Won': stats.find(s => s._id === 'Closed Won')?.count || 0,
      'Closed Lost': stats.find(s => s._id === 'Closed Lost')?.count || 0,
      Total: stats.reduce((sum, item) => sum + item.count, 0)
    };

    res.json(formattedStats);
  } catch (error) {
    console.error('Error fetching lead stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get leads by source
const getLeadsBySource = async (req, res) => {
  try {
    let query = { isArchived: false };

    if (req.user.role === 'agent') {
      query.assignedAgent = req.user._id;
    }

    const leadsBySource = await Lead.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json(leadsBySource);
  } catch (error) {
    console.error('Error fetching leads by source:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export all controller functions
export default {
  getLeads,
  getLead,
  createLead,
  updateLead, // Now handles both PUT and PATCH
  deleteLead,
  convertLeadToCustomer,
  getLeadStats,
  getLeadsBySource
};