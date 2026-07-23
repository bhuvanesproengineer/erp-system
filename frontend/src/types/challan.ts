export type ChallanStatus = 'Draft' | 'Confirmed' | 'Cancelled';

export interface ChallanItem {
  id?: number;
  productId: number;
  productName?: string;
  sku?: string;
  unitPrice?: number;
  quantity: number;
  lineTotal?: number;
}

export interface SalesChallan {
  id: number;
  challanNumber: string;
  customerId: number;
  customerName?: string;
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  items?: ChallanItem[];
}
