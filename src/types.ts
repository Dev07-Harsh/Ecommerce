export interface CartItem {
  cart_item_id: number;
  product_id: number;
  merchant_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    stock: number;
    is_deleted: boolean;
    sku?: string;
  };
}

export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image_url: string;
  images?: string[];
  stock: number;
  is_deleted: boolean;
  sku?: string;
  description?: string;
  category?: {
    category_id: number;
    name: string;
  };
  brand?: {
    brand_id: number;
    name: string;
  };
  special_price?: number | null;
  special_start?: string | null;
  special_end?: string | null;
  discount_pct?: number;
  placement?: {
    placement_id: number;
    sort_order: number;
    added_at: string;
    expires_at: string | null;
  };
  rating?: number;
  reviews?: number;
  isNew?: boolean;
  isBuiltIn?: boolean;
  featured?: boolean;
  favourite?: boolean;
  currency?: string;
  tags?: string[];
  primary_image?: string;
  category_id?: number;
  brand_id?: number;
  attributes?: any[];
  created_at?: string;
} 