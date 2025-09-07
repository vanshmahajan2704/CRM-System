import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Mail,
  Phone,
  Building,
  Tag,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
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

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusColors = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-gray-100 text-gray-800',
    Prospect: 'bg-blue-100 text-blue-800',
    'At Risk': 'bg-yellow-100 text-yellow-800',
    Churned: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

// Customer Modal Component
const CustomerModal = ({ showModal, editingCustomer, onClose, onSubmit, register, errors, reset, agents }) => {
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
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Name is required' })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                id="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                {...register('phone')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                Company
              </label>
              <input
                type="text"
                id="company"
                {...register('company')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="agentId" className="block text-sm font-medium text-gray-700">
                Assign to Agent
              </label>
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
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                id="tags"
                {...register('tags')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="tag1, tag2, tag3"
              />
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
                {editingCustomer ? 'Update' : 'Create'} Customer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Notes Modal Component
const NotesModal = ({ showNotesModal, selectedCustomer, onClose }) => {
  if (!showNotesModal || !selectedCustomer) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center pb-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Customer Notes: {selectedCustomer.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Add New Note</h4>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Type your note here..."
                  className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <button className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Add
                </button>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Notes</h4>
              <div className="space-y-3">
                {selectedCustomer.notes && selectedCustomer.notes.length > 0 ? (
                  selectedCustomer.notes.slice(0, 5).map((note, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">{note.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.createdAt).toLocaleDateString()} at {new Date(note.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Close
            </button>
          </div>
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

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedAgent, setSelectedAgent] = useState('');
  const { user } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await api.get('/agents');
      setAgents(response.data);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast.error('Failed to fetch agents');
    }
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers', {
        params: {
          page: currentPage,
          limit: 10,
          search: debouncedSearchTerm,
          sortBy: sortField,
          sortOrder: sortOrder,
          agent: selectedAgent || undefined
        }
      });
      setCustomers(response.data.customers);
      setTotalPages(response.data.totalPages);
      setTotalCustomers(response.data.totalCustomers);
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, sortField, sortOrder, selectedAgent]);

  useEffect(() => {
    fetchCustomers();
    fetchAgents();
  }, [fetchCustomers, fetchAgents]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchCustomers();
    }
  };

  const onSubmit = async (data) => {
    try {
      // Process tags from comma-separated string to array
      const processedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        // Include agentId only if it's selected
        ...(data.agentId && { agentId: data.agentId })
      };

      if (editingCustomer) {
        await api.patch(`/customers/${editingCustomer._id}`, processedData);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/customers', processedData);
        toast.success('Customer created successfully');
      }
      setShowModal(false);
      setEditingCustomer(null);
      reset();
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save customer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    reset({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      company: customer.company,
      tags: customer.tags?.join(', '),
      agentId: customer.agentId || ''
    });
    setShowModal(true);
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
    setEditingCustomer(null);
    reset();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedAgent('');
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
          <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all customers including their name, email, company, assigned agent and status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Customer
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
              placeholder="Search customers by name, email, company, or tags..."
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
          
          <div className="flex gap-2">
            <select
              value={selectedAgent}
              onChange={(e) => {
                setSelectedAgent(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <option value="">All Agents</option>
              {agents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent.name}
                </option>
              ))}
            </select>
            <button 
              onClick={clearFilters}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </button>
          </div>
        </div>

        {(debouncedSearchTerm || selectedAgent) && (
          <div className="mb-4 flex items-center text-sm text-gray-600">
            <span>
              Showing results for 
              {debouncedSearchTerm && ` "${debouncedSearchTerm}"`}
              {debouncedSearchTerm && selectedAgent && ' and '}
              {selectedAgent && ` agent: ${agents.find(a => a._id === selectedAgent)?.name || selectedAgent}`}
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
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center">
                        Name
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center">
                        Email
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Phone
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('company')}
                    >
                      <div className="flex items-center">
                        Company
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Assigned Agent
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Tags
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{customer.name}</div>
                            <div className="text-gray-500">Added {new Date(customer.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {customer.email}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {customer.phone ? (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            {customer.phone}
                          </div>
                        ) : (
                          <span className="text-gray-300">Not provided</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {customer.company ? (
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1 text-gray-400" />
                            {customer.company}
                          </div>
                        ) : (
                          <span className="text-gray-300">Not provided</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {customer.agentId ? (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {agents.find(a => a._id === customer.agentId)?.name || `Agent #${customer.agentId}`}
                          </div>
                        ) : (
                          <span className="text-gray-300">Not assigned</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {customer.tags && customer.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                          {customer.tags && customer.tags.length > 3 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{customer.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <StatusBadge status={customer.status || 'Active'} />
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowNotesModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Notes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Customer"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCustomers}
                itemsPerPage={10}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      <CustomerModal
        showModal={showModal}
        editingCustomer={editingCustomer}
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        reset={reset}
        agents={agents}
      />

      <NotesModal
        showNotesModal={showNotesModal}
        selectedCustomer={selectedCustomer}
        onClose={() => setShowNotesModal(false)}
      />
    </div>
  );
};

export default CustomersPage;