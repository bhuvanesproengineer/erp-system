import api from './api';
import { Product, StockMovement } from '../types/product';

export const productService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; category?: string }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  search: async (keyword: string) => {
    const response = await api.get('/products/search', { params: { q: keyword } });
    return response.data;
  },

  getLowStock: async () => {
    const response = await api.get('/products/low-stock');
    return response.data;
  },

  getById: async (id: number): Promise<{ success: boolean; data: Product }> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  create: async (data: Partial<Product>): Promise<{ success: boolean; message: string; data: Product }> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Product>): Promise<{ success: boolean; message: string; data: Product }> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  addStockMovement: async (
    id: number,
    data: { quantityChanged: number; movementType: 'IN' | 'OUT'; reason: string; createdBy?: string }
  ) => {
    const response = await api.post(`/products/${id}/stock`, data);
    return response.data;
  },

  getStockMovements: async (id: number): Promise<{ success: boolean; data: StockMovement[] }> => {
    const response = await api.get(`/products/${id}/movements`);
    return response.data;
  },
};
