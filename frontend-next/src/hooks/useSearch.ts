"use client";

/**
 * ============================================================================
 * QUESTIFY CUSTOM HOOK: useSearch
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Custom hook debouncing keyword searches.
 * 
 * WHY IT EXISTS:
 * Prevents spamming APIs with requests as users type.
 * 
 * HOW IT WORKS (Technical Overview):
 * Debounces search input terms.
 * ============================================================================
 */

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
