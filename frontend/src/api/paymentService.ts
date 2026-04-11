import api from './axios';
import { ApiResponse, Payment } from '../types';

export const paymentService = {
  processCulqi: async (orderId: number, token: string): Promise<Payment> => {
    const response = await api.post<ApiResponse<Payment>>('/payments/culqi', {
      orderId,
      token,
    });
    return response.data.data;
  },

  getPaymentByOrder: async (orderId: number): Promise<Payment> => {
    const response = await api.get<ApiResponse<Payment>>(`/payments/order/${orderId}`);
    return response.data.data;
  },

  // Admin Yape endpoints
  getPendingYapePayments: async (): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>('/admin/yape/pending');
    return response.data.data;
  },

  approveYapePayment: async (
    paymentId: number,
    adminId: number,
    notes?: string
  ): Promise<Payment> => {
    const response = await api.post<ApiResponse<Payment>>(`/admin/yape/${paymentId}/approve`, {
      adminId,
      notes,
    });
    return response.data.data;
  },

  rejectYapePayment: async (
    paymentId: number,
    adminId: number,
    notes?: string
  ): Promise<Payment> => {
    const response = await api.post<ApiResponse<Payment>>(`/admin/yape/${paymentId}/reject`, {
      adminId,
      notes,
    });
    return response.data.data;
  },
};
