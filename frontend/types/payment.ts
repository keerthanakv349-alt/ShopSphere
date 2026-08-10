// Mirrors app/schemas/payment.py

export type PaymentStatus = "created" | "paid" | "failed" | "refunded";

export interface Payment {
  id: string;
  order_id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: string;
  currency: string;
  status: PaymentStatus;
  failure_reason: string | null;
  created_at: string;
}

export interface CreateRazorpayOrderResponse {
  razorpay_order_id: string;
  amount: number; // paise
  currency: string;
  key_id: string;
}

// Shape of the object Razorpay's Checkout widget calls back with on
// success — documented by Razorpay, not something we control the shape of.
export interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
