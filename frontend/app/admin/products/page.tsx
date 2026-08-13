

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { deleteProduct, fetchAdminProducts, uploadProductImage } from "@/lib/admin";
import { getMediaUrl } from "@/lib/media";
import { formatINR } from "@/lib/price";
import { ErrorState } from "@/components/ErrorState";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
  draft: "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400",
  inactive: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
};

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => fetchAdminProducts(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product deactivated");
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ productId, file }: { productId: string; file: File }) =>
      uploadProductImage(productId, file, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Image uploaded");
    },
    onError: () => toast.error("Upload failed — check file type and size (max 8MB)"),
    onSettled: () => setUploadingFor(null),
  });

  function handleImageButtonClick(productId: string) {
    setUploadingFor(productId);
    fileInputRef.current?.click();
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && uploadingFor) {
      uploadMutation.mutate({ productId: uploadingFor, file });
    }
    e.target.value = "";
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new" className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white">
          + Add Product
        </Link>
      </div>

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelected} />

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-2">
          {data?.items.map((product) => {
            return (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
              >
                <div className="h-14 w-12 flex-shrink-0 overflow-hidden rounded bg-neutral-100 dark:bg-neutral-900">
                  {getMediaUrl(product.primary_image_url) && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getMediaUrl(product.primary_image_url)!}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{product.name}</p>
                  <p className="text-xs text-neutral-500">
                    {product.category.name} · {product.brand.name}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[product.status]}`}>
                  {product.status}
                </span>
                <p className="w-20 text-right font-medium">{formatINR(parseFloat(product.base_price))}</p>
                <button
                  onClick={() => handleImageButtonClick(product.id)}
                  disabled={uploadMutation.isPending}
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700"
                >
                  {uploadMutation.isPending && uploadingFor === product.id ? "Uploading…" : "+ Image"}
                </button>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700"
                >
                  Edit
                </Link>
                {product.status !== "inactive" && (
                  <button
                    onClick={() => deleteMutation.mutate(product.id)}
                    className="text-xs text-neutral-500 underline hover:text-red-500"
                  >
                    Deactivate
                  </button>
                )}
              </div>
            );
          })}
          {data?.items.length === 0 && <p className="text-sm text-neutral-500">No products yet.</p>}
        </div>
      )}
    </div>
  );
}
