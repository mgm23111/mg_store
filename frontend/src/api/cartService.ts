import api from './axios';
import { ApiResponse, Cart, AddToCartRequest } from '../types';

export const cartService = {
  getCart: async (sessionId: string): Promise<Cart> => {
    const response = await api.get<ApiResponse<Cart>>(`/cart/${sessionId}`);
    return response.data.data;
  },

  addToCart: async (data: AddToCartRequest): Promise<Cart> => {
    const response = await api.post<ApiResponse<Cart>>('/cart/add', data);
    return response.data.data;
  },

  updateItem: async (sessionId: string, itemId: number, quantity: number): Promise<Cart> => {
    const response = await api.put<ApiResponse<Cart>>(
      `/cart/${sessionId}/items/${itemId}`,
      { quantity }
    );
    return response.data.data;
  },

  removeItem: async (sessionId: string, itemId: number): Promise<Cart> => {
    const response = await api.delete<ApiResponse<Cart>>(`/cart/${sessionId}/items/${itemId}`);
    return response.data.data;
  },

  clearCart: async (sessionId: string): Promise<void> => {
    await api.delete(`/cart/${sessionId}/clear`);
  },
};
