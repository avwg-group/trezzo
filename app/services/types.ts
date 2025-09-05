export interface Product {
  id: string;
  product_name: string;
  slug: string;
  product_image: string;
  product_type: string;
  description: string;
  category: string;
  pricing_type: string;
  price: number;
  promo_price: number | null;
  created_at: string;
  review_count: number;
  average_rating: number;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  description: string;
  custom_domain: string | null;
}

export interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
  shop: Shop;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}