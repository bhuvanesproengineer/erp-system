export interface Product {
  id: number;
  productName: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStockAlertQuantity: number;
  warehouseLocation: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StockMovement {
  id: number;
  productId: number;
  productName?: string;
  quantityChanged: number;
  movementType: 'IN' | 'OUT';
  reason: string;
  createdBy: string;
  createdAt?: string;
}
