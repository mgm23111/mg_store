import api from './axios';
import { ApiResponse, GiftCard } from '../types';

export const giftCardService = {
  // Public endpoints - validate gift card for checkout
  validateGiftCard: async (code: string): Promise<GiftCard> => {
    const response = await api.get<ApiResponse<GiftCard>>(`/gift-cards/validate/${code}`);
    return response.data.data;
  },

  checkBalance: async (code: string): Promise<number> => {
    const response = await api.get<ApiResponse<number>>(`/gift-cards/balance/${code}`);
    return response.data.data;
  },

  // Admin endpoints
  getAllGiftCards: async (): Promise<GiftCard[]> => {
    const response = await api.get<ApiResponse<GiftCard[]>>('/admin/gift-cards');
    return response.data.data;
  },

  getActiveGiftCards: async (): Promise<GiftCard[]> => {
    const response = await api.get<ApiResponse<GiftCard[]>>('/admin/gift-cards/active');
    return response.data.data;
  },

  getGiftCardById: async (id: number): Promise<GiftCard> => {
    const response = await api.get<ApiResponse<GiftCard>>(`/admin/gift-cards/${id}`);
    return response.data.data;
  },

  createGiftCard: async (data: Omit<GiftCard, 'id' | 'currentBalance' | 'isValid'>): Promise<GiftCard> => {
    const response = await api.post<ApiResponse<GiftCard>>('/admin/gift-cards', data);
    return response.data.data;
  },

  updateGiftCard: async (id: number, data: Omit<GiftCard, 'id' | 'currentBalance' | 'isValid'>): Promise<GiftCard> => {
    const response = await api.put<ApiResponse<GiftCard>>(`/admin/gift-cards/${id}`, data);
    return response.data.data;
  },

  addBalance: async (id: number, amount: number): Promise<GiftCard> => {
    const response = await api.post<ApiResponse<GiftCard>>(`/admin/gift-cards/${id}/add-balance`, { amount });
    return response.data.data;
  },

  deactivateGiftCard: async (id: number): Promise<void> => {
    await api.put(`/admin/gift-cards/${id}/deactivate`);
  },

  deleteGiftCard: async (id: number): Promise<void> => {
    await api.delete(`/admin/gift-cards/${id}`);
  },
};
