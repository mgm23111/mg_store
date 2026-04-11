import api from './axios';
import { ApiResponse, Order, CheckoutRequest } from '../types';

export const orderService = {
  checkout: async (data: CheckoutRequest): Promise<Order> => {
    const response = await api.post<ApiResponse<Order>>('/checkout', data);
    return response.data.data;
  },

  trackOrder: async (orderNumber: string): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/track/${orderNumber}`);
    return response.data.data;
  },

  // Public endpoint - get order by order number (for order confirmation)
  getOrderByNumber: async (orderNumber: string): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/orders/track/${orderNumber}`);
    return response.data.data;
  },

  // Admin endpoints
  getAll: async (): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>('/admin/orders');
    return response.data.data;
  },

  getAllOrders: async (): Promise<Order[]> => {
    const response = await api.get<ApiResponse<Order[]>>('/admin/orders');
    return response.data.data;
  },

  getAdminOrderById: async (id: number): Promise<Order> => {
    const response = await api.get<ApiResponse<Order>>(`/admin/orders/${id}`);
    return response.data.data;
  },

  updateStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status });
    return response.data.data;
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.put<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status });
    return response.data.data;
  },

  cancelOrder: async (id: number): Promise<void> => {
    await api.post(`/admin/orders/${id}/cancel`);
  },
};
