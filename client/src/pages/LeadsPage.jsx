import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Mail,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Archive,
  Sparkles,
  X,
  Loader
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
    'New': 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    'Closed Won': 'bg-green-100 text-green-800',
    'Closed Lost': 'bg-red-100 text-red-800'
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
      {status}
    </span>
  );
};

// Lead Modal Component
const LeadModal = ({ showModal, editingLead, onClose, onSubmit, register, errors, reset }) => {
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
              {editingLead ? 'Edit Lead' : 'Add New Lead'}
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
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                {...register('status')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="New">New</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed Won">Closed Won</option>
                <option value="Closed Lost">Closed Lost</option>
              </select>
            </div>

            <div>
              <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                Source
              </label>
              <input
                type="text"
                id="source"
                {...register('source')}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Website, Referral, Social Media, etc."
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
                {editingLead ? 'Update' : 'Create'} Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Convert Modal Component
const ConvertModal = ({ showConvertModal, selectedLead, onClose, onConvert }) => {
  if (!showConvertModal || !selectedLead) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center pb-3 border-b">
            <h3 className="text-lg font-medium text-gray-900">
              Convert Lead to Customer
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to convert <strong>{selectedLead.name}</strong> to a customer?
              This will archive the lead and create a new customer record.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Note</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>This action cannot be undone. The lead will be moved to the customers section.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={onConvert}
              className="inline-flex justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Convert to Customer
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

const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeads, setTotalLeads] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const { user } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const debouncedSearchTerm = useDebounce(searchTerm, 150000);

  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/leads', {
        params: {
          page: currentPage,
          limit: 10,
          search: debouncedSearchTerm,
          status: statusFilter !== 'All' ? statusFilter : undefined,
          sortBy: sortField,
          sortOrder: sortOrder
        }
      });
      setLeads(response.data.leads);
      setTotalPages(response.data.totalPages);
      setTotalLeads(response.data.totalLeads);
    } catch (error) {
      toast.error('Failed to fetch leads');
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, sortField, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      fetchLeads();
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingLead) {
        await api.patch(`/leads/${editingLead._id}`, data);
        toast.success('Lead updated successfully');
      } else {
        await api.post('/leads', data);
        toast.success('Lead created successfully');
      }
      setShowModal(false);
      setEditingLead(null);
      reset();
      fetchLeads();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save lead');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this lead?')) return;
    
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead archived successfully');
      fetchLeads();
    } catch (error) {
      toast.error('Failed to archive lead');
    }
  };

  const handleConvert = async () => {
    if (!selectedLead) return;
    
    try {
      await api.post(`/leads/${selectedLead._id}/convert`);
      toast.success('Lead converted to customer successfully');
      setShowConvertModal(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      toast.error('Failed to convert lead');
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    reset({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source
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
    setEditingLead(null);
    reset();
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
          <h1 className="text-2xl font-semibold text-gray-900">Leads</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your sales leads and track their progress through the pipeline.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Lead
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
              placeholder="Search leads by name, email, phone, or source..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleSearchSubmit}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCurrentPage(1);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
            
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Filter className="h-5 w-5 mr-1" />
              More Filters
            </button>
          </div>
        </div>

        {debouncedSearchTerm && (
          <div className="mb-4 flex items-center text-sm text-gray-600">
            <span>Showing results for "{debouncedSearchTerm}"</span>
            <button
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="ml-2 text-indigo-600 hover:text-indigo-800"
            >
              Clear search
            </button>
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
                        Lead
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
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Source
                    </th>
                    <th 
                      scope="col" 
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center">
                        Status
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      </div>
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Assigned To
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{lead.name}</div>
                            <div className="text-gray-500">Added {new Date(lead.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1 text-gray-400" />
                          {lead.email}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {lead.phone ? (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1 text-gray-400" />
                            {lead.phone}
                          </div>
                        ) : (
                          <span className="text-gray-300">Not provided</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {lead.source || <span className="text-gray-300">Unknown</span>}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <StatusBadge status={lead.status} />
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {lead.assignedAgent?.name || 'Unassigned'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setShowConvertModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Convert to Customer"
                            disabled={lead.status === 'Closed Won' || lead.status === 'Closed Lost'}
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(lead)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit Lead"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(lead._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Archive Lead"
                          >
                            <Archive className="h-4 w-4" />
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
                totalItems={totalLeads}
                itemsPerPage={10}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </div>
      </div>

      <LeadModal
        showModal={showModal}
        editingLead={editingLead}
        onClose={closeModal}
        onSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        reset={reset}
      />

      <ConvertModal
        showConvertModal={showConvertModal}
        selectedLead={selectedLead}
        onClose={() => setShowConvertModal(false)}
        onConvert={handleConvert}
      />
    </div>
  );
};

export default LeadsPage;