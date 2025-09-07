import { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  CheckSquare,
  TrendingUp,
  AlertCircle,
  Calendar,
  ArrowUp,
  ArrowDown,
  Search,
  Bell,
  BarChart3,
  PieChart as PieChartIcon,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../api';
import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const { user } = useAuthStore();
  
  // State for modals
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // Form states
  const [leadForm, setLeadForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'Website'
  });
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: ''
  });
  
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    assignedTo: ''
  });
  
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '30',
    attendees: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      toast.error('Please login to access dashboard');
      setLoading(false);
      return;
    }
    
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard', {
        params: { range: timeRange }
      });

      console.log('API Response:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for form submissions
  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leads', leadForm);
      toast.success('Lead added successfully!');
      setShowLeadModal(false);
      setLeadForm({ name: '', email: '', phone: '', company: '', source: 'Website' });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error adding lead:', error);
      toast.error('Failed to add lead');
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      await api.post('/customers', customerForm);
      toast.success('Customer added successfully!');
      setShowCustomerModal(false);
      setCustomerForm({ name: '', email: '', phone: '', company: '', address: '' });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', taskForm);
      toast.success('Task created successfully!');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'Medium', assignedTo: '' });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      const scheduleData = {
        ...scheduleForm,
        datetime: new Date(`${scheduleForm.date}T${scheduleForm.time}`).toISOString()
      };
      
      await api.post('/events', scheduleData);
      toast.success('Event scheduled successfully!');
      setShowScheduleModal(false);
      setScheduleForm({ title: '', description: '', date: '', time: '', duration: '30', attendees: '' });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error scheduling event:', error);
      toast.error('Failed to schedule event');
    }
  };

  // Modal component
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6 transition-transform hover:scale-105">
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          <h2 className="text-gray-600 text-sm">{title}</h2>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          <span className={`flex items-center text-sm font-semibold ${
            changeType === 'increase' ? 'text-green-600' : 'text-red-600'
          }`}>
            {changeType === 'increase' ? 
              <ArrowUp className="h-4 w-4 mr-1" /> : 
              <ArrowDown className="h-4 w-4 mr-1" />
            }
            {change}
          </span>
          {subtitle && (
            <span className="text-gray-500 text-sm ml-2">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );

  const TaskItem = ({ task }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
      <div className="flex items-center">
        <div className={`p-2 rounded-full ${
          task.priority === 'High' ? 'bg-red-100 text-red-600' :
          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          <CheckSquare className="h-4 w-4" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900">{task.title}</p>
          <p className="text-xs text-gray-500">
            Due {new Date(task.dueDate).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className={`px-2 py-1 text-xs font-medium rounded-full ${
        task.status === 'Done' ? 'bg-green-100 text-green-800' :
        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {task.status}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
        <p className="mt-1 text-sm text-gray-500">Unable to load dashboard data.</p>
      </div>
    );
  }

  const { stats, charts, recent, overview } = dashboardData;
  const recentTasks = recent?.tasks || [];
  const activityLog = recent?.activity || [];
  const leadStatusData = charts?.leadStatus || [];
  const leadsBySourceData = stats?.leadsBySource || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const STATUS_COLORS = {
    'New': '#3B82F6',
    'In Progress': '#F59E0B',
    'Closed Won': '#10B981',
    'Closed Lost': '#EF4444'
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="flex justify-between items-center px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="relative">
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Time Range Selector */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Performance Overview</h2>
            <p className="text-sm text-gray-600">Key metrics and analytics</p>
          </div>
          <div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="quarter">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Leads"
            value={stats?.totalLeads || 0}
            icon={Users}
            change="+12%"
            changeType="increase"
            subtitle="From last week"
          />
          <StatCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            icon={Briefcase}
            change="+8%"
            changeType="increase"
            subtitle="From last week"
          />
          <StatCard
            title="Open Tasks"
            value={stats?.openTasks || 0}
            icon={CheckSquare}
            change="+3"
            changeType="increase"
            subtitle="Needs attention"
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats?.conversionRate || 0}%`}
            icon={TrendingUp}
            change="+2%"
            changeType="increase"
            subtitle="Leads to customers"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* Leads Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <BarChart3 className="h-5 w-5 text-gray-700 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Leads Overview</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3bedf6ff" name="Leads Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leads by Source */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <PieChartIcon className="h-5 w-5 text-gray-700 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Leads by Source</h3>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsBySourceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {leadsBySourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity & Tasks */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          {/* Recent Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Tasks</h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-800">View all</button>
            </div>
            <div className="space-y-3">
              {recentTasks.slice(0, 5).map((task) => (
                <TaskItem key={task._id} task={task} />
              ))}
            </div>
            {recentTasks.length === 0 && (
              <p className="text-center text-gray-500 py-4">No tasks found</p>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              <button className="text-sm text-indigo-600 hover:text-indigo-800">View all</button>
            </div>
            <div className="space-y-4">
              {activityLog.slice(0, 5).map((activity) => (
                <div key={activity._id} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-900">
                      {activity.action} by{' '}
                      <span className="font-medium">{activity.performedBy?.name}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.createdAt).toLocaleDateString()} at{' '}
                      {new Date(activity.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {activityLog.length === 0 && (
              <p className="text-center text-gray-500 py-4">No activity found</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <button 
              onClick={() => setShowLeadModal(true)}
              className="flex flex-col items-center justify-center p-4 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition"
            >
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Lead</span>
            </button>
            <button 
              onClick={() => setShowCustomerModal(true)}
              className="flex flex-col items-center justify-center p-4 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
            >
              <Briefcase className="h-6 w-6 mb-2" />
              <span className="text-sm">Add Customer</span>
            </button>
            <button 
              onClick={() => setShowTaskModal(true)}
              className="flex flex-col items-center justify-center p-4 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
            >
              <CheckSquare className="h-6 w-6 mb-2" />
              <span className="text-sm">Create Task</span>
            </button>
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="flex flex-col items-center justify-center p-4 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modals for Quick Actions */}
      <Modal 
        isOpen={showLeadModal} 
        onClose={() => setShowLeadModal(false)}
        title="Add New Lead"
      >
        <form onSubmit={handleAddLead}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={leadForm.name}
                onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={leadForm.email}
                onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={leadForm.phone}
                onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                value={leadForm.company}
                onChange={(e) => setLeadForm({...leadForm, company: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Source</label>
              <select
                value={leadForm.source}
                onChange={(e) => setLeadForm({...leadForm, source: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="Website">Website</option>
                <option value="Referral">Referral</option>
                <option value="Social Media">Social Media</option>
                <option value="Event">Event</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowLeadModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              >
                Add Lead
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={showCustomerModal} 
        onClose={() => setShowCustomerModal(false)}
        title="Add New Customer"
      >
        <form onSubmit={handleAddCustomer}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={customerForm.name}
                onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={customerForm.email}
                onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                value={customerForm.company}
                onChange={(e) => setCustomerForm({...customerForm, company: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <textarea
                value={customerForm.address}
                onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
              >
                Add Customer
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={showTaskModal} 
        onClose={() => setShowTaskModal(false)}
        title="Create New Task"
      >
        <form onSubmit={handleCreateTask}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                value={taskForm.title}
                onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                required
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assign To</label>
              <input
                type="text"
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm({...taskForm, assignedTo: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="User email or name"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-md"
              >
                Create Task
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal 
        isOpen={showScheduleModal} 
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Event"
      >
        <form onSubmit={handleSchedule}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                required
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({...scheduleForm, title: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={scheduleForm.description}
                onChange={(e) => setScheduleForm({...scheduleForm, description: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                rows="3"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Time</label>
                <input
                  type="time"
                  required
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <select
                value={scheduleForm.duration}
                onChange={(e) => setScheduleForm({...scheduleForm, duration: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="30">30 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">120 minutes</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Attendees</label>
              <input
                type="text"
                value={scheduleForm.attendees}
                onChange={(e) => setScheduleForm({...scheduleForm, attendees: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                placeholder="Email addresses, separated by commas"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
              >
                Schedule
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;