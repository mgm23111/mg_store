import api from './axios';
import { ApiResponse, Coupon } from '../types';

export const couponService = {
  // Public endpoint - validate coupon for checkout
  validateCoupon: async (code: string): Promise<Coupon> => {
    const response = await api.get<ApiResponse<Coupon>>(`/coupons/validate/${code}`);
    return response.data.data;
  },

  // Admin endpoints
  getAllCoupons: async (): Promise<Coupon[]> => {
    const response = await api.get<ApiResponse<Coupon[]>>('/admin/coupons');
    return response.data.data;
  },

  getActiveCoupons: async (): Promise<Coupon[]> => {
    const response = await api.get<ApiResponse<Coupon[]>>('/admin/coupons/active');
    return response.data.data;
  },

  getCouponById: async (id: number): Promise<Coupon> => {
    const response = await api.get<ApiResponse<Coupon>>(`/admin/coupons/${id}`);
    return response.data.data;
  },

  createCoupon: async (data: Omit<Coupon, 'id' | 'currentUses' | 'isValid'>): Promise<Coupon> => {
    const response = await api.post<ApiResponse<Coupon>>('/admin/coupons', data);
    return response.data.data;
  },

  updateCoupon: async (id: number, data: Omit<Coupon, 'id' | 'currentUses' | 'isValid'>): Promise<Coupon> => {
    const response = await api.put<ApiResponse<Coupon>>(`/admin/coupons/${id}`, data);
    return response.data.data;
  },

  deactivateCoupon: async (id: number): Promise<void> => {
    await api.put(`/admin/coupons/${id}/deactivate`);
  },

  deleteCoupon: async (id: number): Promise<void> => {
    await api.delete(`/admin/coupons/${id}`);
  },
};
