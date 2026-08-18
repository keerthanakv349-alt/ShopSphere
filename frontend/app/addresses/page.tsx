// "use client";

// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import toast from "react-hot-toast";
// import {
//   FiArrowLeft,
//   FiMapPin,
//   FiPlus,
//   FiTrash2,
//   FiCheck,
// } from "react-icons/fi";

// import { api } from "@/lib/api";
// import { ErrorState } from "@/components/ErrorState";

// type Address = {
//   id: string;
//   label: string;
//   full_name: string;
//   phone_number: string;
//   line1: string;
//   line2: string;
//   city: string;
//   state: string;
//   postal_code: string;
//   country: string;
//   is_default: boolean;
// };

// type AddressForm = {
//   label: string;
//   full_name: string;
//   phone_number: string;
//   line1: string;
//   line2: string;
//   city: string;
//   state: string;
//   postal_code: string;
//   country: string;
//   is_default: boolean;
// };

// const emptyForm: AddressForm = {
//   label: "Home",
//   full_name: "",
//   phone_number: "",
//   line1: "",
//   line2: "",
//   city: "",
//   state: "",
//   postal_code: "",
//   country: "India",
//   is_default: false,
// };

// async function fetchAddresses(): Promise<Address[]> {
//   const { data } = await api.get<Address[]>("/api/v1/addresses");
//   return data;
// }

// async function createAddress(payload: AddressForm): Promise<Address> {
//   const { data } = await api.post<Address>("/api/v1/addresses", payload);
//   return data;
// }

// async function deleteAddress(addressId: string): Promise<void> {
//   await api.delete(`/api/v1/addresses/${addressId}`);
// }

// export default function AddressesPage() {
//   const router = useRouter();
//   const queryClient = useQueryClient();

//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState<AddressForm>(emptyForm);

//   const {
//     data: addresses,
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ["addresses"],
//     queryFn: fetchAddresses,
//   });

//   const createMutation = useMutation({
//     mutationFn: createAddress,

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["addresses"],
//       });

//       setForm(emptyForm);
//       setShowForm(false);

//       toast.success("Address added successfully");
//     },

//     onError: (error: any) => {
//       toast.error(
//         error?.response?.data?.detail ??
//           "Couldn't add address"
//       );
//     },
//   });

//   const deleteMutation = useMutation({
//     mutationFn: deleteAddress,

//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["addresses"],
//       });

//       toast.success("Address deleted");
//     },

//     onError: (error: any) => {
//       toast.error(
//         error?.response?.data?.detail ??
//           "Couldn't delete address"
//       );
//     },
//   });

//   function updateField(
//     field: keyof AddressForm,
//     value: string | boolean
//   ) {
//     setForm((previous) => ({
//       ...previous,
//       [field]: value,
//     }));
//   }

//   function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     if (
//       !form.full_name.trim() ||
//       !form.phone_number.trim() ||
//       !form.line1.trim() ||
//       !form.city.trim() ||
//       !form.state.trim() ||
//       !form.postal_code.trim()
//     ) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     createMutation.mutate(form);
//   }

//   function handleDelete(address: Address) {
//     const confirmed = window.confirm(
//       `Delete the "${address.label}" address?`
//     );

//     if (!confirmed) return;

//     deleteMutation.mutate(address.id);
//   }

//   return (
//     <main className="min-h-screen bg-neutral-50 px-4 py-6">
//       <div className="mx-auto w-full max-w-2xl">

//         {/* Header */}
//         <div className="mb-6 flex items-center gap-4">
//           <button
//             type="button"
//             onClick={() => router.back()}
//             className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition hover:bg-neutral-100"
//             aria-label="Go back"
//           >
//             <FiArrowLeft size={20} />
//           </button>

//           <div>
//             <h1 className="text-2xl font-bold text-neutral-900">
//               Addresses
//             </h1>

//             <p className="text-sm text-neutral-500">
//               Manage your delivery addresses
//             </p>
//           </div>
//         </div>

//         {/* Add Address Button */}
//         <button
//           type="button"
//           onClick={() => {
//             setForm(emptyForm);
//             setShowForm((value) => !value);
//           }}
//           className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
//         >
//           <FiPlus size={18} />

//           {showForm ? "Cancel" : "Add New Address"}
//         </button>

//         {/* Add Address Form */}
//         {showForm && (
//           <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
//             <h2 className="mb-5 text-lg font-semibold">
//               Add New Address
//             </h2>

