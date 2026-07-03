"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoneySend01Icon } from "@hugeicons/core-free-icons";
import { ArrowUpRightIcon, ArrowDownLeftIcon } from "@phosphor-icons/react";
import { useTransactions } from "@/hooks/use-wallet";
import { formatMoney, formatDateTime } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the Quick actions palette: blue for Credit, gray for Debit.
const rowStyles = {
  credit: { iconColor: "text-blue-600", amountColor: "text-blue-600" },
  debit: { iconColor: "text-gray-700", amountColor: "text-foreground" },
} as const;

function TransactionIcon({ type, channel }: { type: "credit" | "debit"; channel: string }) {
  const { iconColor } = rowStyles[type];

  if (type === "credit") {
    return <ArrowDownLeftIcon size={17} weight="bold" className={iconColor} />;
  }
  if (channel === "withdrawal") {
    return <HugeiconsIcon icon={MoneySend01Icon} size={17} className={iconColor} />;
  }
  return <ArrowUpRightIcon size={17} weight="bold" className={iconColor} />;
}

export function RecentTransactions() {
  const { data: response, isLoading } = useTransactions(undefined, 1, 5);
  const transactions = response?.data ?? [];

  if (isLoading) {
    return (
      <div className="mt-10 w-full space-y-3">
        <Skeleton className="h-5 w-32 rounded" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-10 w-full animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-muted-foreground">
          Recent transactions
        </p>
        <Link
          href="/dashboard/payments"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
        >
          View all
          <ArrowUpRightIcon size={14} />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          No transactions recorded yet
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const style = rowStyles[tx.type];
            const isCredit = tx.type === "credit";
            const party = tx.counterparty || (isCredit ? "Customer payment" : "Transfer out");
            const detail =
              tx.channel === "withdrawal"
                ? "Bank Withdrawal"
                : tx.channel === "transfer"
                  ? "Bank Transfer"
                  : "Card POS Payment";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3.5 transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white shadow-sm shadow-black/[0.03]">
                    <TransactionIcon type={tx.type} channel={tx.channel} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {party}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {detail}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold ${style.amountColor}`}>
                    {isCredit ? "+" : "-"}₦{formatMoney(tx.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(tx.createdAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
