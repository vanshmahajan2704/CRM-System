import Lead from '../models/Lead.js';
import Customer from '../models/Customer.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';

const getDashboardData = async (req, res) => {
  try {
    const { range = 'week' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    
    switch (range) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'quarter':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Base query conditions
    const baseQuery = { isArchived: false };
    if (req.user.role === 'agent') {
      baseQuery.assignedAgent = req.user._id;
    }

    // Get all stats in parallel for maximum performance
    const [
      totalLeads,
      totalCustomers,
      openTasks,
      convertedLeads,
      leadStatusData,
      leadsBySource,
      recentLeads,
      recentTasks,
      activityLog,
      overdueTasks
    ] = await Promise.all([
      // Total leads count (should be 10 after seeding)
      Lead.countDocuments(baseQuery),
      
      // Total customers count (should be 5 after seeding) - FIXED: changed owner to agentId
      Customer.countDocuments(
        req.user.role === 'agent' ? { agentId: req.user._id } : {}
      ),
      
      // Open tasks count (should be 3+)
      Task.countDocuments({
        ...(req.user.role === 'agent' && { assignedTo: req.user._id }),
        status: { $in: ['Open', 'In Progress'] }
      }),
      
      // Converted leads count (for conversion rate)
      Lead.countDocuments({
        ...baseQuery,
        status: 'Closed Won'
      }),
      
      // Leads by status for chart
      Lead.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Leads by source
      Lead.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      
      // Recent leads (5 most recent)
      Lead.find(baseQuery)
        .populate('assignedAgent', 'name email')
        .sort({ createdAt: -1 })
        .limit(5),
      
      // Recent tasks (5 most urgent)
      Task.find({
        ...(req.user.role === 'agent' && { assignedTo: req.user._id })
      })
        .populate('assignedTo', 'name')
        .populate('relatedId', 'name')
        .sort({ dueDate: 1 })
        .limit(5),
      
      // Activity log (10 most recent)
      Activity.find()
        .populate('performedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      
      // Overdue tasks count
      Task.countDocuments({
        ...(req.user.role === 'agent' && { assignedTo: req.user._id }),
        dueDate: { $lt: new Date() },
        status: { $in: ['Open', 'In Progress'] }
      })
    ]);

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? 
      Math.round((convertedLeads / totalLeads) * 100) : 0;

    // Format data for charts
    const statusChartData = [
      { name: 'New', value: leadStatusData.find(s => s._id === 'New')?.count || 0 },
      { name: 'In Progress', value: leadStatusData.find(s => s._id === 'In Progress')?.count || 0 },
      { name: 'Closed Won', value: leadStatusData.find(s => s._id === 'Closed Won')?.count || 0 },
      { name: 'Closed Lost', value: leadStatusData.find(s => s._id === 'Closed Lost')?.count || 0 }
    ];

    const sourceChartData = leadsBySource.map(source => ({
      name: source._id || 'Unknown',
      value: source.count
    }));

    res.json({
      stats: {
        totalLeads,          // Should be 10 after seeding
        totalCustomers,      // Should be 5 after seeding
        openTasks,           // Dynamic count
        overdueTasks,        // Dynamic count
        conversionRate,      // Calculated
        leadsBySource: sourceChartData
      },
      charts: {
        leadStatus: statusChartData,
        leadsBySource: sourceChartData
      },
      recent: {
        leads: recentLeads,
        tasks: recentTasks,
        activity: activityLog
      },
      overview: {
        timeRange: range,
        generatedAt: new Date(),
        userRole: req.user.role,
        // These should match the specification after seeding:
        expectedLeads: 10,
        expectedCustomers: 5
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      message: 'Error loading dashboard data', 
      error: error.message 
    });
  }
};

// Get quick stats for header/widgets
const getQuickStats = async (req, res) => {
  try {
    const baseQuery = { isArchived: false };
    if (req.user.role === 'agent') {
      baseQuery.assignedAgent = req.user._id;
    }

    const [totalLeads, totalCustomers, openTasks, overdueTasks] = await Promise.all([
      Lead.countDocuments(baseQuery),                          // Should be 10
      // FIXED: changed owner to agentId
      Customer.countDocuments(
        req.user.role === 'agent' ? { agentId: req.user._id } : {}
      ),                                                       // Should be 5
      Task.countDocuments({
        ...(req.user.role === 'agent' && { assignedTo: req.user._id }),
        status: { $in: ['Open', 'In Progress'] }
      }),                                                      // Dynamic
      Task.countDocuments({
        ...(req.user.role === 'agent' && { assignedTo: req.user._id }),
        dueDate: { $lt: new Date() },
        status: { $in: ['Open', 'In Progress'] }
      })                                                       // Dynamic
    ]);

    res.json({
      totalLeads,      // Should be 10 after seeding
      totalCustomers,  // Should be 5 after seeding
      openTasks,       // Dynamic
      overdueTasks     // Dynamic
    });
  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({ 
      message: 'Error loading quick stats', 
      error: error.message 
    });
  }
};

// Get leads analytics for charts
const getLeadsAnalytics = async (req, res) => {
  try {
    const { range = 'month' } = req.query;
    
    const startDate = new Date();
    if (range === 'week') startDate.setDate(startDate.getDate() - 7);
    else if (range === 'month') startDate.setDate(startDate.getDate() - 30);
    else if (range === 'quarter') startDate.setDate(startDate.getDate() - 90);

    const baseQuery = { 
      isArchived: false,
      createdAt: { $gte: startDate }
    };
    
    if (req.user.role === 'agent') {
      baseQuery.assignedAgent = req.user._id;
    }

    const [leadsByDate, leadsByStatus, leadsBySource] = await Promise.all([
      // Leads created per day (last 14 days)
      Lead.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } },
        { $limit: 14 }
      ]),
      
      // Leads by status
      Lead.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Leads by source
      Lead.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: '$source',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ])
    ]);

    res.json({
      leadsByDate,
      leadsByStatus,
      leadsBySource,
      timeRange: range
    });
  } catch (error) {
    console.error('Leads analytics error:', error);
    res.status(500).json({ 
      message: 'Error loading leads analytics', 
      error: error.message 
    });
  }
};

// Export as ES modules
export {
  getDashboardData,
  getQuickStats,
  getLeadsAnalytics
};