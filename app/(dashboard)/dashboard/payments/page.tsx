"use client";

import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/use-wallet";
import { formatNaira, formatDateTime } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const channelLabels: Record<string, string> = {
  transfer: "Bank Transfer",
  card: "POS Card",
  withdrawal: "Bank Withdrawal",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200/50",
  successful: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
  failed: "bg-red-50 text-red-700 border-red-200/50",
};

export default function PaymentsPage() {
  const [filter, setFilter] = useState<"all" | "credit" | "debit">("all");
  const [page, setPage] = useState(1);
  const limit = 15;

  const typeParam = filter === "all" ? undefined : filter;
  const { data: response, isLoading, isError, refetch } = useTransactions(typeParam, page, limit);

  const transactions = response?.data ?? [];
  const total = response?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const handleFilterChange = (newFilter: "all" | "credit" | "debit") => {
    setFilter(newFilter);
    setPage(1);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            A ledger of all incoming sales and bank withdrawals.
          </p>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex bg-muted rounded-lg p-0.5">
          {(["all", "credit", "debit"] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleFilterChange(t)}
              className={cn(
                "px-4 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer capitalize",
                filter === t
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "all" ? "All" : t === "credit" ? "Credits" : "Withdrawals"}
            </button>
          ))}
        </div>

        <p className="text-xs text-muted-foreground">
          Showing {transactions.length} of {total} transactions
        </p>
      </div>

      {/* Table Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-sm font-semibold text-destructive">Couldn&apos;t load transactions</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-20 text-center">
            <p className="text-sm font-medium">No transactions found</p>
            <p className="text-xs text-muted-foreground">
              When sales are processed or withdrawals are made, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="py-2.5 pr-4 font-medium">Reference</th>
                  <th className="px-4 py-2.5 font-medium">Date & Time</th>
                  <th className="px-4 py-2.5 font-medium">Counterparty</th>
                  <th className="px-4 py-2.5 font-medium">Channel</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="py-2.5 pl-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isCredit = tx.type === "credit";
                  return (
                    <tr
                      key={tx.id}
                      className="border-b border-border/60 last:border-0 transition-colors hover:bg-gray-50/50"
                    >
                      <td className="py-3 pr-4 font-mono text-xs font-medium text-foreground">
                        {tx.reference}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                        {tx.counterparty || (isCredit ? "Customer POS" : "Transfer Out")}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {channelLabels[tx.channel] || tx.channel}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border",
                            statusColors[tx.status] || "bg-gray-50 border-gray-200 text-gray-700"
                          )}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td
                        className={cn(
                          "py-3 pl-4 text-right font-semibold",
                          isCredit ? "text-blue-600" : "text-foreground"
                        )}
                      >
                        {isCredit ? "+" : "-"}{formatNaira(tx.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
