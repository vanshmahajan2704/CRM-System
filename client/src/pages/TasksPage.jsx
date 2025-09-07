import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Flag,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  Users
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import api from '../api';
import { useAuthStore } from '../store/authStore';

// Custom hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const priorityColors = {
    'High': 'bg-red-100 text-red-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'Low': 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityColors[priority]}`}>
      <Flag className="inline h-3 w-3 mr-1" />
      {priority}
    </span>
  );
};

// Status Badge Component
const StatusBadge = ({ status, dueDate }) => {
  const isOverdue = new Date(dueDate) < new Date() && status !== 'Done';
  
  if (isOverdue) {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        <AlertCircle className="inline h-3 w-3 mr-1" />
        Overdue
      </span>
    );
  }

  const statusColors = {
    'Open': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Done': 'bg-green-100 text-green-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
      {status === 'Done' ? (
        <CheckCircle className="inline h-3 w-3 mr-1" />
      ) : (
        <Clock className="inline h-3 w-3 mr-1" />
      )}
      {status}
    </span>
  );
};

// Task Modal Component
const TaskModal = ({ showModal, editingTask, onClose, onSubmit, register, errors, reset, watch, agents, agentsLoading }) => {
  const relatedTo = watch('relatedTo');

  useEffect(() => {
    if (!showModal) {
      reset();
    }
  }, [showModal, reset]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center pb-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              {editingTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title *
              </label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Title is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                {...register('description')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date *
              </label>
              <input
                type="date"
                id="dueDate"
                {...register('dueDate', { required: 'Due date is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority"
                  {...register('priority')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="agentId" className="block text-sm font-medium text-gray-700">
                Assign to Agent
              </label>
              {agentsLoading ? (
                <div className="mt-1 flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mr-2"></div>
                  Loading agents...
                </div>
              ) : (
                <select
                  id="agentId"
                  {...register('agentId')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Select an agent</option>
                  {agents.map((agent) => (
                    <option key={agent._id} value={agent._id}>
                      {agent.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="relatedTo" className="block text-sm font-medium text-gray-700">
                  Related To
                </label>
                <select
                  id="relatedTo"
                  {...register('relatedTo')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="Lead">Lead</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>

              <div>
                <label htmlFor="relatedId" className="block text-sm font-medium text-gray-700">
                  {relatedTo === 'Lead' ? 'Lead ID' : 'Customer ID'}
                </label>
                <input
                  type="text"
                  id="relatedId"
                  {...register('relatedId')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter ID"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {editingTask ? 'Update' : 'Create'} Task
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`px-3 py-1 rounded-md ${
          currentPage === i
            ? 'bg-indigo-600 text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {i}
      </button>
    );
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {pages}
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agentsLoading, setAgentsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortField, setSortField] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const { user } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors }, watch } = useForm();
  const relatedTo = watch('relatedTo');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchAgents = useCallback(async () => {
    try {
      setAgentsLoading(true);
      const response = await api.get('/agents');
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      // Don't show error if endpoint doesn't exist yet
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch agents');
      }
    } finally {
      setAgentsLoading(false);
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks', {
        params: {
          page: currentPage,
          limit: 10,
          search: debouncedSearchTerm,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          priority: priorityFilter !== 'All' ? priorityFilter : undefined,
          sortBy: sortField,
          sortOrder: sortOrder
        }
      });
      setTasks(response.data.tasks);
      setTotalPages(response.data.totalPages);
      setTotalTasks(response.data.totalTasks || response.data.tasks.length);
    } catch (error) {
      toast.error('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, priorityFilter, sortField, sortOrder]);

  // Fetch agents on component mount
  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  // Fetch tasks whenever any filter changes
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchTasks();
    }
  };

  const onSubmit = async (data) => {
    try {
      const taskData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        priority: data.priority || 'Medium',
        status: data.status || 'Open',
        // Only include agentId if selected
        ...(data.agentId && { agentId: data.agentId })
      };

      if (editingTask) {
        await api.patch(`/tasks/${editingTask._id}`, taskData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', taskData);
        toast.success('Task created successfully');
      }
      setShowModal(false);
      setEditingTask(null);
      reset();
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/tasks/${id}`);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.split('T')[0],
      status: task.status,
      priority: task.priority,
      relatedTo: task.relatedTo,
      relatedId: task.relatedId,
      agentId: task.agentId || ''
    });
    setShowModal(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    reset();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCurrentPage(1);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your tasks and stay organized with your team.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
            disabled={loading}
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Task
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleSearchSubmit}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            
            <button 
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </button>
          </div>
        </div>

        {(debouncedSearchTerm || statusFilter !== 'All' || priorityFilter !== 'All') && (
          <div className="mb-4 flex items-center text-sm text-gray-600">
            <span>
              Showing filtered results
              {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
              {statusFilter !== 'All' && ` • Status: ${statusFilter}`}
              {priorityFilter !== 'All' && ` • Priority: ${priorityFilter}`}
            </span>
          </div>
        )}

        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      scope="col" 
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center">
                        Task
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Related To
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('dueDate')}
                    >
                      <div className="flex items-center">
                        Due Date
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Priority
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Assigned Agent
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {tasks.length > 0 ? (
                    tasks.map((task) => (
                      <tr key={task._id} className={task.status === 'Done' ? 'bg-gray-50' : ''}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{task.title}</div>
                              <div className="text-gray-500 line-clamp-1">{task.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {task.relatedTo}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <StatusBadge status={task.status} dueDate={task.dueDate} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {task.agentId ? (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1 text-gray-400" />
                              {agents.find(a => a._id === task.agentId)?.name || `Agent #${task.agentId}`}
                            </div>
                          ) : (
                            <span className="text-gray-300">Not assigned</span>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex items-center justify-end space-x-2">
                            {task.status !== 'Done' && (
                              <button
                                onClick={() => handleStatusChange(task._id, 'Done')}
                                className="text-green-600 hover:text-green-900"
                                title="Mark as Done"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(task)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Task"
                              >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(task._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <CheckCircle className="h-12 w-12 mb-2" />
                          <p className="text-lg font-medium">No tasks found</p>
                          <p className="text-sm mt-1">
                            {debouncedSearchTerm || statusFilter !== 'All' || priorityFilter !== 'All'
                              ? 'Try adjusting your filters'
                              : 'Get started by creating your first task'}
                          </p>
                          {!debouncedSearchTerm && statusFilter === 'All' && priorityFilter === 'All' && (
                            <button
                              type="button"
                              onClick={() => setShowModal(true)}
                              className="mt-4 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              <Plus className="h-5 w-5 mr-2" />
                              Add Task
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {tasks.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalTasks}
                  itemsPerPage={10}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <TaskModal
        showModal={showModal}
        editingTask={editingTask}
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        reset={reset}
        watch={watch}
        agents={agents}
        agentsLoading={agentsLoading}
      />
    </div>
  );
};

export default TasksPage;