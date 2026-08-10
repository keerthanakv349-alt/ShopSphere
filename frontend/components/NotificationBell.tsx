"use client";

/**
 * WHY THE WEBSOCKET CONNECTION LIVES IN THIS COMPONENT, NOT A GLOBAL PROVIDER:
 * The bell is the only UI that needs live push — everywhere else that
 * displays order/payment status (the order detail page, admin pages)
 * already re-fetches via React Query when the user navigates there, which
 * is simpler than plumbing a global socket + event bus through the whole
 * app for this project's scope. If more places needed live updates, this
 * connection would move up to a provider — noted here rather than
 * over-engineering a global pub/sub for one component's needs today.
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from "@/lib/engagement";
import { useAuthStore } from "@/lib/auth-store";
import type { LiveNotification } from "@/types/engagement";

const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const WS_ORIGIN = API_ORIGIN.replace(/^http/, "ws");

export function NotificationBell() {
  const queryClient = useQueryClient();
  const tokens = useAuthStore((s) => s.tokens);
  const [isOpen, setIsOpen] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    enabled: !!tokens,
  });
  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  useEffect(() => {
    if (!tokens?.access_token) return;

    const socket = new WebSocket(`${WS_ORIGIN}/api/v1/ws/notifications?token=${tokens.access_token}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const payload: LiveNotification = JSON.parse(event.data);
      toast(payload.title, { icon: "🔔" });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      if (payload.related_order_id) {
        queryClient.invalidateQueries({ queryKey: ["order", payload.related_order_id] });
      }
    };

    // Access tokens expire after 15 minutes (see backend
    // ACCESS_TOKEN_EXPIRE_MINUTES) — this socket doesn't attempt to
    // reconnect with a refreshed token automatically. A dropped
    // connection just means live push pauses until the next page
    // load/token refresh; the REST notification list (fetched above)
    // stays accurate regardless, so nothing is silently lost.
    return () => socket.close();
  }, [tokens?.access_token, queryClient]);

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  async function handleNotificationClick(id: string) {
    await markNotificationRead(id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  if (!tokens) return null;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen((v) => !v)} className="relative hover:text-brand" aria-label="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-1 rounded-full bg-brand px-1.5 text-[10px] text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex items-center justify-between border-b border-neutral-200 p-3 dark:border-neutral-800">
            <p className="text-sm font-semibold">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs text-brand hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications?.length === 0 && (
              <p className="p-4 text-center text-xs text-neutral-500">No notifications yet.</p>
            )}
            {notifications?.map((n) => (
              <button
                key={n.id}
                onClick={() => handleNotificationClick(n.id)}
                className={`block w-full border-b border-neutral-100 p-3 text-left text-xs last:border-0 dark:border-neutral-900 ${
                  n.is_read ? "opacity-60" : ""
                }`}
              >
                <p className="font-medium">{n.title}</p>
                <p className="text-neutral-500">{n.message}</p>
                <p className="mt-1 text-neutral-400">{new Date(n.created_at).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
