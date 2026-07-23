import React, { useState, useEffect } from 'react';
import { Table, Column } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { SearchBar } from '../components/common/SearchBar';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { challanService } from '../services/challanService';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { SalesChallan, ChallanStatus } from '../types/challan';
import { Customer } from '../types/customer';
import { Product } from '../types/product';
import { Plus, Eye, CheckCircle, XCircle, Trash2, Printer, FileText } from 'lucide-react';

export const Challans: React.FC = () => {
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Dropdown options
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const [selectedChallan, setSelectedChallan] = useState<SalesChallan | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Line Items Form
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [status, setStatus] = useState<'Draft' | 'Confirmed'>('Draft');
  const [lineItems, setLineItems] = useState<{ productId: number; quantity: number }[]>([
    { productId: 0, quantity: 1 },
  ]);

  const { showToast } = useToast();

  useEffect(() => {
    fetchChallans(currentPage, search, statusFilter);
    fetchDropdownData();
  }, [currentPage, search, statusFilter]);

  const fetchChallans = async (page: number, searchKeyword: string, status: string) => {
    try {
      setIsLoading(true);
      const res = await challanService.getAll({
        page,
        limit: 10,
        search: searchKeyword,
        status: status || undefined,
      });
      setChallans(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.totalPages || 1);
        setTotalItems(res.pagination.total || 0);
      }
    } catch (error: any) {
      showToast('Failed to fetch sales challans', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [cRes, pRes] = await Promise.all([
        customerService.getAll({ limit: 100 }),
        productService.getAll({ limit: 100 }),
      ]);
      setCustomers(cRes.data || []);
      setProductsList(pRes.data || []);
    } catch (error) {
      console.error('Dropdown fetch error:', error);
    }
  };

  const handleOpenAdd = () => {
    setCustomerId(customers.length > 0 ? customers[0].id : '');
    setStatus('Draft');
    setLineItems([{ productId: productsList.length > 0 ? productsList[0].id : 0, quantity: 1 }]);
    setIsFormOpen(true);
  };

  const handleAddLineItem = () => {
    const defaultProdId = productsList.length > 0 ? productsList[0].id : 0;
    setLineItems([...lineItems, { productId: defaultProdId, quantity: 1 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length === 1) {
      showToast('Challan must contain at least one product item', 'warning');
      return;
    }
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: 'productId' | 'quantity', val: number) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: val };
    setLineItems(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      showToast('Please select a customer', 'warning');
      return;
    }
    if (lineItems.some((item) => !item.productId || item.quantity <= 0)) {
      showToast('Please select valid products with quantity > 0', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      await challanService.create({
        customerId: Number(customerId),
        status,
        products: lineItems.map((i) => ({ productId: Number(i.productId), quantity: Number(i.quantity) })),
      });
      showToast('Sales Challan created successfully', 'success');
      setIsFormOpen(false);
      fetchChallans(currentPage, search, statusFilter);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to create sales challan';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDetails = async (id: number) => {
    try {
      setIsLoading(true);
      const res = await challanService.getById(id);
      setSelectedChallan(res.data);
      setIsDetailOpen(true);
    } catch (error: any) {
      showToast('Failed to fetch challan details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmExecute = async () => {
    if (!actionId) return;
    try {
      setIsSubmitting(true);
      await challanService.confirm(actionId);
      showToast('Challan confirmed successfully & stock deducted', 'success');
      setIsConfirmOpen(false);
      fetchChallans(currentPage, search, statusFilter);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Confirmation failed';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelExecute = async () => {
    if (!actionId) return;
    try {
      setIsSubmitting(true);
      await challanService.cancel(actionId);
      showToast('Challan cancelled successfully & stock restored', 'success');
      setIsCancelOpen(false);
      fetchChallans(currentPage, search, statusFilter);
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Cancellation failed';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<SalesChallan>[] = [
    { header: 'Challan #', accessor: 'challanNumber' },
    { header: 'Customer Name', accessor: 'customerName' },
    { header: 'Total Quantity', accessor: 'totalQuantity' },
    {
      header: 'Total Amount',
      render: (row) => `$${Number(row.totalAmount || 0).toFixed(2)}`,
    },
    {
      header: 'Status',
      render: (row) => {
        const variant =
          row.status === 'Confirmed'
            ? 'success'
            : row.status === 'Draft'
            ? 'warning'
            : 'danger';
        return <Badge variant={variant}>{row.status}</Badge>;
      },
    },
    {
      header: 'Created Date',
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="actions-cell">
          <button className="btn-icon" onClick={() => handleOpenDetails(row.id)} title="View Challan">
            <Eye size={16} />
          </button>
          {row.status === 'Draft' && (
            <button
              className="btn-icon text-success"
              onClick={() => {
                setActionId(row.id);
                setIsConfirmOpen(true);
              }}
              title="Confirm Challan"
            >
              <CheckCircle size={16} />
            </button>
          )}
          {row.status !== 'Cancelled' && (
            <button
              className="btn-icon text-danger"
              onClick={() => {
                setActionId(row.id);
                setIsCancelOpen(true);
              }}
              title="Cancel Challan"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="challans-page">
      <div className="page-header space-between">
        <div>
          <h1 className="page-title">Sales Challans</h1>
          <p className="page-subtitle">Generate dispatch challans, manage stock commitments, and track orders</p>
        </div>
        <button className="btn btn-primary space-gap" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Create Challan</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar-card">
        <SearchBar
          placeholder="Search by Challan # or Customer Name..."
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
            <option value="Draft">Draft</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card mt-4">
        <Table
          columns={columns}
          data={challans}
          isLoading={isLoading}
          emptyTitle="No Sales Challans"
          emptyDescription="Create a new dispatch challan to start tracking orders."
          keyExtractor={(row) => row.id}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Create Sales Challan Drawer Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title="Create New Sales Challan"
        size="xl"
      >
        <form onSubmit={handleFormSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Select Customer *</label>
              <select
                className="form-select"
                value={customerId}
                onChange={(e) => setCustomerId(Number(e.target.value))}
                required
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customerName} ({c.businessName})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Initial Order Status *</label>
              <select
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Draft' | 'Confirmed')}
              >
                <option value="Draft">Save as Draft (No stock deduction)</option>
                <option value="Confirmed">Confirm Order (Deduct stock immediately)</option>
              </select>
            </div>
          </div>

          <hr className="divider my-4" />

          {/* Line Items Builder */}
          <div className="line-items-builder">
            <div className="space-between mb-2">
              <h3>Line Items & Product Selector</h3>
              <button type="button" className="btn btn-sm btn-secondary" onClick={handleAddLineItem}>
                <Plus size={14} /> Add Product Item
              </button>
            </div>

            {lineItems.map((item, idx) => (
              <div key={idx} className="line-item-row">
                <div className="form-group flex-2">
                  <label className="form-label text-xs">Product Item</label>
                  <select
                    className="form-select"
                    value={item.productId}
                    onChange={(e) => handleLineItemChange(idx, 'productId', Number(e.target.value))}
                  >
                    {productsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.productName} (SKU: {p.sku}) — Stock: {p.currentStock}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label className="form-label text-xs">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={item.quantity}
                    onChange={(e) =>
                      handleLineItemChange(idx, 'quantity', parseInt(e.target.value, 10) || 1)
                    }
                  />
                </div>
                <div className="form-group flex-initial flex-end">
                  <button
                    type="button"
                    className="btn-icon text-danger"
                    onClick={() => handleRemoveLineItem(idx)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-actions mt-4">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Challan...' : 'Generate Sales Challan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detailed Printable View Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Sales Delivery Challan Document"
        size="lg"
      >
        {selectedChallan && (
          <div className="printable-challan-view">
            <div className="challan-doc-header space-between">
              <div>
                <h2>MINIERP DISPATCH CHALLAN</h2>
                <div className="text-muted text-sm">Official Delivery & Dispatch Note</div>
              </div>
              <div className="text-right">
                <h3 className="text-primary">{selectedChallan.challanNumber}</h3>
                <Badge
                  variant={
                    selectedChallan.status === 'Confirmed'
                      ? 'success'
                      : selectedChallan.status === 'Draft'
                      ? 'warning'
                      : 'danger'
                  }
                >
                  {selectedChallan.status}
                </Badge>
              </div>
            </div>

            <div className="challan-doc-info grid-2 mt-4">
              <div>
                <strong>Customer:</strong> {selectedChallan.customerName || 'N/A'}
              </div>
              <div>
                <strong>Date:</strong>{' '}
                {selectedChallan.createdAt
                  ? new Date(selectedChallan.createdAt).toLocaleString()
                  : 'N/A'}
              </div>
              <div>
                <strong>Generated By:</strong> {selectedChallan.createdBy}
              </div>
              <div>
                <strong>Total Dispatch Qty:</strong> {selectedChallan.totalQuantity} items
              </div>
            </div>

            <h4 className="mt-4 mb-2">Order Line Items</h4>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Name</th>
                    <th>Unit Price</th>
                    <th>Qty</th>
                    <th>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedChallan.items && selectedChallan.items.length > 0 ? (
                    selectedChallan.items.map((item, i) => (
                      <tr key={i}>
                        <td>{item.sku}</td>
                        <td>{item.productName}</td>
                        <td>${Number(item.unitPrice || 0).toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>${Number(item.lineTotal || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center text-muted">
                        No line items detailed
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="modal-actions space-between mt-4">
              <button className="btn btn-outline" onClick={() => window.print()}>
                <Printer size={16} /> Print Document
              </button>
              <button className="btn btn-secondary" onClick={() => setIsDetailOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmExecute}
        title="Confirm Sales Challan"
        message="Are you sure you want to confirm this sales challan? Confirming will validate stock levels and deduct inventory atomically."
        confirmText="Confirm & Deduct Stock"
        variant="primary"
        isLoading={isSubmitting}
      />

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={handleCancelExecute}
        title="Cancel Sales Challan"
        message="Are you sure you want to cancel this challan? If previously confirmed, inventory stock will be restored atomically."
        confirmText="Cancel Order & Restore Stock"
        variant="danger"
        isLoading={isSubmitting}
      />
    </div>
  );
};
