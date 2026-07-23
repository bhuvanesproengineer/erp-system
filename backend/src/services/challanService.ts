import * as ChallanModel from '../models/Challan';

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const createChallan = async (
  data: {
    customerId: number;
    status: 'Draft' | 'Confirmed';
    products: { productId: number; quantity: number }[];
  },
  createdBy: string
) => {
  if (!data.customerId) {
    throw new ValidationError('Customer ID is required');
  }
  if (!['Draft', 'Confirmed'].includes(data.status)) {
    throw new ValidationError("Status must be 'Draft' or 'Confirmed'");
  }
  if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
    throw new ValidationError('At least one product line item is required');
  }

  for (const p of data.products) {
    if (!p.productId) {
      throw new ValidationError('Invalid product item in list');
    }
    if (!p.quantity || p.quantity <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }
  }

  return await ChallanModel.createChallan({
    customerId: data.customerId,
    status: data.status,
    products: data.products,
    createdBy: createdBy || 'System',
  });
};

export const getAllChallans = async (options?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  return await ChallanModel.getAllChallans(options);
};

export const getChallanById = async (id: number) => {
  const challan = await ChallanModel.getChallanById(id);
  if (!challan) {
    throw new NotFoundError(`Sales Challan with ID ${id} not found`);
  }
  return challan;
};

export const confirmChallan = async (id: number, confirmedBy: string) => {
  const existing = await ChallanModel.getChallanById(id);
  if (!existing) {
    throw new NotFoundError(`Sales Challan with ID ${id} not found`);
  }
  return await ChallanModel.confirmChallan(id, confirmedBy || 'System');
};

export const cancelChallan = async (id: number, cancelledBy: string) => {
  const existing = await ChallanModel.getChallanById(id);
  if (!existing) {
    throw new NotFoundError(`Sales Challan with ID ${id} not found`);
  }
  return await ChallanModel.cancelChallan(id, cancelledBy || 'System');
};

export const searchChallans = async (keyword: string) => {
  return await ChallanModel.getAllChallans({ search: keyword });
};
