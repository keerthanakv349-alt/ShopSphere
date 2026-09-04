


import { api } from "@/lib/api";
import type { Brand, Category, PaginatedProducts, ProductDetail } from "@/types/catalog";
import type { Order } from "@/types/cart";
import type { Payment } from "@/types/payment";
import type {
  AdminUser,
  Coupon,
  CouponCreatePayload,
  DashboardSummary,
  ProductCreatePayload,
  ProductVariantInput,
  UserRole,
} from "@/types/admin";

// --- Dashboard ---
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<DashboardSummary>("/api/v1/admin/dashboard/summary");
  return data;
}

// --- Catalog (categories/brands/products) ---
export async function fetchAdminProducts(page = 1): Promise<PaginatedProducts> {
  const { data } = await api.get<PaginatedProducts>("/api/v1/admin/products", { params: { page, page_size: 50 } });
  return data;
}

export async function createProduct(payload: ProductCreatePayload): Promise<ProductDetail> {
  const { data } = await api.post<ProductDetail>("/api/v1/admin/products", payload);
  return data;
}

export async function updateProductStatus(productId: string, status: string): Promise<ProductDetail> {
  const { data } = await api.put<ProductDetail>(`/api/v1/admin/products/${productId}`, { status });
  return data;
}

export async function deleteProduct(productId: string): Promise<void> {
  await api.delete(`/api/v1/admin/products/${productId}`);
}

