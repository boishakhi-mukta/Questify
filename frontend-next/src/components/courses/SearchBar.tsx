"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: SearchBar
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * An input text box where users can type keywords to quickly find courses by title.
 * 
 * WHY IT EXISTS:
 * Helps users bypass long pages and target specific classes immediately.
 * 
 * HOW IT WORKS (Technical Overview):
 * Controls a local text state with custom delays (debouncing) before triggering searches.
 * ============================================================================
 */

import { HiMagnifyingGlass, HiXMark } from "react-icons/hi2";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
}

export function SearchBar({ value, onChange, onClear }: SearchBarProps) {
  return (
    <div className="relative w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-body/50 pointer-events-none">
        <HiMagnifyingGlass size={20} />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && onClear()}
        placeholder="Search courses by title, description, or instructor"
        className="w-full pl-11 pr-11 py-3.5 bg-white border border-brand-border rounded-xl text-[15px] text-brand-dark placeholder:text-brand-body/45 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue transition-colors shadow-sm"
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-brand-body/50 hover:text-brand-dark hover:bg-brand-bg transition-colors"
        >
          <HiXMark size={16} />
        </button>
      )}
    </div>
  );
}
