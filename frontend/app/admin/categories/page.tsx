"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { createCategory, deleteCategory, updateCategory } from "@/lib/admin";
import { fetchCategories } from "@/lib/catalog";
import { ErrorState } from "@/components/ErrorState";
import { getErrorMessage } from "@/lib/error-message";

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");

  const { data: categories, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const createMutation = useMutation({
    mutationFn: (categoryName: string) => createCategory(categoryName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      toast.success("Category created");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingId("");
      setEditingName("");
      toast.success("Category updated");
    },
    onError: (err) => {
      toast.error(getErrorMessage(err));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: string) => deleteCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Category deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Categories</h1>

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
          placeholder="New category name"
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
          {categories?.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              {editingId === category.id ? (
                <input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="rounded border border-neutral-300 px-2 py-1 text-sm dark:border-neutral-700 dark:bg-neutral-900"
                />
              ) : (
                <span>{category.name}</span>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">
                  /{category.slug}
                </span>

                {editingId === category.id ? (
                  <>
                    <button
                      onClick={() =>
                        updateMutation.mutate({
                          id: category.id,
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
                  <>
                    <button
                      onClick={() => {
                        setEditingId(category.id);
                        setEditingName(category.name);
                      }}
                      className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Delete category "${category.name}"? This only works if no products (active or inactive) are assigned to it.`
                          )
                        ) {
                          deleteMutation.mutate(category.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="rounded border border-red-300 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {categories?.length === 0 && <p className="text-sm text-neutral-500">No categories yet.</p>}
        </div>
      )}
    </div>
  );
}