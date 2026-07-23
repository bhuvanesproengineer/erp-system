import api from './api';
import { Customer, CustomerDetailsResponse, CustomerFollowup } from '../types/customer';

export const customerService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  search: async (keyword: string) => {
    const response = await api.get('/customers/search', { params: { q: keyword } });
    return response.data;
  },

  getById: async (id: number): Promise<{ success: boolean; data: Customer }> => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  getDetails: async (id: number): Promise<{ success: boolean; data: CustomerDetailsResponse }> => {
    const response = await api.get(`/customers/${id}/details`);
    return response.data;
  },

  create: async (data: Partial<Customer>): Promise<{ success: boolean; message: string; data: Customer }> => {
    const response = await api.post('/customers', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Customer>): Promise<{ success: boolean; message: string; data: Customer }> => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  addFollowup: async (
    id: number,
    data: { note: string; followUpDate?: string }
  ): Promise<{ success: boolean; message: string; data: CustomerFollowup }> => {
    const response = await api.post(`/customers/${id}/followups`, data);
    return response.data;
  },
};
