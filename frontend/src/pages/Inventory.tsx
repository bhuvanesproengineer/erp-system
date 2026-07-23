import React, { useState, useEffect } from 'react';
import { Table, Column } from '../components/common/Table';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import { Product, StockMovement } from '../types/product';
import { Boxes, ArrowDownRight, ArrowUpRight, History, RefreshCw } from 'lucide-react';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Modals state
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [stockForm, setStockForm] = useState({
    quantityChanged: 1,
    movementType: 'IN' as 'IN' | 'OUT',
    reason: '',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const res = await productService.getAll({ limit: 100 });
      setProducts(res.data || []);
    } catch (error: any) {
      showToast('Failed to fetch inventory products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenStockModal = (product: Product) => {
    setSelectedProduct(product);
    setStockForm({
      quantityChanged: 1,
      movementType: 'IN',
      reason: '',
    });
    setIsStockModalOpen(true);
  };

  const handleOpenHistoryModal = async (product: Product) => {
    setSelectedProduct(product);
    try {
      setIsLoading(true);
      const res = await productService.getStockMovements(product.id);
      setMovements(res.data || []);
      setIsHistoryModalOpen(true);
    } catch (error: any) {
      showToast('Failed to load stock movements history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStockFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (stockForm.quantityChanged <= 0) {
      showToast('Quantity changed must be greater than 0', 'warning');
      return;
    }
    if (!stockForm.reason.trim()) {
      showToast('Reason is required', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      await productService.addStockMovement(selectedProduct.id, {
        quantityChanged: stockForm.quantityChanged,
        movementType: stockForm.movementType,
        reason: stockForm.reason.trim(),
      });
      showToast(`Stock updated successfully (${stockForm.movementType})`, 'success');
      setIsStockModalOpen(false);
      fetchInventory();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Stock movement failed';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product Name',
      render: (row) => (
        <div>
          <span className="font-semibold">{row.productName}</span>
          <div className="text-muted text-xs">SKU: {row.sku}</div>
        </div>
      ),
    },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Current Stock',
      render: (row) => (
        <span
          className={`font-bold ${
            row.currentStock <= row.minimumStockAlertQuantity ? 'text-danger' : 'text-success'
          }`}
        >
          {row.currentStock}
        </span>
      ),
    },
    { header: 'Warehouse Location', accessor: 'warehouseLocation' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="actions-cell">
          <button
            className="btn btn-sm btn-primary"
            onClick={() => handleOpenStockModal(row)}
            title="Adjust Stock"
          >
            <RefreshCw size={14} /> Adjust Stock
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => handleOpenHistoryModal(row)}
            title="View History"
          >
            <History size={14} /> History
          </button>
        </div>
      ),
    },
  ];

  const movementColumns: Column<StockMovement>[] = [
    {
      header: 'Type',
      render: (row) => (
        <Badge variant={row.movementType === 'IN' ? 'success' : 'danger'}>
          {row.movementType === 'IN' ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
          {row.movementType}
        </Badge>
      ),
    },
    { header: 'Qty Changed', accessor: 'quantityChanged' },
    { header: 'Reason', accessor: 'reason' },
    { header: 'Logged By', accessor: 'createdBy' },
    {
      header: 'Timestamp',
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : 'N/A'),
    },
  ];

  return (
    <div className="inventory-page">
      <div className="page-header space-between">
        <div>
          <h1 className="page-title">Inventory Management</h1>
          <p className="page-subtitle">Track stock movements, perform adjustments, and view audit trails</p>
        </div>
      </div>

      <div className="card mt-4">
        <Table
          columns={columns}
          data={products}
          isLoading={isLoading}
          emptyTitle="No Inventory Records"
          emptyDescription="Add products in the catalog to manage stock movements."
          keyExtractor={(row) => row.id}
        />
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Adjust Stock - ${selectedProduct?.productName}`}
        size="md"
      >
        <form onSubmit={handleStockFormSubmit} className="modal-form">
          <div className="form-group">
            <label className="form-label">Movement Type *</label>
            <div className="radio-group-horizontal">
              <label className="radio-label">
                <input
                  type="radio"
                  name="movementType"
                  value="IN"
                  checked={stockForm.movementType === 'IN'}
                  onChange={() => setStockForm({ ...stockForm, movementType: 'IN' })}
                />
                <span className="text-success font-semibold">IN (Increase Stock)</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="movementType"
                  value="OUT"
                  checked={stockForm.movementType === 'OUT'}
                  onChange={() => setStockForm({ ...stockForm, movementType: 'OUT' })}
                />
                <span className="text-danger font-semibold">OUT (Decrease Stock)</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity Changed *</label>
            <input
              type="number"
              min="1"
              className="form-input"
              value={stockForm.quantityChanged}
              onChange={(e) => setStockForm({ ...stockForm, quantityChanged: parseInt(e.target.value, 10) || 1 })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Reason *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Purchase, Customer Sale, Damage"
              value={stockForm.reason}
              onChange={(e) => setStockForm({ ...stockForm, reason: e.target.value })}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsStockModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Recording...' : 'Submit Movement'}
            </button>
          </div>
        </form>
      </Modal>

      {/* History Log Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Stock Movement History - ${selectedProduct?.productName}`}
        size="lg"
      >
        <Table
          columns={movementColumns}
          data={movements}
          emptyTitle="No History Recorded"
          emptyDescription="No stock movements logged for this item yet."
          keyExtractor={(row) => row.id}
        />
      </Modal>
    </div>
  );
};
