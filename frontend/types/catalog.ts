// Mirrors app/schemas/catalog.py on the backend.

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface ProductVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  stock_quantity: number;
  price_override: string | null;
}

export interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
  variant_id: string | null;
}

export type ProductStatus = "draft" | "active" | "inactive";

export interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: string;
  discount_percentage: string;
  status: ProductStatus;
  is_featured: boolean;
  is_trending: boolean;
  category: Category;
  brand: Brand;
  primary_image_url: string | null;
  total_stock: number;
}

export interface ProductDetail extends Omit<Product, "primary_image_url"> {
  description: string;
  gst_percentage: string;
  created_at: string;
  variants: ProductVariant[];
  images: ProductImage[];
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductListParams {
  category?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  q?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "featured";
  page?: number;
  page_size?: number;
}
