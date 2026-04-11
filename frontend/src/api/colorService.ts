import api from './axios';
import { ApiResponse, Color } from '../types';

export const colorService = {
  // Public endpoints
  getAll: async (): Promise<Color[]> => {
    const response = await api.get<ApiResponse<Color[]>>('/colors');
    return response.data.data;
  },

  getById: async (id: number): Promise<Color> => {
    const response = await api.get<ApiResponse<Color>>(`/colors/${id}`);
    return response.data.data;
  },

  // Admin endpoints
  createColor: async (data: Omit<Color, 'id'>): Promise<Color> => {
    const response = await api.post<ApiResponse<Color>>('/admin/colors', data);
    return response.data.data;
  },

  updateColor: async (id: number, data: Omit<Color, 'id'>): Promise<Color> => {
    const response = await api.put<ApiResponse<Color>>(`/admin/colors/${id}`, data);
    return response.data.data;
  },

  deleteColor: async (id: number): Promise<void> => {
    await api.delete(`/admin/colors/${id}`);
  },
};
