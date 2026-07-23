import React, { useState, useEffect } from 'react';
import { Table, Column } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { SearchBar } from '../components/common/SearchBar';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { customerService } from '../services/customerService';
import { Customer, CustomerType, CustomerStatus, CustomerDetailsResponse } from '../types/customer';
import { Plus, Eye, Edit2, Trash2, Phone, Mail, Building, MapPin, Calendar, MessageSquare } from 'lucide-react';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetailsResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'Retail' as CustomerType,
    address: '',
    status: 'Lead' as CustomerStatus,
    followUpDate: '',
    notes: '',
  });

  // Follow-up Note Form
  const [followupNote, setFollowupNote] = useState('');
  const [followupDate, setFollowupDate] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    fetchCustomers(currentPage, search, statusFilter);
  }, [currentPage, search, statusFilter]);

  const fetchCustomers = async (page: number, searchKeyword: string, status: string) => {
    try {
      setIsLoading(true);
      const res = await customerService.getAll({
        page,
        limit: 10,
        search: searchKeyword,
        status: status || undefined,
      });

      setCustomers(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalItems(res.pagination.total || 0);
      }
    } catch (error: any) {
      showToast('Failed to load customers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedCustomer(null);
    setFormData({
      customerName: '',
      mobileNumber: '',
      email: '',
      businessName: '',
      gstNumber: '',
      customerType: 'Retail',
      address: '',
      status: 'Lead',
      followUpDate: '',
      notes: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      customerName: customer.customerName,
      mobileNumber: customer.mobileNumber,
      email: customer.email,
      businessName: customer.businessName,
      gstNumber: customer.gstNumber || '',
      customerType: customer.customerType,
      address: customer.address,
      status: customer.status,
      followUpDate: customer.followUpDate ? customer.followUpDate.substring(0, 10) : '',
      notes: customer.notes || '',
    });
    setIsFormOpen(true);
  };

  const handleOpenDetails = async (id: number) => {
    try {
      setIsLoading(true);
      const res = await customerService.getDetails(id);
      setCustomerDetails(res.data);
      setIsDetailOpen(true);
    } catch (error: any) {
      showToast('Failed to fetch customer details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName || !formData.mobileNumber || !formData.email || !formData.businessName || !formData.address) {
      showToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedCustomer) {
        await customerService.update(selectedCustomer.id, formData);
        showToast('Customer updated successfully', 'success');
      } else {
        await customerService.create(formData);
        showToast('Customer created successfully', 'success');
      }
      setIsFormOpen(false);
      fetchCustomers(currentPage, search, statusFilter);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Operation failed';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      setIsSubmitting(true);
      await customerService.delete(deleteId);
      showToast('Customer deleted successfully', 'success');
      setIsDeleteOpen(false);
      fetchCustomers(currentPage, search, statusFilter);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to delete customer';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddFollowupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerDetails || !followupNote.trim()) {
      showToast('Follow-up note cannot be empty', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      await customerService.addFollowup(customerDetails.id, {
        note: followupNote.trim(),
        followUpDate: followupDate || undefined,
      });
      showToast('Follow-up note added successfully', 'success');
      setFollowupNote('');
      setFollowupDate('');
      handleOpenDetails(customerDetails.id); // Refresh details
    } catch (error: any) {
      showToast('Failed to add follow-up note', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Customer>[] = [
    {
      header: 'Customer Name',
      render: (row) => (
        <div>
          <span className="font-semibold">{row.customerName}</span>
          <div className="text-muted text-xs">{row.email}</div>
        </div>
      ),
    },
    { header: 'Business Name', accessor: 'businessName' },
    { header: 'Mobile', accessor: 'mobileNumber' },
    { header: 'Type', accessor: 'customerType' },
    {
      header: 'Status',
      render: (row) => {
        const variant =
          row.status === 'Active' ? 'success' : row.status === 'Lead' ? 'info' : 'secondary';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="actions-cell">
          <button className="btn-icon" onClick={() => handleOpenDetails(row.id)} title="View Details">
            <Eye size={16} />
          </button>
          <button className="btn-icon" onClick={() => handleOpenEdit(row)} title="Edit Customer">
            <Edit2 size={16} />
          </button>
          <button
            className="btn-icon text-danger"
            onClick={() => {
              setDeleteId(row.id);
              setIsDeleteOpen(true);
            }}
            title="Delete Customer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="customers-page">
      <div className="page-header space-between">
        <div>
          <h1 className="page-title">Customer CRM</h1>
          <p className="page-subtitle">Manage leads, active clients, and follow-up notes</p>
        </div>
        <button className="btn btn-primary space-gap" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar-card">
        <SearchBar
          placeholder="Search by Name, Mobile, or Business..."
          value={search}
          onSearch={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
        />
        <div className="filter-group">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="Lead">Lead</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="card mt-4">
        <Table
          columns={columns}
          data={customers}
          isLoading={isLoading}
          emptyTitle="No Customers Found"
          emptyDescription="Add customer records to begin managing leads and clients."
          keyExtractor={(row) => row.id}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedCustomer ? 'Edit Customer Details' : 'Add New Customer'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Customer Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Business Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number *</label>
              <input
                type="text"
                className="form-input"
                value={formData.mobileNumber}
                onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">GST Number (Optional)</label>
              <input
                type="text"
                className="form-input"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Customer Type</label>
              <select
                className="form-select"
                value={formData.customerType}
                onChange={(e) => setFormData({ ...formData, customerType: e.target.value as CustomerType })}
              >
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CustomerStatus })}
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Next Follow-up Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.followUpDate}
                onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Address *</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Notes</label>
              <textarea
                className="form-textarea"
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Details & Follow-ups Drawer Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Customer Complete Details"
        size="lg"
      >
        {customerDetails && (
          <div className="customer-detail-view">
            <div className="detail-header-card">
              <div>
                <h2>{customerDetails.customerName}</h2>
                <span className="text-muted">{customerDetails.businessName}</span>
              </div>
              <Badge variant={customerDetails.status === 'Active' ? 'success' : 'info'}>
                {customerDetails.status}
              </Badge>
            </div>

            <div className="detail-info-grid mt-3">
              <div className="info-item"><Phone size={16} /> <span>{customerDetails.mobileNumber}</span></div>
              <div className="info-item"><Mail size={16} /> <span>{customerDetails.email}</span></div>
              <div className="info-item"><Building size={16} /> <span>GST: {customerDetails.gstNumber || 'N/A'}</span></div>
              <div className="info-item"><MapPin size={16} /> <span>{customerDetails.address}</span></div>
            </div>

            <hr className="divider my-4" />

            {/* Followup Section */}
            <div className="followup-section">
              <h3><MessageSquare size={18} /> Follow-up Activity History</h3>

              <form onSubmit={handleAddFollowupSubmit} className="add-followup-form my-3">
                <textarea
                  className="form-textarea"
                  placeholder="Write a new follow-up note (e.g. Requested quotation)..."
                  rows={2}
                  value={followupNote}
                  onChange={(e) => setFollowupNote(e.target.value)}
                  required
                />
                <div className="followup-form-row mt-2 space-between">
                  <input
                    type="date"
                    className="form-input text-sm"
                    value={followupDate}
                    onChange={(e) => setFollowupDate(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                    Add Note
                  </button>
                </div>
              </form>

              <div className="followups-list">
                {customerDetails.followups && customerDetails.followups.length > 0 ? (
                  customerDetails.followups.map((item) => (
                    <div key={item.id} className="followup-card">
                      <p className="followup-note">{item.note}</p>
                      <div className="followup-meta">
                        <span><Calendar size={12} /> {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</span>
                        {item.followUpDate && (
                          <span className="text-warning">Next Date: {new Date(item.followUpDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted text-sm italic">No previous follow-up notes recorded.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Customer"
        message="Are you sure you want to delete this customer record? This will soft-delete the customer from active views."
        isLoading={isSubmitting}
      />
    </div>
  );
};
