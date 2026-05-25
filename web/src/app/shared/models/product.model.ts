export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price?: number;
  stock: number;
  status: 'active' | 'out_of_stock' | 'discontinued';
  images: string[];
  category_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export interface ProductFilter {
  category_id?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}
