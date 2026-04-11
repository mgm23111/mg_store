import api from './axios';
import { ApiResponse } from '../types';

export interface ShippingMethod {
  id: number;
  name: string;
  code: string;
  basePrice: number;
  estimatedDays: string;
  isActive: boolean;
}

export interface Shipping {
  id: number;
  orderId: number;
  orderNumber: string;
  shippingMethodId: number;
  shippingMethodName: string;
  courierName?: string;
  trackingNumber?: string;
  shippingCost: number;
  status: string;
  estimatedDeliveryDate?: string;
  shippedAt?: string;
  deliveredAt?: string;
  notes?: string;
  recipientName: string;
  recipientPhone: string;
  address: string;
  createdAt: string;
}

export interface UpdateShippingRequest {
  courierName?: string;
  trackingNumber?: string;
  status?: string;
  notes?: string;
}

export const shippingService = {
  // Public endpoints
  getActiveShippingMethods: async (): Promise<ShippingMethod[]> => {
    const response = await api.get<ApiResponse<ShippingMethod[]>>('/shipping-methods');
    return response.data.data;
  },

  getShippingMethodById: async (id: number): Promise<ShippingMethod> => {
    const response = await api.get<ApiResponse<ShippingMethod>>(`/shipping-methods/${id}`);
    return response.data.data;
  },

  // Public endpoint - get shipping by order number (for order confirmation)
  getShippingByOrderNumber: async (orderNumber: string): Promise<Shipping> => {
    const response = await api.get<ApiResponse<Shipping>>(`/orders/track/${orderNumber}/shipping`);
    return response.data.data;
  },

  // Admin endpoints - Shipping Methods
  getAllShippingMethods: async (): Promise<ShippingMethod[]> => {
    const response = await api.get<ApiResponse<ShippingMethod[]>>('/admin/shipping-methods');
    return response.data.data;
  },

  updateShippingMethod: async (id: number, data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
    const response = await api.put<ApiResponse<ShippingMethod>>(`/admin/shipping-methods/${id}`, data);
    return response.data.data;
  },

  // Admin endpoints - Shipping Management
  getAllShippings: async (): Promise<Shipping[]> => {
    const response = await api.get<ApiResponse<Shipping[]>>('/admin/shippings');
    return response.data.data;
  },

  getPendingShippings: async (): Promise<Shipping[]> => {
    const response = await api.get<ApiResponse<Shipping[]>>('/admin/shippings/pending');
    return response.data.data;
  },

  getAdminShippingByOrderId: async (orderId: number): Promise<Shipping> => {
    const response = await api.get<ApiResponse<Shipping>>(`/admin/orders/${orderId}/shipping`);
    return response.data.data;
  },

  updateShipping: async (orderId: number, data: UpdateShippingRequest): Promise<Shipping> => {
    const response = await api.put<ApiResponse<Shipping>>(`/admin/orders/${orderId}/shipping`, data);
    return response.data.data;
  },

  updateShippingStatus: async (orderId: number, status: string): Promise<Shipping> => {
    const response = await api.put<ApiResponse<Shipping>>(`/admin/orders/${orderId}/shipping/status`, { status });
    return response.data.data;
  },
};
