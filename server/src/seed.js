// src/seed.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Lead from './models/Lead.js';
import Customer from './models/Customer.js';
import Task from './models/Task.js';

// Load environment variables
dotenv.config();

// Sample data - KEEP 2 AGENTS ONLY
const sampleUsers = [
  { 
    name: 'Admin User', 
    email: 'admin@crm.com', 
    password: 'admin123', 
    role: 'admin' 
  },
  { 
    name: 'Vansh Mahajan', 
    email: 'vanshmahajan@crm.com', 
    password: 'agent123', 
    role: 'agent' 
  },
  { 
    name: 'Mannat Gupta', 
    email: 'mannatgupta@crm.com', 
    password: 'agent123', 
    role: 'agent' 
  }
];

// Complete lead data with all requested fields
const sampleLeads = [
  { 
    name: 'Rajesh Kumar', 
    email: 'rajesh.kumar@example.com', 
    phone: '+91 9876543210',
    source: 'Website',
    status: 'New',
    company: 'Tech Solutions Ltd'
  },
  { 
    name: 'Priya Sharma', 
    email: 'priya.sharma@example.com', 
    phone: '+91 8765432109',
    source: 'Referral',
    status: 'In Progress',
    company: 'Finance Corp'
  },
  { 
    name: 'Amit Patel', 
    email: 'amit.patel@example.com', 
    phone: '+91 7654321098',
    source: 'Social Media',
    status: 'Closed Won',
    company: 'Retail Ventures'
  },
  { 
    name: 'Sneha Desai', 
    email: 'sneha.desai@example.com', 
    phone: '+91 6543210987',
    source: 'Website',
    status: 'New',
    company: 'Healthcare Solutions'
  },
  { 
    name: 'Vikram Singh', 
    email: 'vikram.singh@example.com', 
    phone: '+91 9432109876',
    source: 'Email Campaign',
    status: 'Closed Lost',
    company: 'Manufacturing Inc'
  },
  { 
    name: 'Neha Gupta', 
    email: 'neha.gupta@example.com', 
    phone: '+91 8321098765',
    source: 'Referral',
    status: 'New',
    company: 'Education First'
  },
  { 
    name: 'Rahul Mehta', 
    email: 'rahul.mehta@example.com', 
    phone: '+91 7210987654',
    source: 'Website',
    status: 'In Progress',
    company: 'Logistics Partners'
  },
  { 
    name: 'Anjali Joshi', 
    email: 'anjali.joshi@example.com', 
    phone: '+91 6109876543',
    source: 'Social Media',
    status: 'Closed Won',
    company: 'Media House'
  },
  { 
    name: 'Sanjay Verma', 
    email: 'sanjay.verma@example.com', 
    phone: '+91 5098765432',
    source: 'Website',
    status: 'New',
    company: 'Real Estate Developers'
  },
  { 
    name: 'Divya Reddy', 
    email: 'divya.reddy@example.com', 
    phone: '+91 4987654321',
    source: 'Email Campaign',
    status: 'Closed Lost',
    company: 'Hospitality Group'
  }
];

// Complete customer data with all requested fields
const sampleCustomers = [
  { 
    name: 'Arun Malhotra', 
    email: 'arun.malhotra@company-a.com', 
    phone: '+91 1122334455',
    company: 'Company A',
    tags: ['Enterprise', 'Priority', 'Tech'],
    status: 'Active'
  },
  { 
    name: 'Meera Choudhury', 
    email: 'meera.choudhury@company-b.com', 
    phone: '+91 2233445566',
    company: 'Company B',
    tags: ['SMB', 'Marketing', 'Retail'],
    status: 'Active'
  },
  { 
    name: 'Karan Bajaj', 
    email: 'karan.bajaj@company-c.com', 
    phone: '+91 3344556677',
    company: 'Company C',
    tags: ['Enterprise', 'Finance', 'Long-term'],
    status: 'Active'
  },
  { 
    name: 'Sunita Rao', 
    email: 'sunita.rao@company-d.com', 
    phone: '+91 4455667788',
    company: 'Company D',
    tags: ['SMB', 'Healthcare', 'New'],
    status: 'Active'
  },
  { 
    name: 'Vivek Menon', 
    email: 'vivek.menon@company-e.com', 
    phone: '+91 5566778899',
    company: 'Company E',
    tags: ['Enterprise', 'Manufacturing', 'Strategic'],
    status: 'Active'
  }
];

