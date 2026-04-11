import api from './axios';
import { ApiResponse, Size } from '../types';

export const sizeService = {
  // Public endpoints
  getAll: async (): Promise<Size[]> => {
    const response = await api.get<ApiResponse<Size[]>>('/sizes');
    return response.data.data;
  },

  getById: async (id: number): Promise<Size> => {
    const response = await api.get<ApiResponse<Size>>(`/sizes/${id}`);
    return response.data.data;
  },

  // Admin endpoints
  createSize: async (data: Omit<Size, 'id'>): Promise<Size> => {
    const response = await api.post<ApiResponse<Size>>('/admin/sizes', data);
    return response.data.data;
  },

  updateSize: async (id: number, data: Omit<Size, 'id'>): Promise<Size> => {
    const response = await api.put<ApiResponse<Size>>(`/admin/sizes/${id}`, data);
    return response.data.data;
  },

  deleteSize: async (id: number): Promise<void> => {
    await api.delete(`/admin/sizes/${id}`);
  },
};
