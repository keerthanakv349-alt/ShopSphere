import { api } from "@/lib/api";
import type { Brand, Category, PaginatedProducts, ProductDetail, ProductListParams } from "@/types/catalog";

export async function fetchProducts(params: ProductListParams): Promise<PaginatedProducts> {
  const { data } = await api.get<PaginatedProducts>("/api/v1/products", { params });
  return data;
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/api/v1/products/${slug}`);
  return data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await api.get<Category[]>("/api/v1/categories");
  return data;
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data } = await api.get<Brand[]>("/api/v1/brands");
  return data;
}
