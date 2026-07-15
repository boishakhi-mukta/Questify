"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: Select (UI Base)
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * A drop-down selection list.
 * 
 * WHY IT EXISTS:
 * Guarantees users select options from pre-approved lists.
 * 
 * HOW IT WORKS (Technical Overview):
 * Form control wrapping dropdown structures.
 * ============================================================================
 */

import * as React from "react";
import { HiChevronDown } from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface SelectCtxValue {
  value?: string;
  onValueChange?: (v: string) => void;
  labels: Record<string, string>;
  registerLabel: (value: string, label: string) => void;
}

const SelectCtx = React.createContext<SelectCtxValue>({
  labels: {},
  registerLabel: () => {},
});

export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
}) {
  const [labels, setLabels] = React.useState<Record<string, string>>({});
  const registerLabel = React.useCallback((v: string, label: string) => {
    setLabels((prev) => (prev[v] === label ? prev : { ...prev, [v]: label }));
  }, []);

  return (
    <SelectCtx.Provider value={{ value, onValueChange, labels, registerLabel }}>
      <div className="relative">{children}</div>
    </SelectCtx.Provider>
  );
}

export function SelectTrigger({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-brand-border bg-white dark:bg-[#162B21] px-3.5 py-2 text-sm text-brand-dark dark:text-[#D8F0E8]",
        className
      )}
      {...props}
    >
      <div className="flex-1 text-left">{children}</div>
      <HiChevronDown size={14} className="text-brand-body shrink-0 ml-2" />
    </div>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value, labels } = React.useContext(SelectCtx);
  const display = value ? (labels[value] ?? value) : "";
  return (
    <span className={display ? "text-brand-dark" : "text-brand-body/50"}>
      {display || placeholder || ""}
    </span>
  );
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const { value, onValueChange } = React.useContext(SelectCtx);

  const options = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return null;
    const item = child as React.ReactElement<{ value: string; children: React.ReactNode }>;
    return { value: item.props.value, label: item.props.children };
  })?.filter(Boolean) ?? [];

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onValueChange?.(e.target.value)}
      className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full"
      aria-label="Select option"
    >
      {options.map(
        (opt) =>
          opt && (
            <option key={opt.value} value={opt.value}>
              {String(opt.label)}
            </option>
          )
      )}
    </select>
  );
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { registerLabel } = React.useContext(SelectCtx);
  React.useEffect(() => {
    registerLabel(value, typeof children === "string" ? children : value);
  }, [value, children, registerLabel]);
  return null;
}

export const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const SelectLabel = ({ children }: { children: React.ReactNode }) => (
  <span className="py-1.5 text-xs font-semibold text-brand-body">{children}</span>
);
