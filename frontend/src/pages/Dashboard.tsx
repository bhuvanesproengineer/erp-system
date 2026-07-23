import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { Table, Column } from '../components/common/Table';
import { Badge } from '../components/common/Badge';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { challanService } from '../services/challanService';
import { Product } from '../types/product';
import { SalesChallan } from '../types/challan';
import { Users, Package, AlertTriangle, FileText, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalChallans: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentChallans, setRecentChallans] = useState<SalesChallan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [customersRes, productsRes, lowStockRes, challansRes] = await Promise.allSettled([
        customerService.getAll({ limit: 1 }),
        productService.getAll({ limit: 1 }),
        productService.getLowStock(),
        challanService.getAll({ limit: 5 }),
      ]);

      let cCount = 0;
      if (customersRes.status === 'fulfilled') {
        cCount = customersRes.value.pagination?.total || customersRes.value.data?.length || 0;
      }

      let pCount = 0;
      if (productsRes.status === 'fulfilled') {
        pCount = productsRes.value.pagination?.total || productsRes.value.data?.length || 0;
      }

      let lsList: Product[] = [];
      if (lowStockRes.status === 'fulfilled') {
        lsList = lowStockRes.value.data || [];
      }

      let chList: SalesChallan[] = [];
      let chCount = 0;
      if (challansRes.status === 'fulfilled') {
        chList = challansRes.value.data || [];
        chCount = challansRes.value.pagination?.total || chList.length;
      }

      setStats({
        totalCustomers: cCount,
        totalProducts: pCount,
        lowStockCount: lsList.length,
        totalChallans: chCount,
      });

      setLowStockProducts(lsList.slice(0, 5));
      setRecentChallans(chList.slice(0, 5));
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const productColumns: Column<Product>[] = [
    { header: 'Product Name', accessor: 'productName' },
    { header: 'SKU', accessor: 'sku' },
    {
      header: 'Current Stock',
      render: (row) => (
        <span className="text-danger font-semibold">{row.currentStock}</span>
      ),
    },
    { header: 'Min Alert Qty', accessor: 'minimumStockAlertQuantity' },
    { header: 'Location', accessor: 'warehouseLocation' },
  ];

  const challanColumns: Column<SalesChallan>[] = [
    { header: 'Challan #', accessor: 'challanNumber' },
    { header: 'Customer', accessor: 'customerName' },
    { header: 'Total Qty', accessor: 'totalQuantity' },
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
      header: 'Date',
      render: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'),
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time overview of ERP operations & inventory status</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<Users size={24} />}
          color="primary"
          subtext="Active CRM Records"
        />
        <StatCard
          title="Catalog Products"
          value={stats.totalProducts}
          icon={<Package size={24} />}
          color="success"
          subtext="Total Managed SKUs"
        />
        <StatCard
          title="Low Stock Alerts"
          value={stats.lowStockCount}
          icon={<AlertTriangle size={24} />}
          color="warning"
          subtext="Requires Replenishment"
        />
        <StatCard
          title="Sales Challans"
          value={stats.totalChallans}
          icon={<FileText size={24} />}
          color="danger"
          subtext="Total Orders Logged"
        />
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Low Stock Widget */}
        <div className="card">
          <div className="card-header space-between">
            <h3 className="card-title text-warning space-gap">
              <AlertTriangle size={20} /> Low Stock Warnings
            </h3>
            <Link to="/inventory" className="btn-link space-gap">
              Manage Inventory <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="card-body p-0">
            <Table
              columns={productColumns}
              data={lowStockProducts}
              isLoading={isLoading}
              emptyTitle="No Low Stock Alerts"
              emptyDescription="All products are currently above their minimum stock thresholds."
              keyExtractor={(row) => row.id}
            />
          </div>
        </div>

        {/* Recent Challans Widget */}
        <div className="card">
          <div className="card-header space-between">
            <h3 className="card-title text-primary space-gap">
              <FileText size={20} /> Recent Sales Challans
            </h3>
            <Link to="/challans" className="btn-link space-gap">
              View All <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="card-body p-0">
            <Table
              columns={challanColumns}
              data={recentChallans}
              isLoading={isLoading}
              emptyTitle="No Challans Generated"
              emptyDescription="Create your first sales challan from the Sales Challans menu."
              keyExtractor={(row) => row.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
