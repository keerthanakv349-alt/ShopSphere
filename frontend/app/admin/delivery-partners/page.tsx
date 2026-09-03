"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import toast from "react-hot-toast";

import { createDeliveryPartner, fetchDeliveryPartners, updateDeliveryPartner } from "@/lib/admin";
import { ErrorState } from "@/components/ErrorState";

interface DeliveryPartner {
  id: string;
  name: string;
  phone_number: string;
  vehicle_number: string | null;
  is_active: boolean;
}

export default function AdminDeliveryPartnersPage() {
  const queryClient = useQueryClient();

  const { data: partners, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "delivery-partners"],
    queryFn: fetchDeliveryPartners,
  });

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin", "delivery-partners"] });

  const createMutation = useMutation({
    mutationFn: createDeliveryPartner,
    onSuccess: () => {
      invalidate();
      resetForm();
      toast.success("Delivery partner added");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Couldn't add delivery partner");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateDeliveryPartner>[1] }) =>
      updateDeliveryPartner(id, payload),
    onSuccess: () => {
      invalidate();
      resetForm();
      toast.success("Delivery partner updated");
    },
    onError: (error: AxiosError<{ detail: string }>) => {
      toast.error(error.response?.data?.detail ?? "Couldn't update delivery partner");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateDeliveryPartner(id, { is_active: isActive }),
    onSuccess: (_, variables) => {
      invalidate();
      toast.success(variables.isActive ? "Partner activated" : "Partner deactivated");
    },
    onError: () => toast.error("Couldn't update status"),
  });

  function resetForm() {
    setName("");
    setPhoneNumber("");
    setVehicleNumber("");
    setEditingId(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phoneNumber.trim()) return;

    const payload = {
      name: name.trim(),
      phone_number: phoneNumber.trim(),
      vehicle_number: vehicleNumber.trim() || undefined,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  function handleEdit(partner: DeliveryPartner) {
    setEditingId(partner.id);
    setName(partner.name);
    setPhoneNumber(partner.phone_number);
    setVehicleNumber(partner.vehicle_number ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Delivery Partners</h1>
        <p className="mt-1 text-sm text-neutral-500">
          The courier roster used when marking an order shipped and adding tracking events.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid max-w-xl grid-cols-2 gap-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
      >
        <div className="col-span-2">
          <h2 className="mb-3 text-lg font-semibold">
            {editingId ? "Edit Delivery Partner" : "Add Delivery Partner"}
          </h2>
        </div>

        <input
          required
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-2 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />

        <input
          required
          placeholder="Phone number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />

        <input
          placeholder="Vehicle number (optional)"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />

        <div className="col-span-2 flex gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-md bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {createMutation.isPending
              ? "Adding…"
              : updateMutation.isPending
                ? "Saving…"
                : editingId
                  ? "Save Changes"
                  : "Add Partner"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm dark:border-neutral-700"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Loading…</p>
      ) : isError ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <div className="flex flex-col gap-2">
          {partners?.map((partner) => (
            <div
              key={partner.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 text-sm dark:border-neutral-800"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{partner.name}</p>
                <p className="text-xs text-neutral-500">
                  {partner.phone_number}
                  {partner.vehicle_number ? ` · ${partner.vehicle_number}` : ""}
                </p>
              </div>

              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  partner.is_active
                    ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                    : "bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
                }`}
              >
                {partner.is_active ? "Active" : "Inactive"}
              </span>

              <button
                onClick={() => handleEdit(partner)}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700"
              >
                Edit
              </button>

              <button
                onClick={() => toggleActiveMutation.mutate({ id: partner.id, isActive: !partner.is_active })}
                disabled={toggleActiveMutation.isPending}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs dark:border-neutral-700"
              >
                {partner.is_active ? "Deactivate" : "Activate"}
              </button>
            </div>
          ))}
          {partners?.length === 0 && (
            <p className="text-sm text-neutral-500">No delivery partners yet — add one above.</p>
          )}
        </div>
      )}
    </div>
  );
}