//             <form
//               onSubmit={handleSubmit}
//               className="space-y-4"
//             >
//               {/* Label */}
//               <div>
//                 <label className="mb-1 block text-sm font-medium">
//                   Address Type
//                 </label>

//                 <select
//                   value={form.label}
//                   onChange={(event) =>
//                     updateField("label", event.target.value)
//                   }
//                   className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
//                 >
//                   <option value="Home">Home</option>
//                   <option value="Work">Work</option>
//                   <option value="Other">Other</option>
//                 </select>
//               </div>

//               {/* Full Name */}
//               <div>
//                 <label className="mb-1 block text-sm font-medium">
//                   Full Name *
//                 </label>

//                 <input
//                   value={form.full_name}
//                   onChange={(event) =>
//                     updateField(
//                       "full_name",
//                       event.target.value
//                     )
//                   }
//                   placeholder="Enter full name"
//                   className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
//                 />
//               </div>

//               {/* Phone */}
//               <div>
//                 <label className="mb-1 block text-sm font-medium">
//                   Phone Number *
//                 </label>

//                 <input
//                   value={form.phone_number}
//                   onChange={(event) =>
//                     updateField(
//                       "phone_number",
//                       event.target.value
//                     )
//                   }
//                   placeholder="Enter phone number"
//                   inputMode="tel"
//                   className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
//                 />
//               </div>

//               {/* Address Line 1 */}
//               <div>
//                 <label className="mb-1 block text-sm font-medium">
//                   Address Line 1 *
//                 </label>

//                 <input
//                   value={form.line1}
//                   onChange={(event) =>
//                     updateField(
//                       "line1",
//                       event.target.value
//                     )
//                   }
//                   placeholder="House number, street, area"
//                   className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
//                 />
//               </div>

//               {/* Address Line 2 */}
//               <div>
//                 <label className="mb-1 block text-sm font-medium">
//                   Address Line 2
//                 </label>

//                 <input
//                   value={form.line2}
//                   onChange={(event) =>
//                     updateField(
//                       "line2",
//                       event.target.value
//                     )
//                   }
//                   placeholder="Apartment, landmark, etc."
//                   className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
//                 />
//               </div>

//               {/* City / State */}
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                 <div>
//                   <label className="mb-1 block text-sm font-medium">
//                     City *
//                   </label>

//                   <input
//                     value={form.city}
//                     onChange={(event) =>
//                       updateField(
//                         "city",
//                         event.target.value
//                       )
//                     }
//                     placeholder="City"
//                     className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
//                   />
//                 </div>

//                 <div>
//                   <label className="mb-1 block text-sm font-medium">
//                     State *
//                   </label>

//                   <input
//                     value={form.state}
//                     onChange={(event) =>
//                       updateField(
//                         "state",
//                         event.target.value
//                       )
//                     }
//                     placeholder="State"
//                     className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
//                   />
//                 </div>
//               </div>

//               {/* Postal / Country */}
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                 <div>
//                   <label className="mb-1 block text-sm font-medium">
//                     Postal Code *
//                   </label>

//                   <input
//                     value={form.postal_code}
//                     onChange={(event) =>
//                       updateField(
//                         "postal_code",
//                         event.target.value
//                       )
//                     }
//                     placeholder="Postal code"
//                     inputMode="numeric"
//                     className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
//                   />
//                 </div>

//                 <div>
//                   <label className="mb-1 block text-sm font-medium">
//                     Country
//                   </label>

//                   <input
//                     value={form.country}
//                     onChange={(event) =>
//                       updateField(
//                         "country",
//                         event.target.value
//                       )
//                     }
//                     className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
//                   />
//                 </div>
//               </div>

//               {/* Default */}
//               <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-neutral-50 p-3">
//                 <input
//                   type="checkbox"
//                   checked={form.is_default}
//                   onChange={(event) =>
//                     updateField(
//                       "is_default",
//                       event.target.checked
//                     )
//                   }
//                   className="h-4 w-4 accent-brand"
//                 />

//                 <span className="text-sm">
//                   Make this my default address
//                 </span>
//               </label>

//               {/* Submit */}
//               <button
//                 type="submit"
//                 disabled={createMutation.isPending}
//                 className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
//               >
//                 {createMutation.isPending
//                   ? "Saving..."
//                   : "Save Address"}
//               </button>
//             </form>
//           </section>
//         )}

//         {/* Loading */}
//         {isLoading && (
//           <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
//             <p className="text-sm text-neutral-500">
//               Loading addresses...
//             </p>
//           </div>
//         )}

