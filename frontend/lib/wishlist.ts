"use client";

import { api } from "@/lib/api";

export interface WishlistProduct {
  id: string;
  name: string;
  slug: string;
  base_price: string;
  discount_percentage: string;
  primary_image_url: string | null;
}

export interface WishlistItem {
  id: string;
  product: WishlistProduct;
  created_at: string;
}

export async function fetchWishlist(): Promise<WishlistItem[]> {
  const { data } = await api.get<WishlistItem[]>(
    "/api/v1/wishlist"
  );

  return data;
}

export async function addToWishlist(
  productId: string
): Promise<WishlistItem> {
  const { data } = await api.post<WishlistItem>(
    `/api/v1/wishlist/${productId}`
  );

  return data;
}

export async function removeFromWishlist(
  productId: string
): Promise<void> {
  await api.delete(
    `/api/v1/wishlist/${productId}`
  );
}