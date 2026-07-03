"use client";

import { useUser } from "@/hooks/use-auth";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { SalesChart } from "@/components/dashboard/sales-chart";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const { data: user } = useUser();
  const firstName = user?.firstName || "there";

  return (
    <div className="p-8">
      <div className="mx-auto w-full max-w-4xl mt-10">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">
            {getGreeting()}, {firstName}.
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s how your business is doing today.
          </p>
        </div>

        <div className="mt-4">
          <WalletCard />
        </div>

        <RecentTransactions />

        {/* <StatsCards />
        <SalesChart /> */}
      </div>

    </div>
  );
}
