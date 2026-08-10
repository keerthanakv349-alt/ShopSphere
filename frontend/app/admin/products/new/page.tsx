"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { createProduct } from "@/lib/admin";
import { fetchBrands, fetchCategories } from "@/lib/catalog";
import type { ProductStatus } from "@/types/catalog";
import type { ProductVariantInput } from "@/types/admin";

const emptyVariant = (): ProductVariantInput => ({ sku: "", size: "", color: "", stock_quantity: 0 });

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: brands } = useQuery({ queryKey: ["brands"], queryFn: fetchBrands });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState("0");
  const [gstPercentage, setGstPercentage] = useState("0");
  const [productStatus, setProductStatus] = useState<ProductStatus>("draft");
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<ProductVariantInput[]>([emptyVariant()]);

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product created");
      router.push("/admin/products");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Couldn't create product");
    },
  });

  function updateVariant(index: number, field: keyof ProductVariantInput, value: string | number) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId || !brandId) {
      toast.error("Please select a category and brand");
      return;
    }
    if (variants.some((v) => !v.sku.trim())) {
      toast.error("Every variant needs a SKU");
      return;
    }
    createMutation.mutate({
      name,
      description,
      category_id: categoryId,
      brand_id: brandId,
      base_price: basePrice,
      discount_percentage: discountPercentage,
      gst_percentage: gstPercentage,
      status: productStatus,
      is_featured: isFeatured,
      variants: variants.map((v) => ({
        ...v,
        stock_quantity: Number(v.stock_quantity),
        size: v.size || undefined,
        color: v.color || undefined,
      })),
    });
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add Product</h1>

      <form onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-4">
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
            </select>
          </div>
          <label className="flex items-center gap-2 pt-5 text-sm">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured
          </label>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-sm font-medium">Variants (size / color / stock)</label>
            <button
              type="button"
              onClick={() => setVariants((prev) => [...prev, emptyVariant()])}
              className="text-xs text-brand hover:underline"
            >
              + Add variant
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {variants.map((variant, i) => (
              <div key={i} className="grid grid-cols-5 gap-2">
                <input
                  required
                  placeholder="SKU"
                  value={variant.sku}
                  onChange={(e) => updateVariant(i, "sku", e.target.value)}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                <input
                  placeholder="Size"
                  value={variant.size}
                  onChange={(e) => updateVariant(i, "size", e.target.value)}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                <input
                  placeholder="Color"
                  value={variant.color}
                  onChange={(e) => updateVariant(i, "color", e.target.value)}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                <input
                  required
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={variant.stock_quantity}
                  onChange={(e) => updateVariant(i, "stock_quantity", e.target.value)}
                  className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-xs text-neutral-500 hover:text-red-500"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="mt-2 rounded-md bg-brand px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {createMutation.isPending ? "Creating…" : "Create Product"}
        </button>
      </form>
    </div>
  );
}
