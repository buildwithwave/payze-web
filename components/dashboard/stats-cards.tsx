"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Package01Icon,
  ShoppingCart01Icon,
  Store01Icon,
  Invoice01Icon,
} from "@hugeicons/core-free-icons";
import { useProducts } from "@/hooks/use-products";
import { useInvoices } from "@/hooks/use-invoices";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  icon: typeof Package01Icon;
  iconBg: string;
  iconColor: string;
}

function StatCard({ label, value, change, icon, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border p-5 flex flex-col justify-between gap-6">
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center size-7 rounded-md ${iconBg}`}>
          <HugeiconsIcon icon={icon} size={15} className={iconColor} />
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>

      <div className="flex items-end justify-between">
        <h3
          className="text-2xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-currency)" }}
        >
          {value}
        </h3>
        <span className="text-xs font-medium text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
          {change}
        </span>
      </div>
    </div>
  );
}

export function StatsCards() {
  const { data: products } = useProducts();
  const { data: invoices } = useInvoices();

  const stats: StatCardProps[] = [
    {
      label: "Products",
      value: String(products?.length ?? 0),
      change: "+0%",
      icon: Package01Icon,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      label: "Orders",
      value: String(invoices?.length ?? 0),
      change: "+0%",
      icon: ShoppingCart01Icon,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Stores",
      value: "1",
      change: "+0%",
      icon: Store01Icon,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Invoices",
      value: String(invoices?.length ?? 0),
      change: "+0%",
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
