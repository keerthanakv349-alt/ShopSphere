import { api } from "@/lib/api";
import type { Product } from "@/types/catalog";
import type { Notification, Review, ReviewPayload, ReviewSummary, TrackingEvent } from "@/types/engagement";

// --- Reviews ---
export async function fetchReviews(productId: string): Promise<ReviewSummary> {
  const { data } = await api.get<ReviewSummary>(`/api/v1/products/${productId}/reviews`);
  return data;
}

export async function createReview(productId: string, payload: ReviewPayload): Promise<Review> {
  const { data } = await api.post<Review>(`/api/v1/products/${productId}/reviews`, payload);
  return data;
}

export async function markReviewHelpful(reviewId: string): Promise<Review> {
  const { data } = await api.post<Review>(`/api/v1/reviews/${reviewId}/helpful`);
  return data;
}

export async function reportReview(reviewId: string): Promise<void> {
  await api.post(`/api/v1/reviews/${reviewId}/report`);
}

// --- Notifications ---
export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>("/api/v1/notifications");
  return data;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const { data } = await api.put<Notification>(`/api/v1/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.put("/api/v1/notifications/read-all");
}

// --- Search ---
export async function logSearch(q: string): Promise<void> {
  await api.post("/api/v1/search/log", null, { params: { q } });
}

export async function fetchSearchSuggestions(q: string): Promise<string[]> {
  const { data } = await api.get<string[]>("/api/v1/search/suggestions", { params: { q } });
  return data;
}

export async function fetchTrendingSearches(): Promise<string[]> {
  const { data } = await api.get<string[]>("/api/v1/search/trending");
  return data;
}

// --- Recommendations ---
export async function fetchRelatedProducts(slug: string): Promise<Product[]> {
  const { data } = await api.get<Product[]>(`/api/v1/products/${slug}/related`);
  return data;
}

export async function fetchFrequentlyBoughtTogether(slug: string): Promise<Product[]> {
  const { data } = await api.get<Product[]>(`/api/v1/products/${slug}/frequently-bought-together`);
  return data;
}

// --- Tracking ---
export async function fetchOrderTracking(orderId: string): Promise<TrackingEvent[]> {
  const { data } = await api.get<TrackingEvent[]>(`/api/v1/orders/${orderId}/tracking`);
  return data;
}
