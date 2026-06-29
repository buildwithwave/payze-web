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

const data = [
  { month: "Jan", sales: 120000 },
  { month: "Feb", sales: 340000 },
  { month: "Mar", sales: 280000 },
  { month: "Apr", sales: 520000 },
  { month: "May", sales: 410000 },
  { month: "Jun", sales: 680000 },
  { month: "Jul", sales: 590000 },
  { month: "Aug", sales: 870000 },
  { month: "Sep", sales: 740000 },
  { month: "Oct", sales: 920000 },
  { month: "Nov", sales: 1100000 },
  { month: "Dec", sales: 1240000 },
];

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
    <div className="rounded-lg border border-border bg-white px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className="text-sm font-bold text-foreground"
        style={{ fontFamily: "var(--font-currency)" }}
      >
        {formatValue(payload[0].value)}
      </p>
    </div>
  );
}

const timeframes = ["7D", "1M", "3M", "6M", "1Y"] as const;

export function SalesChart() {
  const [active, setActive] = useState<string>("1Y");

  return (
    <div className="mt-6 rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-foreground">Sales Trend</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monthly revenue over the past year
          </p>
        </div>
        <div className="flex items-center bg-muted rounded-lg p-0.5">
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

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.922 0 0)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
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
    </div>
  );
}
