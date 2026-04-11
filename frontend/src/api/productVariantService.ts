import api from './axios';
import { ApiResponse } from '../types';

export interface ProductVariant {
  id: number;
  sku: string;
  stockQuantity: number;
  reservedQuantity: number;
  isActive: boolean;
  color: {
    id: number;
    name: string;
    hexCode: string;
  };
  size: {
    id: number;
    name: string;
    sortOrder: number;
  };
}

export interface ProductVariantRequest {
  colorId: number;
  sizeId: number;
  sku?: string;
  stockQuantity: number;
  isActive?: boolean;
}

export const productVariantService = {
  /**
   * Add variant to product
   */
  addVariant: async (productId: number, data: ProductVariantRequest): Promise<ProductVariant> => {
    const response = await api.post<ApiResponse<ProductVariant>>(
      `/admin/products/${productId}/variants`,
      data
    );
    return response.data.data;
  },

  /**
   * Get all variants for a product
   */
  getVariants: async (productId: number): Promise<ProductVariant[]> => {
    const response = await api.get<ApiResponse<ProductVariant[]>>(
      `/admin/products/${productId}/variants`
    );
    return response.data.data;
  },

  /**
   * Update product variant
   */
  updateVariant: async (variantId: number, data: ProductVariantRequest): Promise<ProductVariant> => {
    const response = await api.put<ApiResponse<ProductVariant>>(
      `/admin/products/variants/${variantId}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete product variant
   */
  deleteVariant: async (variantId: number): Promise<void> => {
    await api.delete(`/admin/products/variants/${variantId}`);
  },
};
