"use client";

import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@heroui/react";

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

export function XPBreakdown({ data, height = 280 }: XPBreakdownProps) {
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>XP Breakdown</CardTitle>
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
          Total: {total.toLocaleString()} XP
        </p>
      </CardContent>
    </Card>
  );
}
