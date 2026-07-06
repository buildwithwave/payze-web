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

function TransactionIcon({
  type,
  channel,
}: {
  type: "credit" | "debit";
  channel: string;
}) {
  const { iconColor } = rowStyles[type];

  if (type === "credit") {
    return <ArrowDownLeftIcon size={17} weight="bold" className={iconColor} />;
  }
  if (channel === "withdrawal") {
    return (
      <HugeiconsIcon icon={MoneySend01Icon} size={17} className={iconColor} />
    );
  }
  return <ArrowUpRightIcon size={17} weight="bold" className={iconColor} />;
}

export function RecentTransactions() {
  const { data: response, isLoading } = useTransactions(undefined, 1, 5);
  const transactions = response?.data ?? [];

  // Varied bar widths read as real rows instead of uniform slabs.
  const skeletonWidths = [
    { party: "w-32", amount: "w-16" },
    { party: "w-40", amount: "w-14" },
    { party: "w-28", amount: "w-20" },
    { party: "w-36", amount: "w-16" },
  ];

  if (isLoading) {
    return (
      <div className="mt-12 w-full">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-4 w-36 rounded" />
          <Skeleton className="h-4 w-14 rounded" />
        </div>
        <div className="space-y-2">
          {skeletonWidths.map((w, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3.5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full bg-gray-200/70" />
                <div className="space-y-1.5">
                  <Skeleton className={`h-3.5 rounded bg-gray-200/60 ${w.party}`} />
                  <Skeleton className="h-3 w-24 rounded bg-gray-200/60" />
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1.5">
                <Skeleton className={`h-3.5 rounded bg-gray-200/60 ${w.amount}`} />
                <Skeleton className="h-3 w-24 rounded bg-gray-200/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 w-full animate-fade-in">
      <div className="flex items-center justify-between mb-4">
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
        <div className="rounded-2xl border border-border py-8 text-center text-sm text-muted-foreground">
          No transactions recorded yet
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => {
            const style = rowStyles[tx.type];
            const isCredit = tx.type === "credit";
            const party =
              tx.counterparty ||
              (isCredit ? "Customer payment" : "Transfer out");
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
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(tx.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
