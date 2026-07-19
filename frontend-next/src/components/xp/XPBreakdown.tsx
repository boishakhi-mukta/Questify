"use client";

/**
 * ============================================================================
 * QUESTIFY COMPONENT: XPBreakdown
 * 
 * WHAT IT DOES (For Non-Technical Readers):
 * Displays a detailed list or table showing exactly how a student earned their
 * points (e.g., 10 XP for attending class, 25 XP for submitting a homework).
 * 
 * WHY IT EXISTS:
 * To provide full transparency so students understand where their points came
 * from and how their efforts translate to progress.
 * 
 * HOW IT WORKS (Technical Overview):
 * Receives an array of XP event logs from the backend and maps them to a
 * structured UI list showing event names, dates, and point values.
 * ============================================================================
 */

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@heroui/react";
import { useTranslation } from "react-i18next";

export interface XPBreakdownEntry {
  name:  string;
  value: number;
}

interface XPBreakdownProps {
  data:    XPBreakdownEntry[];
  height?: number;
}

const SLICE_COLORS = [
  "#10b981", // emerald  — attendance
  "#3b82f6", // blue     — materials
  "#8b5cf6", // violet   — assignments
  "#f59e0b", // amber    — quizzes
  "#ef4444", // red      — bonus
];

// The little popup box that appears when hovering over a slice of the pie
// chart, showing that category's name and exact XP value.
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number }> }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="rounded-lg border border-brand-border dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 shadow-md text-[13px]">
      <p className="font-semibold text-brand-dark dark:text-white">{name}</p>
      <p className="text-brand-body dark:text-white/60">{value.toLocaleString()} XP</p>
    </div>
  );
}

// Shows a donut/pie chart breaking down where a student's XP came from
// (attendance, materials, assignments, quizzes, bonuses).
export function XPBreakdown({ data, height = 280 }: XPBreakdownProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("xpBreakdown.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={90}
              innerRadius={45}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-[12px] text-brand-body dark:text-white/70">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        <p className="text-center text-[11px] text-brand-body/55 dark:text-white/35 mt-1">
          {t("xpBreakdown.total")} {total.toLocaleString()} XP
        </p>
      </CardContent>
    </Card>
  );
}
