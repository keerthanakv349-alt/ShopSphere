import { api } from "@/lib/api";
import type { Address, AddressPayload, Cart, Order } from "@/types/cart";

// --- Cart ---
export async function fetchCart(): Promise<Cart> {
  const { data } = await api.get<Cart>("/api/v1/cart");
  return data;
}

export async function addCartItem(variantId: string, quantity: number): Promise<Cart> {
  const { data } = await api.post<Cart>("/api/v1/cart/items", { variant_id: variantId, quantity });
  return data;
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  const { data } = await api.put<Cart>(`/api/v1/cart/items/${itemId}`, { quantity });
  return data;
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const { data } = await api.delete<Cart>(`/api/v1/cart/items/${itemId}`);
  return data;
}

export async function applyCoupon(code: string): Promise<Cart> {
  const { data } = await api.post<Cart>("/api/v1/cart/apply-coupon", { code });
  return data;
}

export async function removeCoupon(): Promise<Cart> {
  const { data } = await api.delete<Cart>("/api/v1/cart/coupon");
  return data;
}

// --- Addresses ---
export async function fetchAddresses(): Promise<Address[]> {
  const { data } = await api.get<Address[]>("/api/v1/addresses");
  return data;
}

export async function createAddress(payload: AddressPayload): Promise<Address> {
  const { data } = await api.post<Address>("/api/v1/addresses", payload);
  return data;
}

// --- Orders ---
export async function checkout(addressId: string, shippingCharge = "50.00"): Promise<Order> {
  const { data } = await api.post<Order>("/api/v1/orders", {
    address_id: addressId,
    shipping_charge: shippingCharge,
  });
  return data;
}

export async function fetchMyOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>("/api/v1/orders");
  return data;
}

export async function fetchMyOrder(orderId: string): Promise<Order> {
  const { data } = await api.get<Order>(`/api/v1/orders/${orderId}`);
  return data;
}