// --- Single product (Edit Product screen) ---
export async function fetchAdminProduct(productId: string): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/api/v1/admin/products/${productId}`);
  return data;
}

export interface ProductUpdatePayload {
  name?: string;
  description?: string;
  category_id?: string;
  brand_id?: string;
  base_price?: string;
  discount_percentage?: string;
  gst_percentage?: string;
  status?: string;
  is_featured?: boolean;
  is_trending?: boolean;
}

export async function updateProduct(productId: string, payload: ProductUpdatePayload): Promise<ProductDetail> {
  const { data } = await api.put<ProductDetail>(`/api/v1/admin/products/${productId}`, payload);
  return data;
}

// --- Variants ---
export async function createProductVariant(productId: string, payload: ProductVariantInput) {
  const { data } = await api.post(`/api/v1/admin/products/${productId}/variants`, payload);
  return data;
}

export async function updateProductVariant(
  productId: string,
  variantId: string,
  payload: Partial<ProductVariantInput>
) {
  const { data } = await api.put(`/api/v1/admin/products/${productId}/variants/${variantId}`, payload);
  return data;
}

// --- Images ---
export async function setPrimaryImage(productId: string, imageId: string) {
  const { data } = await api.put(`/api/v1/admin/products/${productId}/images/${imageId}/primary`);
  return data;
}

export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  await api.delete(`/api/v1/admin/products/${productId}/images/${imageId}`);
}

export async function uploadProductImage(productId: string, file: File, isPrimary: boolean): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await api.post(`/api/v1/admin/products/${productId}/images`, formData, {
    params: { is_primary: isPrimary },
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function createCategory(name: string, parentId?: string): Promise<Category> {
  const { data } = await api.post<Category>("/api/v1/admin/categories", { name, parent_id: parentId });
  return data;
}

export async function updateCategory(
  categoryId: string,
  name: string
): Promise<Category> {
  const { data } = await api.put<Category>(
    `/api/v1/admin/categories/${categoryId}`,
    {
      name,
    }
  );

  return data;
}



export async function deleteCategory(categoryId: string): Promise<void> {
  await api.delete(`/api/v1/admin/categories/${categoryId}`);
}
export async function createBrand(name: string, logoUrl?: string): Promise<Brand> {
  const { data } = await api.post<Brand>("/api/v1/admin/brands", { name, logo_url: logoUrl });
  return data;
}

export async function updateBrand(
  brandId: string,
  name: string,
  logoUrl?: string
): Promise<Brand> {
  const { data } = await api.put<Brand>(
    `/api/v1/admin/brands/${brandId}`,
    {
      name,
      logo_url: logoUrl,
    }
  );

  return data;
}



// --- Orders ---
export async function fetchAdminOrders(): Promise<Order[]> {
  const { data } = await api.get<Order[]>("/api/v1/admin/orders");
  return data;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<Order> {
  const { data } = await api.put<Order>(`/api/v1/admin/orders/${orderId}/status`, { status });
  return data;
}

// --- Coupons ---
export async function fetchCoupons(): Promise<Coupon[]> {
  const { data } = await api.get<Coupon[]>("/api/v1/admin/coupons");
  return data;
}

export async function createCoupon(payload: CouponCreatePayload): Promise<Coupon> {
  const { data } = await api.post<Coupon>("/api/v1/admin/coupons", payload);
  return data;
}



export async function updateCoupon(
  couponId: string,
  payload: CouponCreatePayload
): Promise<Coupon> {
  const { data } = await api.put<Coupon>(
    `/api/v1/admin/coupons/${couponId}`,
    payload
  );

  return data;
}

export async function updateCouponStatus(
  couponId: string,
  isActive: boolean
): Promise<Coupon> {
  const { data } = await api.put<Coupon>(
    `/api/v1/admin/coupons/${couponId}/status`,
    null,
    {
      params: {
        is_active: isActive,
      },
    }
  );

  return data;
}

export async function deleteCoupon(couponId: string): Promise<void> {
  await api.delete(`/api/v1/admin/coupons/${couponId}`);
}

// --- Payments ---
export async function fetchAdminPayments(): Promise<Payment[]> {
  const { data } = await api.get<Payment[]>("/api/v1/payments/admin/all");
  return data;
}

export async function refundPayment(paymentId: string, amount?: string): Promise<Payment> {
  const { data } = await api.post<Payment>(`/api/v1/payments/${paymentId}/refund`, amount ? { amount } : {});
  return data;
}

// --- Delivery tracking ---
export interface DeliveryPartnerPayload {
  name: string;
  phone_number: string;
  vehicle_number?: string;
}

export async function fetchDeliveryPartners() {
  const { data } = await api.get("/api/v1/admin/delivery-partners");
  return data as { id: string; name: string; phone_number: string; vehicle_number: string | null; is_active: boolean }[];
}

export async function createDeliveryPartner(payload: DeliveryPartnerPayload) {
  const { data } = await api.post("/api/v1/admin/delivery-partners", payload);
  return data;
}

export interface DeliveryPartnerUpdatePayload {
  name?: string;
  phone_number?: string;
  vehicle_number?: string;
  is_active?: boolean;
}

export async function updateDeliveryPartner(partnerId: string, payload: DeliveryPartnerUpdatePayload) {
  const { data } = await api.put(`/api/v1/admin/delivery-partners/${partnerId}`, payload);
  return data;
}

export interface TrackingEventPayload {
  status: string;
  location_label?: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  delivery_partner_id?: string;
}

export async function addTrackingEvent(orderId: string, payload: TrackingEventPayload) {
  const { data } = await api.post(`/api/v1/admin/orders/${orderId}/tracking-events`, payload);
  return data;
}
export async function fetchAdminUsers(q?: string): Promise<AdminUser[]> {
  const { data } = await api.get<AdminUser[]>("/api/v1/admin/users", { params: q ? { q } : undefined });
  return data;
}

export interface AdminCustomerDetail {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: "customer" | "admin" | "super_admin";
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;

  addresses: {
    id: string;
    label: string;
    full_name: string;
    phone_number: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
  }[];

  total_orders: number;
  total_spend: string;

  orders: {
    id: string;
    order_number: string;
    status: string;
    subtotal: string;
    discount_amount: string;
    gst_amount: string;
    shipping_charge: string;
    total_amount: string;
    coupon_code: string | null;
    shipping_full_name: string;
    shipping_phone_number: string;
    shipping_line1: string;
    shipping_line2: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    shipping_country: string;
    created_at: string;

    items: {
      id: string;
      product_id: string;
      product_name: string;
      sku: string;
      size: string | null;
      color: string | null;
      unit_price: string;
      quantity: number;
      line_total: string;
    }[];
  }[];
}

export async function fetchCustomerDetail(
  customerId: string
): Promise<AdminCustomerDetail> {
  const { data } = await api.get<AdminCustomerDetail>(
    `/api/v1/admin/customers/${customerId}`
  );

  return data;
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<AdminUser> {
  const { data } = await api.put<AdminUser>(`/api/v1/admin/users/${userId}/status`, { is_active: isActive });
  return data;
}



export async function updateUserRole(userId: string, role: UserRole): Promise<AdminUser> {
  const { data } = await api.put<AdminUser>(`/api/v1/admin/users/${userId}/role`, { role });
  return data;
}


// --- Banners ---

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface BannerCreatePayload {
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface BannerUpdatePayload {
  title?: string;
  subtitle?: string | null;
  image_url?: string;
  link_url?: string | null;
  display_order?: number;
  is_active?: boolean;
}

export async function fetchBanners(): Promise<Banner[]> {
  const { data } = await api.get<Banner[]>(
    "/api/v1/admin/banners"
  );

  return data;
}

export async function fetchBanner(
  bannerId: string
): Promise<Banner> {
  const { data } = await api.get<Banner>(
    `/api/v1/admin/banners/${bannerId}`
  );

  return data;
}

export async function createBanner(
  payload: BannerCreatePayload
): Promise<Banner> {
  const { data } = await api.post<Banner>(
    "/api/v1/admin/banners",
    payload
  );

  return data;
}

export async function updateBanner(
  bannerId: string,
  payload: BannerUpdatePayload
): Promise<Banner> {
  const { data } = await api.put<Banner>(
    `/api/v1/admin/banners/${bannerId}`,
    payload
  );

  return data;
}

export async function deleteBanner(
  bannerId: string
): Promise<void> {
  await api.delete(
    `/api/v1/admin/banners/${bannerId}`
  );
}



// --- Inventory ---

export interface InventoryItem {
  variant_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  size: string;
  color: string;
  stock_quantity: number;
}

export interface InventoryResponse {
  items: InventoryItem[];
  total_variants: number;
  total_units: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

export async function fetchInventory(params?: {
  search?: string;
  low_stock_only?: boolean;
  out_of_stock_only?: boolean;
}): Promise<InventoryResponse> {
  const { data } = await api.get<InventoryResponse>(
    "/api/v1/admin/inventory",
    {
      params,
    }
  );

  return data;
}

export async function updateInventoryStock(
  variantId: string,
  stockQuantity: number
) {
  const { data } = await api.put(
    `/api/v1/admin/inventory/${variantId}/stock`,
    undefined,
    {
      params: {
        stock_quantity: stockQuantity,
      },
    }
  );

  return data;
}

// --- Site settings ---

export interface SiteSettings {
  store_name: string;
  support_email: string | null;
  support_phone: string | null;
  currency_code: string;
  default_shipping_charge: string;
  low_stock_threshold: number;
  maintenance_mode: boolean;
  updated_at: string;
}

export interface SiteSettingsUpdatePayload {
  store_name?: string;
  support_email?: string | null;
  support_phone?: string | null;
  currency_code?: string;
  default_shipping_charge?: string;
  low_stock_threshold?: number;
  maintenance_mode?: boolean;
}

export async function fetchSettings(): Promise<SiteSettings> {
  const { data } = await api.get<SiteSettings>("/api/v1/admin/settings");
  return data;
}

export async function updateSettings(payload: SiteSettingsUpdatePayload): Promise<SiteSettings> {
  const { data } = await api.put<SiteSettings>("/api/v1/admin/settings", payload);
  return data;
}

// --- Audit log ---

export interface AuditLogEntry {
  id: string;
  admin_name: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  created_at: string;
}

export async function fetchAuditLog(params?: {
  entity_type?: string;
  action?: string;
  q?: string;
}): Promise<AuditLogEntry[]> {
  const { data } = await api.get<AuditLogEntry[]>("/api/v1/admin/audit-log", { params });
  return data;
}

// --- Bulk product CSV import/export ---

export async function exportProductsCsv(): Promise<Blob> {
  const { data } = await api.get("/api/v1/admin/products-export", { responseType: "blob" });
  return data;
}

export interface ProductImportResult {
  products_created: number;
  products_updated: number;
  variants_created: number;
  variants_updated: number;
  errors: { row: number; message: string }[];
}

export async function importProductsCsv(file: File): Promise<ProductImportResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post<ProductImportResult>("/api/v1/admin/products-import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// --- Reported issues ("Report an Issue") ---

export interface AdminIssueReport {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_email: string;
}

export async function fetchAdminIssues(status?: string): Promise<AdminIssueReport[]> {
  const { data } = await api.get<AdminIssueReport[]>("/api/v1/admin/issues", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function updateIssueStatus(
  issueId: string,
  payload: { status: string; admin_response?: string }
): Promise<AdminIssueReport> {
  const { data } = await api.put<AdminIssueReport>(`/api/v1/admin/issues/${issueId}/status`, payload);
  return data;
}