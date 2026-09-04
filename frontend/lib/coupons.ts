import { api } from "@/lib/api";
import type { Coupon } from "@/types/admin";

export async function fetchActiveCoupons(): Promise<Coupon[]> {
  const { data } = await api.get<Coupon[]>("/api/v1/coupons/active");
  return data;
}
