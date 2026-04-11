import api from './axios';
import { ApiResponse, Product } from '../types';

export const productService = {
  getAll: async (params?: { categoryId?: number; search?: string }): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>('/products', { params });
    return response.data.data;
  },

  getFeatured: async (): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>('/products/featured');
    return response.data.data;
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${slug}`);
    return response.data.data;
  },

  getByCategory: async (categoryId: number): Promise<Product[]> => {
    const response = await api.get<ApiResponse<Product[]>>(`/products/category/${categoryId}`);
    return response.data.data;
  },

  // Admin endpoints
  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post<ApiResponse<Product>>('/admin/products', data);
    return response.data.data;
  },

  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
    return response.data.data;
  },

  updateStatus: async (id: number, active: boolean): Promise<Product> => {
    const response = await api.put<ApiResponse<Product>>(`/admin/products/${id}`, { active });
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },
};
