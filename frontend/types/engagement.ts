// Mirrors app/schemas/review.py, notification.py, delivery.py

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  reviewer_name: string;
}

export interface ReviewSummary {
  average_rating: number;
  review_count: number;
  reviews: Review[];
}

export interface ReviewPayload {
  rating: number;
  title?: string;
  comment: string;
}

export type NotificationType = "order_update" | "payment_update" | "general";

export interface Notification {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  related_order_id: string | null;
  is_read: boolean;
  created_at: string;
}

// Shape of a live push over the WebSocket — mirrors core/notifications.py's payload
export interface LiveNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_order_id: string | null;
  created_at: string;
}

export type TrackingStatus = "order_packed" | "shipped" | "in_transit" | "out_for_delivery" | "delivered";

export interface DeliveryPartner {
  id: string;
  name: string;
  phone_number: string;
  vehicle_number: string | null;
  is_active: boolean;
}

export interface TrackingEvent {
  id: string;
  status: TrackingStatus;
  location_label: string | null;
  latitude: number | null;
  longitude: number | null;
  note: string | null;
  created_at: string;
  delivery_partner: DeliveryPartner | null;
}
