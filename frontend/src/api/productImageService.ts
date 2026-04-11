import api from './axios';
import { ApiResponse } from '../types';

export interface ProductImage {
  id: number;
  url: string;
  altText?: string;
  isPrimary: boolean;
  sortOrder: number;
  colorId?: number | null;
}

export interface ProductImageRequest {
  url: string;
  altText?: string;
  isPrimary?: boolean;
  sortOrder?: number;
  colorId?: number;
}

export const productImageService = {
  /**
   * Add image to product
   */
  addImage: async (productId: number, data: ProductImageRequest): Promise<ProductImage> => {
    const response = await api.post<ApiResponse<ProductImage>>(
      `/admin/products/${productId}/images`,
      data
    );
    return response.data.data;
  },

  /**
   * Upload image file and add to product
   */
  uploadImage: async (
    productId: number,
    file: File,
    data?: Omit<ProductImageRequest, 'url'>
  ): Promise<ProductImage> => {
    const formData = new FormData();
    formData.append('file', file);

    if (data?.altText) formData.append('altText', data.altText);
    if (typeof data?.isPrimary === 'boolean') formData.append('isPrimary', String(data.isPrimary));
    if (typeof data?.sortOrder === 'number') formData.append('sortOrder', String(data.sortOrder));
    if (typeof data?.colorId === 'number' && data.colorId > 0) formData.append('colorId', String(data.colorId));

    const response = await api.post<ApiResponse<ProductImage>>(
      `/admin/products/${productId}/images/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data;
  },

  /**
   * Get all images for a product
   */
  getImages: async (productId: number): Promise<ProductImage[]> => {
    const response = await api.get<ApiResponse<ProductImage[]>>(
      `/admin/products/${productId}/images`
    );
    return response.data.data;
  },

  /**
   * Update product image
   */
  updateImage: async (imageId: number, data: ProductImageRequest): Promise<ProductImage> => {
    const response = await api.put<ApiResponse<ProductImage>>(
      `/admin/products/images/${imageId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete product image
   */
  deleteImage: async (imageId: number): Promise<void> => {
    await api.delete(`/admin/products/images/${imageId}`);
  },
};
