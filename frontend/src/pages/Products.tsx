import React, { useState, useEffect } from 'react';
import { Table, Column } from '../components/common/Table';
import { Pagination } from '../components/common/Pagination';
import { SearchBar } from '../components/common/SearchBar';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useToast } from '../context/ToastContext';
import { productService } from '../services/productService';
import { Product } from '../types/product';
import { Plus, Edit2, Trash2, AlertTriangle, Package } from 'lucide-react';

export const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStockAlertQuantity: 5,
    warehouseLocation: '',
  });

  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, [currentPage, search, categoryFilter, lowStockOnly]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      if (lowStockOnly) {
        const res = await productService.getLowStock();
        setProducts(res.data || []);
        setTotalPages(1);
        setTotalItems(res.data?.length || 0);
      } else {
        const res = await productService.getAll({
          page: currentPage,
          limit: 10,
          search,
          category: categoryFilter || undefined,
        });
        setProducts(res.data || []);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
          setTotalItems(res.pagination.total || 0);
        }
      }
    } catch (error: any) {
      showToast('Failed to fetch products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedProduct(null);
    setFormData({
      productName: '',
      sku: '',
      category: '',
      unitPrice: 0,
      currentStock: 0,
      minimumStockAlertQuantity: 5,
      warehouseLocation: '',
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setSelectedProduct(prod);
    setFormData({
      productName: prod.productName,
      sku: prod.sku,
      category: prod.category,
      unitPrice: prod.unitPrice,
      currentStock: prod.currentStock,
      minimumStockAlertQuantity: prod.minimumStockAlertQuantity,
      warehouseLocation: prod.warehouseLocation,
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productName || !formData.sku || !formData.category || !formData.warehouseLocation) {
      showToast('Please complete all required fields', 'warning');
      return;
    }
    if (formData.unitPrice <= 0) {
      showToast('Unit price must be greater than 0', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      if (selectedProduct) {
        await productService.update(selectedProduct.id, formData);
        showToast('Product updated successfully', 'success');
      } else {
        await productService.create(formData);
        showToast('Product created successfully', 'success');
      }
      setIsFormOpen(false);
      fetchProducts();
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
      await productService.delete(deleteId);
      showToast('Product deleted successfully', 'success');
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Failed to delete product';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product Info',
      render: (row) => (
        <div>
          <span className="font-semibold">{row.productName}</span>
          <div className="text-muted text-xs">SKU: {row.sku}</div>
        </div>
      ),
    },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Unit Price',
      render: (row) => `$${Number(row.unitPrice).toFixed(2)}`,
    },
    {
      header: 'Stock Status',
      render: (row) => {
        const isLow = row.currentStock <= row.minimumStockAlertQuantity;
        return (
          <div className="flex-center-gap">
            <span className={isLow ? 'text-danger font-bold' : ''}>{row.currentStock}</span>
            {isLow && (
              <Badge variant="warning">
                <AlertTriangle size={12} /> Low Alert
              </Badge>
            )}
          </div>
        );
      },
    },
    { header: 'Location', accessor: 'warehouseLocation' },
    {
      header: 'Actions',
      render: (row) => (
        <div className="actions-cell">
          <button className="btn-icon" onClick={() => handleOpenEdit(row)} title="Edit Product">
            <Edit2 size={16} />
          </button>
          <button
            className="btn-icon text-danger"
            onClick={() => {
              setDeleteId(row.id);
              setIsDeleteOpen(true);
            }}
            title="Delete Product"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="products-page">
      <div className="page-header space-between">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">Manage catalog items, pricing, SKUs, and stock alert levels</p>
        </div>
        <button className="btn btn-primary space-gap" onClick={handleOpenAdd}>
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar-card">
        <SearchBar
          placeholder="Search by Product Name, SKU, or Category..."
          value={search}
          onSearch={(val) => {
            setSearch(val);
            setCurrentPage(1);
          }}
        />
        <div className="filter-group">
          <button
            className={`btn ${lowStockOnly ? 'btn-warning' : 'btn-outline'}`}
            onClick={() => setLowStockOnly(!lowStockOnly)}
          >
            <AlertTriangle size={16} />
            <span>Low Stock Alerts</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card mt-4">
        <Table
          columns={columns}
          data={products}
          isLoading={isLoading}
          emptyTitle="No Products Found"
          emptyDescription="Add items to your catalog to manage product inventory."
          keyExtractor={(row) => row.id}
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedProduct ? 'Edit Product' : 'Add New Catalog Product'}
        size="lg"
      >
        <form onSubmit={handleFormSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Product Name *</label>
              <input
                type="text"
                className="form-input"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">SKU (Unique) *</label>
              <input
                type="text"
                className="form-input"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Electronics, Machinery"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                className="form-input"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Current Stock *</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Stock Alert Qty *</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={formData.minimumStockAlertQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, minimumStockAlertQuantity: parseInt(e.target.value, 10) || 0 })
                }
                required
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">Warehouse Location *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Shelf A-10"
                value={formData.warehouseLocation}
                onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message="Are you sure you want to delete this catalog product?"
        isLoading={isSubmitting}
      />
    </div>
  );
};
