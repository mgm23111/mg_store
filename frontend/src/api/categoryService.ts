import api from './axios';
import { ApiResponse, Category } from '../types';

export const categoryService = {
  // Public endpoints
  getAll: async (): Promise<Category[]> => {
    const response = await api.get<ApiResponse<Category[]>>('/categories');
    return response.data.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data.data;
  },

  // Admin endpoints
  createCategory: async (data: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.post<ApiResponse<Category>>('/admin/categories', data);
    return response.data.data;
  },

  updateCategory: async (id: number, data: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
    return response.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/admin/categories/${id}`);
  },
};
