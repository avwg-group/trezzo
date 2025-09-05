import { apiClient, type ApiClientError } from '~/lib/apiClient';
import type { Product, ProductsResponse, ProductFilters } from './types';

export class ProductService {
  static async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sort_by', filters.sortBy);
      if (filters.sortOrder) params.append('sort_order', filters.sortOrder);

      const queryString = params.toString();
      const endpoint = `/shop/client/products${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching products from: getProducts', endpoint);
      
      const response = await apiClient.get<ProductsResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      throw error; // Relancer l'erreur pour que le loader puisse la gérer
    }
  }

  static async getProduct(id: string): Promise<Product> {
    try {
      const response = await apiClient.get<Product>(`/api/products/${id}`);
      return response;
    } catch (error) {
      console.error(`❌ Error fetching product ${id}:`, error);
      throw error;
    }
  }
}