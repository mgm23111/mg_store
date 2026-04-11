import api from './axios';
import { ApiResponse, LoginRequest, LoginResponse } from '../types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      '/admin/auth/login',
      credentials
    );
    return response.data.data;
  },
};
