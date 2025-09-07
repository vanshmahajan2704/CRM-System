import Lead from '../models/Lead.js';
import Customer from '../models/Customer.js';
import Task from '../models/Task.js';

// Restrict access to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'You do not have permission to perform this action' 
      });
    }

    next();
  };
};

// Filter documents by ownership for list queries - FIXED VERSION
export const filterByOwnership = (modelName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required' 
      });
    }

    // Always create a NEW filter object for each request
    const newFilter = {};

    // Admin can access all documents - no additional filter needed
    if (req.user.role === 'admin') {
      req.filter = newFilter; // Set to empty object
      return next();
    }

    // For agents, create filter based on model type
    switch (modelName) {
      case 'Lead':
        newFilter.assignedAgent = req.user._id;
        break;
      case 'Customer':
        newFilter.$or = [
          { owner: req.user._id },
          { agentId: req.user._id }
        ];
        break;
      case 'Task':
        // FIXED: Agents should see tasks where they are either:
        // 1. The assigned agent (agentId), OR
        // 2. The assigned user (assignedTo)
        newFilter.$or = [
          { agentId: req.user._id },
          { assignedTo: req.user._id }
        ];
        break;
      default:
        // Empty filter for unknown models
        break;
    }

    // Assign the fresh filter to req.filter
    req.filter = newFilter;
    next();
  };
};

// Check ownership for documents with agent support
export const checkOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Authentication required' 
        });
      }

      // Admin can access all documents
      if (req.user.role === 'admin') {
        return next();
      }

      let Model;
      let ownershipFields = [];

      // Determine which model and ownership fields to use
      switch (modelName) {
        case 'Lead':
          Model = Lead;
          ownershipFields = ['assignedAgent'];
          break;
        case 'Customer':
          Model = Customer;
          ownershipFields = ['owner', 'agentId'];
          break;
        case 'Task':
          Model = Task;
          // FIXED: Agents can access tasks where they are either:
          // 1. The assigned agent (agentId), OR
          // 2. The assigned user (assignedTo)
          ownershipFields = ['agentId', 'assignedTo'];
          break;
        default:
          return res.status(400).json({ 
            message: 'Invalid model type' 
          });
      }

      // Find the document
      const document = await Model.findById(req.params.id);
      
      if (!document) {
        return res.status(404).json({ 
          message: 'Document not found' 
        });
      }

      // Check if user has ownership through any of the specified fields
      let hasOwnership = false;
      
      for (const field of ownershipFields) {
        if (document[field] && document[field].toString() === req.user._id.toString()) {
          hasOwnership = true;
          break;
        }
      }

      if (!hasOwnership) {
        return res.status(403).json({ 
          message: 'You can only access records assigned to you' 
        });
      }

      // Add document to request for use in controllers
      req.document = document;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      res.status(500).json({ 
        message: 'Server error during ownership verification' 
      });
    }
  };
};

// Check if user can access multiple documents (for bulk operations) with agent support
export const checkBulkOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          message: 'Authentication required' 
        });
      }

      // Admin can access all documents
      if (req.user.role === 'admin') {
        return next();
      }

      let Model;
      let ownershipFields = [];

      switch (modelName) {
        case 'Lead':
          Model = Lead;
          ownershipFields = ['assignedAgent'];
          break;
        case 'Customer':
          Model = Customer;
          ownershipFields = ['owner', 'agentId'];
          break;
        case 'Task':
          Model = Task;
          // FIXED: Agents can access tasks where they are either:
          // 1. The assigned agent (agentId), OR
          // 2. The assigned user (assignedTo)
          ownershipFields = ['agentId', 'assignedTo'];
          break;
        default:
          return res.status(400).json({ 
            message: 'Invalid model type' 
          });
      }

      // Check ownership for each document ID
      if (req.body.ids && Array.isArray(req.body.ids)) {
        for (const id of req.body.ids) {
          const document = await Model.findById(id);
          
          if (!document) {
            return res.status(404).json({ 
              message: `Document ${id} not found` 
            });
          }

          // Check if user has ownership through any of the specified fields
          let hasOwnership = false;
          
          for (const field of ownershipFields) {
            if (document[field] && document[field].toString() === req.user._id.toString()) {
              hasOwnership = true;
              break;
            }
          }

          if (!hasOwnership) {
            return res.status(403).json({ 
              message: 'You can only access records assigned to you' 
            });
          }
        }
      }

      next();
    } catch (error) {
      console.error('Bulk ownership check error:', error);
      res.status(500).json({ 
        message: 'Server error during bulk ownership verification' 
      });
    }
  };
};

// Middleware to check if user can manage users (admin only)
export const canManageUsers = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Only administrators can manage users' 
    });
  }

  next();
};

// Middleware to check if user can manage settings (admin only)
export const canManageSettings = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Only administrators can manage settings' 
    });
  }

  next();
};