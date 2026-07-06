"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSalesTrend } from "@/hooks/use-metrics";
import { Skeleton } from "@/components/ui/skeleton";

function formatValue(value: number) {
  if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `₦${(value / 1000).toFixed(0)}K`;
  return `₦${value}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-white px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">
        {formatValue(payload[0].value)}
      </p>
    </div>
  );
}

const timeframes = ["7D", "1M", "3M", "6M", "1Y"] as const;

export function SalesChart() {
  const [active, setActive] = useState<(typeof timeframes)[number]>("1Y");
  const { data: trend, isLoading } = useSalesTrend(active);

  return (
    <div className="mt-6 rounded-xl border border-border p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Sales Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Revenue over selected range
          </p>
        </div>
        <div className="flex items-center bg-muted rounded-lg p-0.5 animate-fade-in">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActive(tf)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                active === tf
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div
          className="flex h-[280px] items-end gap-3 pt-6"
          role="status"
          aria-label="Loading sales chart"
        >
          {[40, 65, 50, 80, 60, 95, 70, 55, 85, 45, 75, 60].map(
            (height, i) => (
              <Skeleton
                key={i}
                className="w-full rounded-t-md rounded-b-none"
                style={{ height: `${height}%` }}
              />
            ),
          )}
        </div>
      ) : !trend || trend.points.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center text-muted-foreground text-sm font-medium border border-border rounded-lg">
          No sales recorded in this timeframe
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart
            data={trend.points}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.922 0 0)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "oklch(0.556 0 0)" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "oklch(0.556 0 0)" }}
              tickFormatter={(v) => formatValue(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Line
              type="linear"
              dataKey="sales"
              stroke="oklch(0.546 0.245 264)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 5,
                fill: "oklch(0.546 0.245 264)",
                stroke: "white",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
