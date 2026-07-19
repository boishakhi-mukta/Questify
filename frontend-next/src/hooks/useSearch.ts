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

// Manages a search box's text. To avoid firing off a new search on every
// single keystroke, it waits until the user pauses typing (debounceMs) before
// updating the actual "query" that triggers a search.
export function useSearch(initialValue = "", debounceMs = 300) {
  const [input, setInput]   = useState(initialValue);
  const [query, setQuery]   = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(input), debounceMs);
    return () => clearTimeout(timer);
  }, [input, debounceMs]);

  // Empties the search box and the active search at the same time.
  const clear = useCallback(() => {
    setInput("");
    setQuery("");
  }, []);

  return { input, setInput, query, clear };
}
