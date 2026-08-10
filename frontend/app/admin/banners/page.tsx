// // // export default function AdminBannersPage() {
// // //   return (
// // //     <div className="space-y-6">
// // //       <h1 className="text-4xl font-bold">Banners</h1>

// // //       <div className="rounded-lg border bg-white p-6">
// // //         <p className="text-gray-500">
// // //           Banner management will be implemented here.
// // //         </p>
// // //       </div>
// // //     </div>
// // //   );
// // // }



// // "use client";

// // import { useQuery } from "@tanstack/react-query";
// // import { fetchBanners } from "@/lib/admin";

// // export default function AdminBannersPage() {
// //   const {
// //     data: banners,
// //     isLoading,
// //     isError,
// //     error,
// //   } = useQuery({
// //     queryKey: ["admin", "banners"],
// //     queryFn: fetchBanners,
// //   });

// //   return (
// //     <div>
// //       <h1 className="mb-6 text-3xl font-bold">Banners</h1>

// //       {isLoading && (
// //         <p className="text-gray-500">
// //           Loading banners...
// //         </p>
// //       )}

// //       {isError && (
// //         <div className="rounded-lg border border-red-200 bg-red-50 p-4">
// //           <p className="text-red-600">
// //             Failed to load banners.
// //           </p>

// //           <p className="mt-1 text-sm text-red-500">
// //             {error instanceof Error
// //               ? error.message
// //               : "Unknown error"}
// //           </p>
// //         </div>
// //       )}

// //       {!isLoading && !isError && banners?.length === 0 && (
// //         <div className="rounded-lg border bg-white p-6">
// //           <p className="text-gray-500">
// //             No banners available.
// //           </p>
// //         </div>
// //       )}

// //       <div className="space-y-4">
// //         {banners?.map((banner) => (
// //           <div
// //             key={banner.id}
// //             className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm"
// //           >
// //             <img
// //               src={banner.image_url}
// //               alt={banner.title}
// //               className="h-24 w-40 rounded-md object-cover"
// //             />

// //             <div className="flex-1">
// //               <h2 className="text-lg font-semibold">
// //                 {banner.title}
// //               </h2>

// //               {banner.subtitle && (
// //                 <p className="text-gray-600">
// //                   {banner.subtitle}
// //                 </p>
// //               )}

// //               <p className="mt-2 text-sm text-gray-500">
// //                 Display order: {banner.display_order}
// //               </p>

