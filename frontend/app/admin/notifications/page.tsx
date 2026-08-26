"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Notification = {
  title: string;
  message: string;
  type: string;
  created_at: string;
};

type NotificationResponse = {
  notifications: Notification[];
};

async function fetchNotifications() {
  const { data } = await api.get("/api/v1/admin/notifications");
  return data;
}

export default function AdminNotificationsPage() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery<NotificationResponse>({
    queryKey: ["admin-notifications"],
    queryFn: fetchNotifications,
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return "🛒";
      case "customer":
        return "👤";
      case "payment":
        return "💳";
      case "stock":
        return "📦";
      default:
        return "🔔";
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Notifications</h1>

      {isLoading && (
        <p className="text-gray-500">Loading notifications...</p>
      )}

      {isError && (
        <p className="text-red-500">
          Failed to load notifications.
        </p>
      )}

      {data?.notifications.length === 0 && (
        <div className="rounded-lg border bg-white p-6">
          <p className="text-gray-500">
            No notifications available.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {data?.notifications.map((notification, index) => (
          <div
            key={index}
            className="flex items-start gap-4 rounded-lg border bg-white p-4 shadow-sm"
          >
            <div className="text-3xl">
              {getIcon(notification.type)}
            </div>

            <div className="flex-1">
              <h2 className="font-semibold">
                {notification.title}
              </h2>

              <p className="text-gray-600">
                {notification.message}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                {new Date(
                  notification.created_at
                ).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
