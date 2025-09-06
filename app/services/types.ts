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
  currency: string;
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


export interface ProductDetailsResponse {
  product: ProductDetails;
  custom_fields: CustomField[];
  faq_items: FaqItem[];
  reviews: ReviewsData;
  shop: Shop;
}

export interface ProductDetails extends Product {
  product_type: string;
  pricing_type: string;
  promo_price: number | null;
  min_price: number | null;
  max_price: number;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomField {
  id: string;
  name: string;
  value: string;
  type: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface ReviewsData {
  items: Review[];
  pagination: ReviewsPagination;
  stats: ReviewsStats;
}

export interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ReviewsPagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ReviewsStats {
  total_reviews: number;
  average_rating: number;
  rating_distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}