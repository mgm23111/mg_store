import api from './axios';
import { ApiResponse, StoreSettings } from '../types';

interface UpdateStoreSettingsRequest {
  companyName: string;
  logoUrl?: string | null;
}

export const storeSettingsService = {
  getSettings: async (): Promise<StoreSettings> => {
    const response = await api.get<ApiResponse<StoreSettings>>('/store-settings');
    return response.data.data;
  },

  updateSettings: async (data: UpdateStoreSettingsRequest): Promise<StoreSettings> => {
    const response = await api.put<ApiResponse<StoreSettings>>('/admin/store-settings', data);
    return response.data.data;
  },

  uploadLogo: async (file: File): Promise<StoreSettings> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<StoreSettings>>(
      '/admin/store-settings/logo/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  },
};
