"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS, type SortKey } from "@/hooks/useSort";
import { useTranslation } from "react-i18next";

interface SortDropdownProps {
  value: SortKey;
  onChange: (val: SortKey) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span
        className="text-[13px] text-brand-body font-medium whitespace-nowrap hidden sm:block"
        aria-hidden
      >
        {t("sortDropdown.sortBy")}
      </span>
      <Select value={value} onValueChange={(v) => onChange(v as SortKey)}>
        <SelectTrigger
          className="h-8 w-[148px] text-[13px]"
          aria-label="Sort courses"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {t(opt.labelKey)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