//         {/* Error */}
//         {isError && (
//           <ErrorState
//             error={error}
//             onRetry={refetch}
//           />
//         )}

//         {/* Address List */}
//         {!isLoading &&
//           !isError &&
//           addresses &&
//           addresses.length > 0 && (
//             <section>
//               <h2 className="mb-2 px-1 text-xs font-semibold tracking-wider text-neutral-400">
//                 SAVED ADDRESSES
//               </h2>

//               <div className="space-y-4">
//                 {addresses.map((address) => (
//                   <div
//                     key={address.id}
//                     className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
//                   >
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="flex min-w-0 gap-3">
//                         <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
//                           <FiMapPin size={18} />
//                         </div>

//                         <div className="min-w-0">
//                           <div className="mb-1 flex flex-wrap items-center gap-2">
//                             <h3 className="font-semibold text-neutral-900">
//                               {address.label}
//                             </h3>

//                             {address.is_default && (
//                               <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
//                                 <FiCheck size={12} />
//                                 Default
//                               </span>
//                             )}
//                           </div>

//                           <p className="text-sm font-medium">
//                             {address.full_name}
//                           </p>

//                           <p className="mt-1 text-sm text-neutral-500">
//                             {address.phone_number}
//                           </p>

//                           <p className="mt-2 text-sm leading-6 text-neutral-600">
//                             {address.line1}
//                             {address.line2
//                               ? `, ${address.line2}`
//                               : ""}
//                             <br />
//                             {address.city}, {address.state}{" "}
//                             {address.postal_code}
//                             <br />
//                             {address.country}
//                           </p>
//                         </div>
//                       </div>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           handleDelete(address)
//                         }
//                         disabled={deleteMutation.isPending}
//                         className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
//                         aria-label={`Delete ${address.label} address`}
//                       >
//                         <FiTrash2 size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </section>
//           )}

//         {/* Empty State */}
//         {!isLoading &&
//           !isError &&
//           addresses &&
//           addresses.length === 0 && (
//             <section className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
//               <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
//                 <FiMapPin size={24} />
//               </div>

//               <h2 className="font-semibold text-neutral-900">
//                 No addresses saved
//               </h2>

//               <p className="mt-1 text-sm text-neutral-500">
//                 Add an address to make checkout faster.
//               </p>
//             </section>
//           )}
//       </div>
//     </main>
//   );
// }

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiEdit2,
  FiStar,
} from "react-icons/fi";

import { api } from "@/lib/api";
import { ErrorState } from "@/components/ErrorState";

