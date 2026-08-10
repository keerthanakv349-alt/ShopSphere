"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
// import { createBrand } from "@/lib/admin";

import { createBrand, updateBrand } from "@/lib/admin";
import { fetchBrands } from "@/lib/catalog";
import { ErrorState } from "@/components/ErrorState";
import { getErrorMessage } from "@/lib/error-message";

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState("");
const [editingName, setEditingName] = useState("");

  const { data: brands, isLoading, isError, error, refetch } = useQuery({ queryKey: ["brands"], queryFn: fetchBrands });

  const createMutation = useMutation({
    mutationFn: (brandName: string) => createBrand(brandName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      setName("");
      toast.success("Brand created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });


  const updateMutation = useMutation({
  mutationFn: ({ id, name }: { id: string; name: string }) =>
    updateBrand(id, name),

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["brands"],
    });

    setEditingId("");
    setEditingName("");

    toast.success("Brand updated");
  },

  onError: (err) => {
    toast.error(getErrorMessage(err));
  },
});

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Brands</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (name.trim()) createMutation.mutate(name.trim());
        }}
        className="mb-6 flex gap-2"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New brand name"
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-2">
          {brands?.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              {/* <span>{brand.name}</span> */}
              {editingId === brand.id ? (
  <input
    value={editingName}
    onChange={(e) => setEditingName(e.target.value)}
    className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
  />
) : (
  <span>{brand.name}</span>
)}
              {/* <span className="text-xs text-neutral-500">/{brand.slug}</span> */}

              <div className="flex items-center gap-2">
  <span className="text-xs text-neutral-500">
    /{brand.slug}
  </span>

  {editingId === brand.id ? (
    <>
      <button
        onClick={() =>
          updateMutation.mutate({
            id: brand.id,
            name: editingName,
          })
        }
        className="rounded bg-green-600 px-2 py-1 text-xs text-white"
      >
        Save
      </button>

      <button
        onClick={() => {
          setEditingId("");
          setEditingName("");
        }}
        className="rounded bg-gray-500 px-2 py-1 text-xs text-white"
      >
        Cancel
      </button>
    </>
  ) : (
    <button
      onClick={() => {
        setEditingId(brand.id);
        setEditingName(brand.name);
      }}
      className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
    >
      Edit
    </button>
  )}
</div>
            </div>
          ))}
          {brands?.length === 0 && <p className="text-sm text-neutral-500">No brands yet.</p>}
        </div>
      )}
    </div>
  );
}
