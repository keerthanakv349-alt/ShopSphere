"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { fetchSettings, updateSettings } from "@/lib/admin";
import { ErrorState } from "@/components/ErrorState";

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchSettings,
  });

  const [storeName, setStoreName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [defaultShippingCharge, setDefaultShippingCharge] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Populate the form once settings load — a fetch, not a form default,
  // so this only needs to run when the query result actually arrives.
  useEffect(() => {
    if (!data) return;
    setStoreName(data.store_name);
    setSupportEmail(data.support_email ?? "");
    setSupportPhone(data.support_phone ?? "");
    setCurrencyCode(data.currency_code);
    setDefaultShippingCharge(data.default_shipping_charge);
    setLowStockThreshold(String(data.low_stock_threshold));
    setMaintenanceMode(data.maintenance_mode);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      toast.success("Settings saved");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Couldn't save settings");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;

    // Only send fields that actually changed from what was loaded — the
    // backend logs each update to the audit log by field name, so
    // submitting every field every time would make that log say "changed
    // everything" on every save, even a one-field tweak.
    const current = {
      store_name: storeName.trim(),
      support_email: supportEmail.trim() || null,
      support_phone: supportPhone.trim() || null,
      currency_code: currencyCode.trim().toUpperCase(),
      default_shipping_charge: defaultShippingCharge,
      low_stock_threshold: Number(lowStockThreshold),
      maintenance_mode: maintenanceMode,
    };

    const original = {
      store_name: data.store_name,
      support_email: data.support_email,
      support_phone: data.support_phone,
      currency_code: data.currency_code,
      default_shipping_charge: data.default_shipping_charge,
      low_stock_threshold: data.low_stock_threshold,
      maintenance_mode: data.maintenance_mode,
    };

    const changes = Object.fromEntries(
      Object.entries(current).filter(
        ([key, value]) => value !== original[key as keyof typeof original]
      )
    );

    if (Object.keys(changes).length === 0) {
      toast("No changes to save");
      return;
    }

    updateMutation.mutate(changes);
  }

  if (isLoading) return <p className="text-sm text-neutral-500">Loading…</p>;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Store-wide defaults used across the site — shipping cost, low-stock alerts, and contact info.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid max-w-xl grid-cols-2 gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
      >
        <div className="col-span-2">
          <label className="mb-1 block text-xs text-neutral-500">Store name</label>
          <input
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">Support email</label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            placeholder="help@yourstore.com"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">Support phone</label>
          <input
            value={supportPhone}
            onChange={(e) => setSupportPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">Currency code</label>
          <input
            required
            maxLength={3}
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm uppercase dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-neutral-500">Default shipping charge (₹)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={defaultShippingCharge}
            onChange={(e) => setDefaultShippingCharge(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
        </div>

        <div className="col-span-2">
          <label className="mb-1 block text-xs text-neutral-500">
            Low-stock alert threshold (units)
          </label>
          <input
            required
            type="number"
            min="0"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Variants at or below this stock level show up as "low stock" on the dashboard and inventory page.
          </p>
        </div>

        <label className="col-span-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={maintenanceMode}
            onChange={(e) => setMaintenanceMode(e.target.checked)}
          />
          Maintenance mode
        </label>

        <div className="col-span-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {updateMutation.isPending ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
