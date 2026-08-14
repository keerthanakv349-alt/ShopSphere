"use client";

import { useEffect, useState } from "react";

import {
  fetchInventory,
  InventoryItem,
  updateInventoryStock,
  InventoryResponse,
} from "@/lib/admin";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryResponse | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [newStock, setNewStock] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);

  const [stockFilter, setStockFilter] = useState<
  "all" | "low" | "out"
>("all");

  async function loadInventory() {
    try {
      setLoading(true);
      setError("");

      const data = await fetchInventory({
  search: search.trim() || undefined,
  low_stock_only: stockFilter === "low",
  out_of_stock_only: stockFilter === "out",
});
      setInventory(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  async function applyStockFilter(
  filter: "all" | "low" | "out"
) {
  try {
    setStockFilter(filter);
    setLoading(true);
    setError("");

    const data = await fetchInventory({
      search: search.trim() || undefined,
      low_stock_only: filter === "low",
      out_of_stock_only: filter === "out",
    });

    setInventory(data);
  } catch (err) {
    console.error(err);
    setError("Failed to load inventory.");
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadInventory();
  }, []);

  function getStockStatus(quantity: number) {
    if (quantity <= 0) {
      return {
        label: "Out of Stock",
        className: "bg-red-100 text-red-700",
      };
    }

    if (quantity <= 5) {
      return {
        label: "Low Stock",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "In Stock",
      className: "bg-green-100 text-green-700",
    };
  }

  async function handleUpdateStock() {
  if (!editingItem) return;

  const quantity = Number(newStock);

  if (!Number.isInteger(quantity) || quantity < 0) {
    setError("Stock quantity must be a valid number greater than or equal to 0.");
    return;
  }

  try {
    setUpdatingStock(true);
    setError("");

    await updateInventoryStock(
      editingItem.variant_id,
      quantity
    );

    setEditingItem(null);
    setNewStock("");

    await loadInventory();
  } catch (err) {
    console.error(err);
    setError("Failed to update stock.");
  } finally {
    setUpdatingStock(false);
  }
}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Inventory
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Monitor and manage product stock levels.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Variants
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {inventory?.total_variants ?? 0}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Units
          </p>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {inventory?.total_units ?? 0}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Low / Out of Stock
          </p>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {(inventory?.low_stock_count ?? 0) +
              (inventory?.out_of_stock_count ?? 0)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search product or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                loadInventory();
              }
            }}
            className="w-full rounded-lg border px-4 py-2 text-sm outline-none focus:border-black"
          />

          <button
            onClick={loadInventory}
            className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Search
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
  <button
    onClick={() => {
      setStockFilter("all");
      loadInventory();
    }}
    className={`rounded-lg px-4 py-2 text-sm font-medium ${
      stockFilter === "all"
        ? "bg-black text-white"
        : "border bg-white text-gray-700 hover:bg-gray-50"
    }`}
  >
    All Stock
  </button>

  <button
    onClick={() => {
      setStockFilter("low");
      loadInventory();
    }}
    className={`rounded-lg px-4 py-2 text-sm font-medium ${
      stockFilter === "low"
        ? "bg-yellow-500 text-white"
        : "border bg-white text-gray-700 hover:bg-gray-50"
    }`}
  >
    Low Stock
  </button>

  <button
    onClick={() => {
      setStockFilter("out");
      loadInventory();
    }}
    className={`rounded-lg px-4 py-2 text-sm font-medium ${
      stockFilter === "out"
        ? "bg-red-600 text-white"
        : "border bg-white text-gray-700 hover:bg-gray-50"
    }`}
  >
    Out of Stock
  </button>
</div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Product
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  SKU
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Size
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Color
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Stock
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase text-gray-500">
                Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    Loading inventory...
                  </td>
                </tr>
              ) : inventory?.items.length ? (
                inventory.items.map((item: InventoryItem) => {
                  const status = getStockStatus(
                    item.stock_quantity
                  );

                  return (
                    <tr
                      key={item.variant_id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {item.product_name}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.sku}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.size}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {item.color}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">
                        {item.stock_quantity}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
  <button
    onClick={() => {
      setEditingItem(item);
      setNewStock(String(item.stock_quantity));
    }}
    className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
  >
    Edit Stock
  </button>
</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-sm text-gray-500"
                  >
                    No inventory items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {editingItem && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
      <h2 className="text-xl font-bold text-gray-900">
        Update Stock
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Update the available stock for this variant.
      </p>

      <div className="mt-5 space-y-3 rounded-lg bg-gray-50 p-4">
        <div>
          <p className="text-xs text-gray-500">
            Product
          </p>
          <p className="font-medium text-gray-900">
            {editingItem.product_name}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">
              Size
            </p>
            <p className="font-medium">
              {editingItem.size}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500">
              Color
            </p>
            <p className="font-medium">
              {editingItem.color}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500">
            SKU
          </p>
          <p className="font-medium">
            {editingItem.sku}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label className="text-sm font-medium text-gray-700">
          Stock Quantity
        </label>

        <input
          type="number"
          min="0"
          value={newStock}
          onChange={(e) => setNewStock(e.target.value)}
          className="mt-2 w-full rounded-lg border px-4 py-2 outline-none focus:border-black"
        />
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={() => {
            setEditingItem(null);
            setNewStock("");
          }}
          disabled={updatingStock}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          onClick={handleUpdateStock}
          disabled={updatingStock}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {updatingStock ? "Updating..." : "Update Stock"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}