type Address = {
  id: string;
  label: string;
  full_name: string;
  phone_number: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

type AddressForm = {
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
};

const emptyForm: AddressForm = {
  label: "Home",
  full_name: "",
  phone_number: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "India",
  is_default: false,
};

/* -------------------------------------------------------------------------- */
/* API FUNCTIONS                                                              */
/* -------------------------------------------------------------------------- */

async function fetchAddresses(): Promise<Address[]> {
  const { data } = await api.get<Address[]>("/api/v1/addresses");
  return data;
}

async function createAddress(payload: AddressForm): Promise<Address> {
  const { data } = await api.post<Address>(
    "/api/v1/addresses",
    payload
  );
  return data;
}

async function updateAddress({
  addressId,
  payload,
}: {
  addressId: string;
  payload: AddressForm;
}): Promise<Address> {
  const { data } = await api.put<Address>(
    `/api/v1/addresses/${addressId}`,
    payload
  );

  return data;
}

async function setDefaultAddress(
  addressId: string
): Promise<Address> {
  const { data } = await api.patch<Address>(
    `/api/v1/addresses/${addressId}/default`
  );

  return data;
}

async function deleteAddress(
  addressId: string
): Promise<void> {
  await api.delete(`/api/v1/addresses/${addressId}`);
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function AddressesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(
    null
  );
  const [form, setForm] = useState<AddressForm>(emptyForm);

  /* ------------------------------------------------------------------------ */
  /* FETCH ADDRESSES                                                          */
  /* ------------------------------------------------------------------------ */

  const {
    data: addresses,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
  });

  /* ------------------------------------------------------------------------ */
  /* CREATE ADDRESS                                                           */
  /* ------------------------------------------------------------------------ */

  const createMutation = useMutation({
    mutationFn: createAddress,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["addresses"],
      });

      setForm(emptyForm);
      setShowForm(false);

      toast.success("Address added successfully");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail ??
          "Couldn't add address"
      );
    },
  });

  /* ------------------------------------------------------------------------ */
  /* UPDATE ADDRESS                                                           */
  /* ------------------------------------------------------------------------ */

  const updateMutation = useMutation({
    mutationFn: updateAddress,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["addresses"],
      });

      setForm(emptyForm);
      setEditingAddressId(null);
      setShowForm(false);

      toast.success("Address updated successfully");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail ??
          "Couldn't update address"
      );
    },
  });

  /* ------------------------------------------------------------------------ */
  /* SET DEFAULT ADDRESS                                                      */
  /* ------------------------------------------------------------------------ */

  const defaultMutation = useMutation({
    mutationFn: setDefaultAddress,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["addresses"],
      });

      toast.success("Default address updated");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail ??
          "Couldn't set default address"
      );
    },
  });

  /* ------------------------------------------------------------------------ */
  /* DELETE ADDRESS                                                           */
  /* ------------------------------------------------------------------------ */

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["addresses"],
      });

      toast.success("Address deleted");
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail ??
          "Couldn't delete address"
      );
    },
  });

  /* ------------------------------------------------------------------------ */
  /* FORM HELPERS                                                             */
  /* ------------------------------------------------------------------------ */

  function updateField(
    field: keyof AddressForm,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function openAddForm() {
    setEditingAddressId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEditForm(address: Address) {
    setEditingAddressId(address.id);

    setForm({
      label: address.label,
      full_name: address.full_name,
      phone_number: address.phone_number,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default,
    });

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    setShowForm(false);
    setEditingAddressId(null);
    setForm(emptyForm);
  }

  /* ------------------------------------------------------------------------ */
  /* SUBMIT FORM                                                              */
  /* ------------------------------------------------------------------------ */

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !form.full_name.trim() ||
      !form.phone_number.trim() ||
      !form.line1.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.postal_code.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingAddressId) {
      updateMutation.mutate({
        addressId: editingAddressId,
        payload: form,
      });
    } else {
      createMutation.mutate(form);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* DELETE                                                                   */
  /* ------------------------------------------------------------------------ */

  function handleDelete(address: Address) {
    const confirmed = window.confirm(
      `Delete the "${address.label}" address?`
    );

    if (!confirmed) return;

    deleteMutation.mutate(address.id);
  }

  /* ------------------------------------------------------------------------ */
  /* SET DEFAULT                                                              */
  /* ------------------------------------------------------------------------ */

  function handleSetDefault(address: Address) {
    if (address.is_default) return;

    defaultMutation.mutate(address.id);
  }

  const isSaving =
    createMutation.isPending ||
    updateMutation.isPending;

  /* ------------------------------------------------------------------------ */
  /* UI                                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-6">
      <div className="mx-auto w-full max-w-2xl">

        {/* ---------------------------------------------------------------- */}
        {/* HEADER                                                            */}
        {/* ---------------------------------------------------------------- */}

        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm transition hover:bg-neutral-100"
            aria-label="Go back"
          >
            <FiArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Addresses
            </h1>

            <p className="text-sm text-neutral-500">
              Manage your delivery addresses
            </p>
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* ADD ADDRESS BUTTON                                                */}
        {/* ---------------------------------------------------------------- */}

        {!showForm && (
          <button
            type="button"
            onClick={openAddForm}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark"
          >
            <FiPlus size={18} />
            Add New Address
          </button>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* FORM                                                              */}
        {/* ---------------------------------------------------------------- */}

        {showForm && (
          <section className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingAddressId
                  ? "Edit Address"
                  : "Add New Address"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Address Type */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Address Type
                </label>

                <select
                  value={form.label}
                  onChange={(event) =>
                    updateField(
                      "label",
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Full Name *
                </label>

                <input
                  value={form.full_name}
                  onChange={(event) =>
                    updateField(
                      "full_name",
                      event.target.value
                    )
                  }
                  placeholder="Enter full name"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phone Number *
                </label>

                <input
                  value={form.phone_number}
                  onChange={(event) =>
                    updateField(
                      "phone_number",
                      event.target.value
                    )
                  }
                  placeholder="Enter phone number"
                  inputMode="tel"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>

              {/* Line 1 */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Address Line 1 *
                </label>

                <input
                  value={form.line1}
                  onChange={(event) =>
                    updateField(
                      "line1",
                      event.target.value
                    )
                  }
                  placeholder="House number, street, area"
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>

              {/* Line 2 */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Address Line 2
                </label>

                <input
                  value={form.line2}
                  onChange={(event) =>
                    updateField(
                      "line2",
                      event.target.value
                    )
                  }
                  placeholder="Apartment, landmark, etc."
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>

              {/* City / State */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    City *
                  </label>

                  <input
                    value={form.city}
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target.value
                      )
                    }
                    placeholder="City"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    State *
                  </label>

                  <input
                    value={form.state}
                    onChange={(event) =>
                      updateField(
                        "state",
                        event.target.value
                      )
                    }
                    placeholder="State"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Postal / Country */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Postal Code *
                  </label>

                  <input
                    value={form.postal_code}
                    onChange={(event) =>
                      updateField(
                        "postal_code",
                        event.target.value
                      )
                    }
                    placeholder="Postal code"
                    inputMode="numeric"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Country
                  </label>

                  <input
                    value={form.country}
                    onChange={(event) =>
                      updateField(
                        "country",
                        event.target.value
                      )
                    }
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </div>
              </div>

              {/* Default */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg bg-neutral-50 p-3">
                <input
                  type="checkbox"
                  checked={form.is_default}
                  onChange={(event) =>
                    updateField(
                      "is_default",
                      event.target.checked
                    )
                  }
                  className="h-4 w-4 accent-brand"
                />

                <span className="text-sm">
                  Make this my default address
                </span>
              </label>

              {/* Save */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:opacity-60"
              >
                {isSaving
                  ? "Saving..."
                  : editingAddressId
                    ? "Update Address"
                    : "Save Address"}
              </button>
            </form>
          </section>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* LOADING                                                           */}
        {/* ---------------------------------------------------------------- */}

        {isLoading && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center">
            <p className="text-sm text-neutral-500">
              Loading addresses...
            </p>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* ERROR                                                             */}
        {/* ---------------------------------------------------------------- */}

        {isError && (
          <ErrorState
            error={error}
            onRetry={refetch}
          />
        )}

        {/* ---------------------------------------------------------------- */}
        {/* ADDRESS LIST                                                      */}
        {/* ---------------------------------------------------------------- */}

        {!isLoading &&
          !isError &&
          addresses &&
          addresses.length > 0 && (
            <section>
              <h2 className="mb-2 px-1 text-xs font-semibold tracking-wider text-neutral-400">
                SAVED ADDRESSES
              </h2>

              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">

                      {/* Address Information */}
                      <div className="flex min-w-0 gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600">
                          <FiMapPin size={18} />
                        </div>

                        <div className="min-w-0">
                          <div className="mb-1 flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-neutral-900">
                              {address.label}
                            </h3>

                            {address.is_default && (
                              <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                                <FiCheck size={12} />
                                Default
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-medium">
                            {address.full_name}
                          </p>

                          <p className="mt-1 text-sm text-neutral-500">
                            {address.phone_number}
                          </p>

                          <p className="mt-2 text-sm leading-6 text-neutral-600">
                            {address.line1}
                            {address.line2
                              ? `, ${address.line2}`
                              : ""}
                            <br />
                            {address.city}, {address.state}{" "}
                            {address.postal_code}
                            <br />
                            {address.country}
                          </p>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex shrink-0 items-center gap-2">
                        {/* Set Default */}
                        {!address.is_default && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSetDefault(address)
                            }
                            disabled={
                              defaultMutation.isPending
                            }
                            className="flex h-9 items-center gap-1.5 rounded-lg border border-neutral-200 px-2.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-50"
                            title="Set as default"
                          >
                            <FiStar size={14} />
                            <span className="hidden sm:inline">
                              Default
                            </span>
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(address)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50"
                          aria-label={`Edit ${address.label} address`}
                          title="Edit address"
                        >
                          <FiEdit2 size={15} />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(address)
                          }
                          disabled={
                            deleteMutation.isPending
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                          aria-label={`Delete ${address.label} address`}
                          title="Delete address"
                        >
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        {/* ---------------------------------------------------------------- */}
        {/* EMPTY STATE                                                       */}
        {/* ---------------------------------------------------------------- */}

        {!isLoading &&
          !isError &&
          addresses &&
          addresses.length === 0 && (
            <section className="rounded-2xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                <FiMapPin size={24} />
              </div>

              <h2 className="font-semibold text-neutral-900">
                No addresses saved
              </h2>

              <p className="mt-1 text-sm text-neutral-500">
                Add an address to make checkout faster.
              </p>

              {!showForm && (
                <button
                  type="button"
                  onClick={openAddForm}
                  className="mt-5 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-dark"
                >
                  Add Your First Address
                </button>
              )}
            </section>
          )}
      </div>
    </main>
  );
}