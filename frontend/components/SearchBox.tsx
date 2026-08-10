"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { fetchSearchSuggestions, fetchTrendingSearches, logSearch } from "@/lib/engagement";

export function SearchBox({
  initialQuery,
  onSearch,
}: {
  initialQuery?: string;
  onSearch: (query: string) => void;
}) {
  const [value, setValue] = useState(initialQuery ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce: only fetch suggestions 250ms after the user stops typing —
  // firing a request on every keystroke would spam the backend and mostly
  // fetch results for a query the user hasn't finished typing yet.
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), 250);
    return () => clearTimeout(timeout);
  }, [value]);

  const { data: suggestions } = useQuery({
    queryKey: ["search-suggestions", debouncedValue],
    queryFn: () => fetchSearchSuggestions(debouncedValue),
    enabled: debouncedValue.length >= 2,
  });
  const { data: trending } = useQuery({
    queryKey: ["search-trending"],
    queryFn: fetchTrendingSearches,
    enabled: value.length === 0,
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function submitSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    setValue(trimmed);
    setIsOpen(false);
    logSearch(trimmed).catch(() => {
      /* logging is a nice-to-have — a failure here shouldn't block the search itself */
    });
    onSearch(trimmed);
  }

  const dropdownItems = value.length >= 2 ? suggestions : trending;
  const dropdownLabel = value.length >= 2 ? "Suggestions" : "Trending searches";

  return (
    <div ref={containerRef} className="relative w-full max-w-xs">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submitSearch(value);
        }}
        placeholder="Search products…"
        className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
      />
      {isOpen && dropdownItems && dropdownItems.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-950">
          <p className="px-3 py-1 text-[11px] font-medium uppercase text-neutral-400">{dropdownLabel}</p>
          {dropdownItems.map((item) => (
            <button
              key={item}
              onClick={() => submitSearch(item)}
              className="block w-full px-3 py-1.5 text-left text-sm hover:bg-neutral-50 dark:hover:bg-neutral-900"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
