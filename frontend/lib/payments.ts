import { api } from "@/lib/api";
import type { CreateRazorpayOrderResponse, Payment, RazorpaySuccessResponse } from "@/types/payment";

export async function createRazorpayOrder(orderId: string): Promise<CreateRazorpayOrderResponse> {
  const { data } = await api.post<CreateRazorpayOrderResponse>("/api/v1/payments/razorpay/orders", {
    order_id: orderId,
  });
  return data;
}

export async function verifyRazorpayPayment(payload: RazorpaySuccessResponse): Promise<Payment> {
  const { data } = await api.post<Payment>("/api/v1/payments/razorpay/verify", payload);
  return data;
}

export async function fetchOrderPayments(orderId: string): Promise<Payment[]> {
  const { data } = await api.get<Payment[]>(`/api/v1/payments/order/${orderId}`);
  return data;
}