// Use Task enum values: 'Open', 'In Progress', 'Done'
// Updated due dates to be in the future
const sampleTasks = [
  { 
    title: 'Call Rajesh Kumar', 
    description: 'Follow up with Rajesh Kumar about enterprise plan', 
    relatedTo: 'Lead',
    priority: 'High',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
  },
  { 
    title: 'Send Proposal to Company B', 
    description: 'Email proposal to Meera Choudhury at Company B', 
    relatedTo: 'Customer',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
  },
  { 
    title: 'Meeting with Amit Patel', 
    description: 'Discuss implementation timeline with Retail Ventures', 
    relatedTo: 'Lead',
    priority: 'High',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days from now
  },
  { 
    title: 'Follow up with Company C', 
    description: 'Check if Karan Bajaj received our contract', 
    relatedTo: 'Customer',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
  },
  { 
    title: 'Qualify Neha Gupta lead', 
    description: 'Determine if Education First is a good fit', 
    relatedTo: 'Lead',
    priority: 'Low',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) // 4 days from now
  }
];

const seedDatabase = async () => {
  try {
    console.log('Step 1: Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crm');
    console.log('✅ Connected to MongoDB');

    console.log('Step 2: Clearing existing data...');
    await User.deleteMany({});
    await Lead.deleteMany({});
    await Customer.deleteMany({});
    await Task.deleteMany({});
    console.log('✅ Cleared all existing data');

    console.log('Step 3: Creating users...');
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.email}`);
    }

    const adminUser = createdUsers.find(u => u.role === 'admin');
    const agentUsers = createdUsers.filter(u => u.role === 'agent');

    console.log('Step 4: Creating leads...');
    const leadsWithAgents = sampleLeads.map((lead, idx) => ({
      ...lead,
      assignedAgent: agentUsers[idx % agentUsers.length]._id,
      source: lead.source || ['Website', 'Referral', 'Social Media', 'Email Campaign'][idx % 4],
      phone: lead.phone || `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`
    }));
    
    const createdLeads = await Lead.create(leadsWithAgents);
    console.log(`✅ Created ${createdLeads.length} leads`);

    console.log('Step 5: Creating customers...');

    // Only assign agents if there are agent users available
    const shouldAssignAgent = agentUsers && agentUsers.length > 0;

    const customersWithAssignments = sampleCustomers.map((customer, idx) => ({
    ...customer,
    owner: shouldAssignAgent ? agentUsers[idx % agentUsers.length]._id : null,
    agentId: shouldAssignAgent ? agentUsers[idx % agentUsers.length]._id : null,
    tags: customer.tags || ['New', 'Priority', 'Enterprise'][idx % 3],
    status: customer.status || 'Active',
    phone: customer.phone || `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`
  }));
    
    const createdCustomers = await Customer.create(customersWithAssignments);
    console.log(`✅ Created ${createdCustomers.length} customers`);

    console.log('Step 6: Creating tasks...');
    const tasksWithAssignments = sampleTasks.map((task, idx) => {
      const relatedId = task.relatedTo === 'Lead'
        ? createdLeads[idx % createdLeads.length]._id
        : createdCustomers[idx % createdCustomers.length]._id;

      return {
        ...task,
        assignedTo: agentUsers[idx % agentUsers.length]._id,
        owner: agentUsers[idx % agentUsers.length]._id,
        createdBy: adminUser._id,
        dueDate: task.dueDate || new Date(Date.now() + (idx + 1) * 24 * 60 * 60 * 1000),
        priority: task.priority || ['Low', 'Medium', 'High'][idx % 3],
        status: ['Open', 'In Progress', 'Done'][idx % 3],
        relatedId,
        relatedModel: task.relatedTo
      };
    });
    
    const createdTasks = await Task.create(tasksWithAssignments);
    console.log(`✅ Created ${createdTasks.length} tasks`);

    console.log('✅ Database seeded successfully!');
    console.log('Admin: admin@crm.com / admin123');
    console.log('Agent 1: vanshmahajan@crm.com / agent123');
    console.log('Agent 2: mannatgupta@crm.com / agent123');
    console.log(`Created ${createdLeads.length} leads with complete data`);
    console.log(`Created ${createdCustomers.length} customers with complete data`);
    console.log(`Created ${createdTasks.length} tasks`);

    // Show assignment details
    console.log('\nTask assignments:');
    createdTasks.forEach((task, idx) => {
      const agent = agentUsers[idx % agentUsers.length];
      console.log(`- "${task.title}" → ${agent.name} (${agent.email})`);
    });

    console.log('\nCustomer assignments:');
    createdCustomers.forEach((customer, idx) => {
      const agent = agentUsers[idx % agentUsers.length];
      console.log(`- ${customer.name} (${customer.company}) → ${agent.name}`);
    });

    console.log('\nLead assignments:');
    createdLeads.forEach((lead, idx) => {
      const agent = agentUsers[idx % agentUsers.length];
      console.log(`- ${lead.name} (${lead.company}) → ${agent.name}`);
    });

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

seedDatabase();
export default seedDatabase;