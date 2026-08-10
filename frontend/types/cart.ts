// Mirrors app/schemas/cart.py, app/schemas/order.py, app/schemas/address.py

export interface CartItem {
  id: string;
  variant_id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  sku: string;
  size: string | null;
  color: string | null;
  unit_price: string;
  quantity: number;
  line_total: string;
  stock_quantity: number;
  image_url: string | null;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: string;
  discount_amount: string;
  applied_coupon_code: string | null;
  total: string;
}

export interface Address {
  id: string;
  label: string;
  full_name: string;
  phone_number: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export interface AddressPayload {
  label?: string;
  full_name: string;
  phone_number: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  is_default?: boolean;
}

export type OrderStatus =
  | "pending"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "returned"
  | "refunded";

export interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  sku: string;
  size: string | null;
  color: string | null;
  unit_price: string;
  quantity: number;
  line_total: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: string;
  discount_amount: string;
  gst_amount: string;
  shipping_charge: string;
  total_amount: string;
  coupon_code: string | null;
  shipping_full_name: string;
  shipping_phone_number: string;
  shipping_line1: string;
  shipping_line2: string | null;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code: string;
  shipping_country: string;
  created_at: string;
  items: OrderItem[];
}
