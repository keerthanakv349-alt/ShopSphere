"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  createProductVariant,
  deleteProductImage,
  fetchAdminProduct,
  setPrimaryImage,
  updateProduct,
  updateProductVariant,
  uploadProductImage,
} from "@/lib/admin";
import { fetchBrands, fetchCategories } from "@/lib/catalog";
import { getMediaUrl } from "@/lib/media";
import { ErrorState } from "@/components/ErrorState";
import type { ProductStatus } from "@/types/catalog";
import type { ProductVariantInput } from "@/types/admin";

const emptyVariant = (): ProductVariantInput => ({ sku: "", size: "", color: "", stock_quantity: 0 });

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: brands } = useQuery({ queryKey: ["brands"], queryFn: fetchBrands });

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin", "product", productId],
    queryFn: () => fetchAdminProduct(productId),
    enabled: Boolean(productId),
  });

  // --- Core product fields ---
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [gstPercentage, setGstPercentage] = useState("0");
  const [productStatus, setProductStatus] = useState<ProductStatus>("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  // --- Existing variant edits (variantId -> draft fields) ---
  const [variantDrafts, setVariantDrafts] = useState<Record<string, ProductVariantInput>>({});
  const [newVariant, setNewVariant] = useState<ProductVariantInput | null>(null);

  // Populate the form once the product loads. Only runs when a fresh
  // product object arrives (id change), so it never clobbers in-progress
  // edits on an unrelated re-render.
  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setDescription(product.description);
    setCategoryId(product.category.id);
    setBrandId(product.brand.id);
    setBasePrice(product.base_price);
    setDiscountPercentage(product.discount_percentage);
    setGstPercentage(product.gst_percentage);
    setProductStatus(product.status);
    setIsFeatured(product.is_featured);
    setIsTrending(product.is_trending);
    setVariantDrafts(
      Object.fromEntries(
        product.variants.map((v) => [
          v.id,
          {
            sku: v.sku,
            size: v.size ?? "",
            color: v.color ?? "",
            stock_quantity: v.stock_quantity,
            price_override: v.price_override ?? "",
          },
        ])
      )
    );
  }, [product]);

  const updateProductMutation = useMutation({
    mutationFn: () =>
      updateProduct(productId, {
        name,
        description,
        category_id: categoryId,
        brand_id: brandId,
        base_price: basePrice,
        discount_percentage: discountPercentage,
        gst_percentage: gstPercentage,
        status: productStatus,
        is_featured: isFeatured,
        is_trending: isTrending,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] });
      toast.success("Product updated");
    },
    onError: (err: AxiosError<{ detail: string }>) => {
      toast.error(err.response?.data?.detail ?? "Couldn't update product");
    },
  });

  const updateVariantMutation = useMutation({
    mutationFn: ({ variantId, payload }: { variantId: string; payload: ProductVariantInput }) =>
      updateProductVariant(productId, variantId, {
        sku: payload.sku,
        size: payload.size || undefined,
        color: payload.color || undefined,
        stock_quantity: Number(payload.stock_quantity),
        price_override: payload.price_override || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Variant updated");
    },
    onError: (err: AxiosError<{ detail: string }>) => {
      toast.error(err.response?.data?.detail ?? "Couldn't update variant");
    },
  });

  const createVariantMutation = useMutation({
    mutationFn: (payload: ProductVariantInput) =>
      createProductVariant(productId, {
        ...payload,
        stock_quantity: Number(payload.stock_quantity),
        size: payload.size || undefined,
        color: payload.color || undefined,
        price_override: payload.price_override || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Variant added");
      setNewVariant(null);
    },
    onError: (err: AxiosError<{ detail: string }>) => {
      toast.error(err.response?.data?.detail ?? "Couldn't add variant");
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => uploadProductImage(productId, file, (product?.images.length ?? 0) === 0),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Image uploaded");
    },
    onError: () => toast.error("Upload failed — check file type and size (max 8MB)"),
  });

  const setPrimaryMutation = useMutation({
    mutationFn: (imageId: string) => setPrimaryImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Primary image updated");
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => deleteProductImage(productId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Image deleted");
    },
  });

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadImageMutation.mutate(file);
    e.target.value = "";
  }

  function updateDraft(variantId: string, field: keyof ProductVariantInput, value: string | number) {
    setVariantDrafts((prev) => ({ ...prev, [variantId]: { ...prev[variantId], [field]: value } }));
  }

  function handleProductSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId || !brandId) {
      toast.error("Please select a category and brand");
      return;
    }
    updateProductMutation.mutate();
  }

  if (isLoading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;
  if (!product) return null;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Product</h1>
        <Link href="/admin/products" className="text-sm text-neutral-500 underline">
          Back to products
        </Link>
      </div>

      {/* --- Core fields --- */}
      <form onSubmit={handleProductSubmit} className="flex max-w-2xl flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Product name</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Category</label>
            <select
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="">Select…</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Brand</label>
            <select
              required
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="">Select…</option>
              {brands?.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Base price (₹)</label>
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Discount %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">GST %</label>
            <input
              type="number"
              min="0"
              max="100"
              value={gstPercentage}
              onChange={(e) => setGstPercentage(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Status</label>
            <select
              value={productStatus}
              onChange={(e) => setProductStatus(e.target.value as ProductStatus)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <label className="flex items-center gap-2 pt-5 text-sm">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured
          </label>
          <label className="flex items-center gap-2 pt-5 text-sm">
            <input type="checkbox" checked={isTrending} onChange={(e) => setIsTrending(e.target.checked)} />
            Trending
          </label>
        </div>

        <button
          type="submit"
          disabled={updateProductMutation.isPending}
          className="mt-2 w-fit rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {updateProductMutation.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>

      {/* --- Variants (size / color / stock) --- */}
      <div className="mt-10 max-w-2xl">
        <h2 className="mb-3 text-lg font-semibold">Variants &amp; stock</h2>
        <div className="flex flex-col gap-2">
          {product.variants.map((variant) => {
            const draft = variantDrafts[variant.id] ?? emptyVariant();
            return (
              <div key={variant.id} className="grid grid-cols-6 items-center gap-2">
                <input
                  placeholder="SKU"
                  value={draft.sku}
                  onChange={(e) => updateDraft(variant.id, "sku", e.target.value)}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                <input
                  placeholder="Size"
                  value={draft.size}
                  onChange={(e) => updateDraft(variant.id, "size", e.target.value)}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                <input
                  placeholder="Color"
                  value={draft.color}
                  onChange={(e) => updateDraft(variant.id, "color", e.target.value)}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                <input
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={draft.stock_quantity}
                  onChange={(e) => updateDraft(variant.id, "stock_quantity", e.target.value)}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Price override"
                  value={draft.price_override}
                  onChange={(e) => updateDraft(variant.id, "price_override", e.target.value)}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                <button
                  type="button"
                  onClick={() => updateVariantMutation.mutate({ variantId: variant.id, payload: draft })}
                  disabled={updateVariantMutation.isPending}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-xs dark:border-neutral-700"
                >
                  Save
                </button>
              </div>
            );
          })}

          {newVariant ? (
            <div className="grid grid-cols-6 items-center gap-2">
              <input
                placeholder="SKU"
                value={newVariant.sku}
                onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              <input
                placeholder="Size"
                value={newVariant.size}
                onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              <input
                placeholder="Color"
                value={newVariant.color}
                onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              <input
                type="number"
                min="0"
                placeholder="Stock"
                value={newVariant.stock_quantity}
                onChange={(e) => setNewVariant({ ...newVariant, stock_quantity: Number(e.target.value) })}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price override"
                value={newVariant.price_override ?? ""}
                onChange={(e) => setNewVariant({ ...newVariant, price_override: e.target.value })}
                className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newVariant.sku.trim()) {
                    toast.error("New variant needs a SKU");
                    return;
                  }
                  createVariantMutation.mutate(newVariant);
                }}
                disabled={createVariantMutation.isPending}
                className="rounded-md bg-brand px-2 py-1.5 text-xs text-white"
              >
                Add
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setNewVariant(emptyVariant())}
              className="mt-1 w-fit text-xs text-brand hover:underline"
            >
              + Add variant
            </button>
          )}
        </div>
      </div>

      {/* --- Images --- */}
      <div className="mt-10 max-w-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Images</h2>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadImageMutation.isPending}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs dark:border-neutral-700"
          >
            {uploadImageMutation.isPending ? "Uploading…" : "+ Upload image"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelected}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {product.images.map((image) => (
            <div key={image.id} className="flex flex-col gap-2">
              <div className="aspect-[4/5] overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={getMediaUrl(image.image_url)!} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex items-center justify-between text-xs">
                {image.is_primary ? (
                  <span className="font-medium text-brand">Primary</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPrimaryMutation.mutate(image.id)}
                    className="text-neutral-500 underline"
                  >
                    Set primary
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteImageMutation.mutate(image.id)}
                  className="text-neutral-500 underline hover:text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {product.images.length === 0 && <p className="text-sm text-neutral-500">No images yet.</p>}
        </div>
      </div>
    </div>
  );
}
