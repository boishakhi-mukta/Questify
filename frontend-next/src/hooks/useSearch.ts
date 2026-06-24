"use client";

import { useState, useEffect, useCallback } from "react";

export function useSearch(initialValue = "", debounceMs = 300) {
  const [input, setInput]   = useState(initialValue);
  const [query, setQuery]   = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(input), debounceMs);
    return () => clearTimeout(timer);
  }, [input, debounceMs]);

  const clear = useCallback(() => {
    setInput("");
    setQuery("");
  }, []);

  return { input, setInput, query, clear };
}
