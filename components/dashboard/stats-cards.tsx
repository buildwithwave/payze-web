"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Package01Icon,
  ShoppingCart01Icon,
  Store01Icon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons";
import { useMetricsOverview } from "@/hooks/use-metrics";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: typeof Package01Icon;
  iconBg: string;
  iconColor: string;
}

function StatCard({ label, value, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border p-5 flex flex-col justify-between gap-6 bg-white shadow-sm">
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center size-7 rounded-md ${iconBg}`}>
          <HugeiconsIcon icon={icon} size={15} className={iconColor} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>

      <div className="flex items-end justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-foreground">
          {value}
        </h3>
      </div>
    </div>
  );
}

export function StatsCards() {
  const { data: metrics, isLoading } = useMetricsOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const stats: StatCardProps[] = [
    {
      label: "Products",
      value: metrics?.products ?? 0,
      icon: Package01Icon,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      label: "Orders",
      value: metrics?.orders ?? 0,
      icon: ShoppingCart01Icon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Stores",
      value: metrics?.stores ?? 0,
      icon: Store01Icon,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Invoices",
      value: metrics?.invoices ?? 0,
      icon: Invoice01Icon,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mt-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
