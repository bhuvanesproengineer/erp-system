import api from './api';
import { SalesChallan } from '../types/challan';

export const challanService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await api.get('/challans', { params });
    return response.data;
  },

  search: async (keyword: string) => {
    const response = await api.get('/challans/search', { params: { q: keyword } });
    return response.data;
  },

  getById: async (id: number): Promise<{ success: boolean; data: SalesChallan }> => {
    const response = await api.get(`/challans/${id}`);
    return response.data;
  },

  create: async (data: {
    customerId: number;
    status: 'Draft' | 'Confirmed';
    products: { productId: number; quantity: number }[];
  }): Promise<{ success: boolean; message: string; data: SalesChallan }> => {
    const response = await api.post('/challans', data);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      customerId?: number;
      products?: { productId: number; quantity: number }[];
    }
  ): Promise<{ success: boolean; message: string; data: SalesChallan }> => {
    const response = await api.put(`/challans/${id}`, data);
    return response.data;
  },

  confirm: async (id: number): Promise<{ success: boolean; message: string; data: SalesChallan }> => {
    const response = await api.put(`/challans/${id}/confirm`);
    return response.data;
  },

  cancel: async (id: number): Promise<{ success: boolean; message: string; data: SalesChallan }> => {
    const response = await api.put(`/challans/${id}/cancel`);
    return response.data;
  },
};
