"use client";

/**
 * WHY REACT QUERY:
 * Server state (data that lives on the backend — products, orders, user
 * profile) is fundamentally different from client state (form inputs, UI
 * toggles). React Query handles caching, background refetching, loading/
 * error states, and request de-duplication for server state, so we don't
 * hand-roll useEffect+useState fetch logic (and its bugs — race
 * conditions, stale closures, missing cleanup) in every component. This
 * QueryClientProvider wraps the whole app once, in the root layout.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute — avoids refetching on every remount
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
