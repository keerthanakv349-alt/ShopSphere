import type { Order } from "./cart";
import type { Category, Brand, ProductStatus } from "./catalog";

export type UserRole = "customer" | "admin" | "super_admin";

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
}

export interface DashboardSummary {
  total_revenue: string;
  total_orders: number;
  total_customers: number;
  total_products: number;
  low_stock_variant_count: number;
  recent_orders: Order[];
}

export interface ProductVariantInput {
  sku: string;
  size?: string;
  color?: string;
  stock_quantity: number;
  price_override?: string;
}

export interface ProductCreatePayload {
  name: string;
  description?: string;
  category_id: string;
  brand_id: string;
  base_price: string;
  discount_percentage?: string;
  gst_percentage?: string;
  status: ProductStatus;
  is_featured?: boolean;
  is_trending?: boolean;
  variants: ProductVariantInput[];
}

export type DiscountType = "percentage" | "flat";

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  max_discount_amount: string | null;
  min_order_value: string;
  valid_from: string | null;
  valid_until: string | null;
  usage_limit: number | null;
  times_used: number;
  is_active: boolean;
}

export interface CouponCreatePayload {
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  max_discount_amount?: string;
  min_order_value?: string;
  usage_limit?: number;
}

export type { Category, Brand };