// //               <p
// //                 className={
// //                   banner.is_active
// //                     ? "text-sm text-green-600"
// //                     : "text-sm text-red-500"
// //                 }
// //               >
// //                 {banner.is_active ? "Active" : "Inactive"}
// //               </p>
// //             </div>
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import {
//   useMutation,
//   useQuery,
//   useQueryClient,
// } from "@tanstack/react-query";
// import { useState } from "react";
// import toast from "react-hot-toast";

// import {
//   createBanner,
//   fetchBanners,
// } from "@/lib/admin";

// export default function AdminBannersPage() {
//   const queryClient = useQueryClient();

//   // -----------------------------
//   // Banner form state
//   // -----------------------------
//   const [title, setTitle] = useState("");
//   const [subtitle, setSubtitle] = useState("");
//   const [imageUrl, setImageUrl] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");
//   const [displayOrder, setDisplayOrder] = useState("0");
//   const [isActive, setIsActive] = useState(true);

//   // -----------------------------
//   // Fetch banners
//   // -----------------------------
//   const {
//     data: banners,
//     isLoading,
//     isError,
//     error,
//   } = useQuery({
//     queryKey: ["admin", "banners"],
//     queryFn: fetchBanners,
//   });

//   // -----------------------------
//   // Create banner mutation
//   // -----------------------------
//   const createMutation = useMutation({
//     mutationFn: createBanner,

//     onSuccess: () => {
//       toast.success("Banner created successfully");

//       // Refresh banner list
//       queryClient.invalidateQueries({
//         queryKey: ["admin", "banners"],
//       });

//       // Clear form
//       setTitle("");
//       setSubtitle("");
//       setImageUrl("");
//       setLinkUrl("");
//       setDisplayOrder("0");
//       setIsActive(true);
//     },

//     onError: (error: any) => {
//       toast.error(
//         error?.response?.data?.detail ??
//           "Failed to create banner"
//       );
//     },
//   });

//   // -----------------------------
//   // Form submit
//   // -----------------------------
//   function handleSubmit(
//     event: React.FormEvent<HTMLFormElement>
//   ) {
//     event.preventDefault();

//     if (!title.trim()) {
//       toast.error("Banner title is required");
//       return;
//     }

//     if (!imageUrl.trim()) {
//       toast.error("Image URL is required");
//       return;
//     }

//     createMutation.mutate({
//       title: title.trim(),
//       subtitle: subtitle.trim() || undefined,
//       image_url: imageUrl.trim(),
//       link_url: linkUrl.trim() || undefined,
//       display_order: Number(displayOrder),
//       is_active: isActive,
//     });
//   }

//   return (
//     <div>
//       <h1 className="mb-6 text-3xl font-bold">
//         Banners
//       </h1>

//       {/* =========================================
//           CREATE BANNER
//       ========================================== */}
//       <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
//         <h2 className="mb-4 text-xl font-semibold">
//           Create Banner
//         </h2>

//         <form
//           onSubmit={handleSubmit}
//           className="space-y-4"
//         >
//           {/* Title */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">
//               Title
//             </label>

//             <input
//               type="text"
//               placeholder="Example: Summer Sale"
//               value={title}
//               onChange={(e) =>
//                 setTitle(e.target.value)
//               }
//               className="w-full rounded-md border px-3 py-2"
//               required
//             />
//           </div>

//           {/* Subtitle */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">
//               Subtitle
//             </label>

//             <input
//               type="text"
//               placeholder="Example: Up to 50% off"
//               value={subtitle}
//               onChange={(e) =>
//                 setSubtitle(e.target.value)
//               }
//               className="w-full rounded-md border px-3 py-2"
//             />
//           </div>

//           {/* Image URL */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">
//               Image URL
//             </label>

//             <input
//               type="url"
//               placeholder="https://example.com/banner.jpg"
//               value={imageUrl}
//               onChange={(e) =>
//                 setImageUrl(e.target.value)
//               }
//               className="w-full rounded-md border px-3 py-2"
//               required
//             />
//           </div>

//           {/* Link URL */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">
//               Link URL
//             </label>

//             <input
//               type="url"
//               placeholder="https://example.com/products"
//               value={linkUrl}
//               onChange={(e) =>
//                 setLinkUrl(e.target.value)
//               }
//               className="w-full rounded-md border px-3 py-2"
//             />
//           </div>

//           {/* Display Order */}
//           <div>
//             <label className="mb-1 block text-sm font-medium">
//               Display Order
//             </label>

//             <input
//               type="number"
//               min="0"
//               value={displayOrder}
//               onChange={(e) =>
//                 setDisplayOrder(e.target.value)
//               }
//               className="w-full rounded-md border px-3 py-2"
//             />
//           </div>

//           {/* Active */}
//           <label className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={isActive}
//               onChange={(e) =>
//                 setIsActive(e.target.checked)
//               }
//             />

//             <span className="text-sm">
//               Active
//             </span>
//           </label>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={createMutation.isPending}
//             className="rounded-md bg-brand px-5 py-2 font-medium text-white disabled:opacity-60"
//           >
//             {createMutation.isPending
//               ? "Creating..."
//               : "Create Banner"}
//           </button>
//         </form>
//       </div>

//       {/* =========================================
//           EXISTING BANNERS
//       ========================================== */}

//       <h2 className="mb-4 text-xl font-semibold">
//         Existing Banners
//       </h2>

//       {isLoading && (
//         <p className="text-gray-500">
//           Loading banners...
//         </p>
//       )}

//       {isError && (
//         <div className="rounded-lg border border-red-200 bg-red-50 p-4">
//           <p className="text-red-600">
//             Failed to load banners.
//           </p>

//           <p className="mt-1 text-sm text-red-500">
//             {error instanceof Error
//               ? error.message
//               : "Unknown error"}
//           </p>
//         </div>
//       )}

//       {!isLoading &&
//         !isError &&
//         banners?.length === 0 && (
//           <div className="rounded-lg border bg-white p-6">
//             <p className="text-gray-500">
//               No banners available.
//             </p>
//           </div>
//         )}

//       <div className="space-y-4">
//         {banners?.map((banner) => (
//           <div
//             key={banner.id}
//             className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm"
//           >
//             <img
//               src={banner.image_url}
//               alt={banner.title}
//               className="h-24 w-40 rounded-md object-cover"
//             />

//             <div className="flex-1">
//               <h2 className="text-lg font-semibold">
//                 {banner.title}
//               </h2>

//               {banner.subtitle && (
//                 <p className="text-gray-600">
//                   {banner.subtitle}
//                 </p>
//               )}

//               <p className="mt-2 text-sm text-gray-500">
//                 Display order:{" "}
//                 {banner.display_order}
//               </p>

//               <p
//                 className={
//                   banner.is_active
//                     ? "text-sm text-green-600"
//                     : "text-sm text-red-500"
//                 }
//               >
//                 {banner.is_active
//                   ? "Active"
//                   : "Inactive"}
//               </p>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }


"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

import {
  createBanner,
  fetchBanners,
  updateBanner,
  type Banner,
} from "@/lib/admin";

export default function AdminBannersPage() {
  const queryClient = useQueryClient();

  // Create form
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);

  // Edit mode
  const [editingBanner, setEditingBanner] =
    useState<Banner | null>(null);

  // Edit form
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState("0");
  const [editIsActive, setEditIsActive] = useState(true);

  // Fetch banners
  const {
    data: banners,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin", "banners"],
    queryFn: fetchBanners,
  });

  // Create banner
  const createMutation = useMutation({
    mutationFn: createBanner,

    onSuccess: () => {
      toast.success("Banner created successfully");

      queryClient.invalidateQueries({
        queryKey: ["admin", "banners"],
      });

      setTitle("");
      setSubtitle("");
      setImageUrl("");
      setLinkUrl("");
      setDisplayOrder("0");
      setIsActive(true);
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail ??
          "Failed to create banner"
      );
    },
  });

  // Update banner
  const updateMutation = useMutation({
    mutationFn: ({
      bannerId,
      payload,
    }: {
      bannerId: string;
      payload: {
        title?: string;
        subtitle?: string | null;
        image_url?: string;
        link_url?: string | null;
        display_order?: number;
        is_active?: boolean;
      };
    }) => updateBanner(bannerId, payload),

    onSuccess: () => {
      toast.success("Banner updated successfully");

      queryClient.invalidateQueries({
        queryKey: ["admin", "banners"],
      });

      setEditingBanner(null);
    },

    onError: (error: any) => {
      toast.error(
        error?.response?.data?.detail ??
          "Failed to update banner"
      );
    },
  });

  // Create submit
  function handleCreateSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Banner title is required");
      return;
    }

    if (!imageUrl.trim()) {
      toast.error("Image URL is required");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      image_url: imageUrl.trim(),
      link_url: linkUrl.trim() || undefined,
      display_order: Number(displayOrder),
      is_active: isActive,
    });
  }

  // Start editing
  function handleEdit(banner: Banner) {
    setEditingBanner(banner);

    setEditTitle(banner.title);
    setEditSubtitle(banner.subtitle ?? "");
    setEditImageUrl(banner.image_url);
    setEditLinkUrl(banner.link_url ?? "");
    setEditDisplayOrder(
      String(banner.display_order)
    );
    setEditIsActive(banner.is_active);
  }

  // Save edit
  function handleUpdateSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingBanner) return;

    if (!editTitle.trim()) {
      toast.error("Banner title is required");
      return;
    }

    if (!editImageUrl.trim()) {
      toast.error("Image URL is required");
      return;
    }

    updateMutation.mutate({
      bannerId: editingBanner.id,
      payload: {
        title: editTitle.trim(),
        subtitle:
          editSubtitle.trim() || null,
        image_url: editImageUrl.trim(),
        link_url:
          editLinkUrl.trim() || null,
        display_order: Number(
          editDisplayOrder
        ),
        is_active: editIsActive,
      },
    });
  }


  const statusMutation = useMutation({
  mutationFn: ({
    bannerId,
    isActive,
  }: {
    bannerId: string;
    isActive: boolean;
  }) =>
    updateBanner(bannerId, {
      is_active: isActive,
    }),

  onSuccess: (_, variables) => {
    toast.success(
      variables.isActive
        ? "Banner activated"
        : "Banner deactivated"
    );

    queryClient.invalidateQueries({
      queryKey: ["admin", "banners"],
    });
  },

  onError: (error: any) => {
    toast.error(
      error?.response?.data?.detail ??
        "Failed to update banner status"
    );
  },
});

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        Banners
      </h1>

      {/* ================================
          CREATE BANNER
      ================================= */}
      <div className="mb-8 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">
          Create Banner
        </h2>

        <form
          onSubmit={handleCreateSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">
              Title
            </label>

            <input
              type="text"
              placeholder="Example: Summer Sale"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Subtitle
            </label>

            <input
              type="text"
              placeholder="Example: Up to 50% off"
              value={subtitle}
              onChange={(e) =>
                setSubtitle(e.target.value)
              }
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Image URL
            </label>

            <input
              type="url"
              placeholder="https://example.com/banner.jpg"
              value={imageUrl}
              onChange={(e) =>
                setImageUrl(e.target.value)
              }
              className="w-full rounded-md border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Link URL
            </label>

            <input
              type="url"
              placeholder="https://example.com/products"
              value={linkUrl}
              onChange={(e) =>
                setLinkUrl(e.target.value)
              }
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Display Order
            </label>

            <input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) =>
                setDisplayOrder(e.target.value)
              }
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) =>
                setIsActive(e.target.checked)
              }
            />

            <span className="text-sm">
              Active
            </span>
          </label>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-md bg-brand px-5 py-2 font-medium text-white disabled:opacity-60"
          >
            {createMutation.isPending
              ? "Creating..."
              : "Create Banner"}
          </button>
        </form>
      </div>

      {/* ================================
          EDIT BANNER
      ================================= */}
      {editingBanner && (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Edit Banner
            </h2>

            <button
              type="button"
              onClick={() =>
                setEditingBanner(null)
              }
              className="rounded-md border bg-white px-3 py-1 text-sm"
            >
              Cancel
            </button>
          </div>

          <form
            onSubmit={handleUpdateSubmit}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm font-medium">
                Title
              </label>

              <input
                type="text"
                value={editTitle}
                onChange={(e) =>
                  setEditTitle(e.target.value)
                }
                className="w-full rounded-md border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Subtitle
              </label>

              <input
                type="text"
                value={editSubtitle}
                onChange={(e) =>
                  setEditSubtitle(e.target.value)
                }
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Image URL
              </label>

              <input
                type="url"
                value={editImageUrl}
                onChange={(e) =>
                  setEditImageUrl(e.target.value)
                }
                className="w-full rounded-md border px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Link URL
              </label>

              <input
                type="url"
                value={editLinkUrl}
                onChange={(e) =>
                  setEditLinkUrl(e.target.value)
                }
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Display Order
              </label>

              <input
                type="number"
                min="0"
                value={editDisplayOrder}
                onChange={(e) =>
                  setEditDisplayOrder(
                    e.target.value
                  )
                }
                className="w-full rounded-md border px-3 py-2"
              />
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) =>
                  setEditIsActive(
                    e.target.checked
                  )
                }
              />

              <span className="text-sm">
                Active
              </span>
            </label>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-md bg-brand px-5 py-2 font-medium text-white disabled:opacity-60"
            >
              {updateMutation.isPending
                ? "Saving..."
                : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* ================================
          EXISTING BANNERS
      ================================= */}
      <h2 className="mb-4 text-xl font-semibold">
        Existing Banners
      </h2>

      {isLoading && (
        <p className="text-gray-500">
          Loading banners...
        </p>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">
            Failed to load banners.
          </p>

          <p className="mt-1 text-sm text-red-500">
            {error instanceof Error
              ? error.message
              : "Unknown error"}
          </p>
        </div>
      )}

      {!isLoading &&
        !isError &&
        banners?.length === 0 && (
          <div className="rounded-lg border bg-white p-6">
            <p className="text-gray-500">
              No banners available.
            </p>
          </div>
        )}

      <div className="space-y-4">
        {banners?.map((banner) => (
          <div
            key={banner.id}
            className="flex gap-4 rounded-lg border bg-white p-4 shadow-sm"
          >
            <img
              src={banner.image_url}
              alt={banner.title}
              className="h-24 w-40 rounded-md object-cover"
            />

            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                {banner.title}
              </h2>

              {banner.subtitle && (
                <p className="text-gray-600">
                  {banner.subtitle}
                </p>
              )}

              <p className="mt-2 text-sm text-gray-500">
                Display order:{" "}
                {banner.display_order}
              </p>

              <p
                className={
                  banner.is_active
                    ? "text-sm text-green-600"
                    : "text-sm text-red-500"
                }
              >
                {banner.is_active
                  ? "Active"
                  : "Inactive"}
              </p>

              {/* <button
                type="button"
                onClick={() =>
                  handleEdit(banner)
                }
                className="mt-3 rounded-md border px-4 py-2 text-sm"
              >
                Edit
              </button> */}



              <div className="mt-3 flex gap-2">
  <button
    type="button"
    onClick={() => handleEdit(banner)}
    className="rounded-md border px-4 py-2 text-sm"
  >
    Edit
  </button>

  <button
    type="button"
    disabled={statusMutation.isPending}
    onClick={() =>
      statusMutation.mutate({
        bannerId: banner.id,
        isActive: !banner.is_active,
      })
    }
    className="rounded-md border px-4 py-2 text-sm"
  >
    {banner.is_active ? "Deactivate" : "Activate"}
  </button>
</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}