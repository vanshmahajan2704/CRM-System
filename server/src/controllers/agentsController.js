import User from '../models/User.js';

// Get all agents (users with agent role)
const getAgents = async (req, res) => {
  try {
    // Assuming you have a role field in your User model
    const agents = await User.find({ 
      role: 'agent' // or whatever role indicates an agent
    }).select('name email _id role'); // Only return necessary fields
    
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export default {
  getAgents
};