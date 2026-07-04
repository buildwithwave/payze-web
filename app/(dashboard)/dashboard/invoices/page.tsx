"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Invoice01Icon,
  Search01Icon,
  ShoppingBasket01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ReceiptDialog } from "@/components/pos/receipt-dialog";
import { useInvoices } from "@/hooks/use-invoices";
import { useUser } from "@/hooks/use-auth";
import { Invoice } from "@/services/catalog";
import { formatNaira, formatDateTime } from "@/lib/format";

const paymentLabels: Record<Invoice["paymentMethod"], string> = {
  cash: "Cash",
  transfer: "Transfer",
  card: "Card",
};

export default function InvoicesPage() {
  const { data: invoices, isLoading, isError, refetch } = useInvoices();
  const { data: user } = useUser();
  const [search, setSearch] = useState("");
  const [viewing, setViewing] = useState<Invoice | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invoices ?? [];
    return (invoices ?? []).filter(
      (inv) =>
        inv.number.toLowerCase().includes(q) ||
        inv.customerName?.toLowerCase().includes(q) ||
        inv.items.some((item) => item.name.toLowerCase().includes(q)),
    );
  }, [invoices, search]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground">
            Every sale you&apos;ve made, receipt included.
          </p>
        </div>
        <Button
          size="sm"
          className="h-9 gap-1.5 px-4"
          render={<Link href="/dashboard/pos" />}
        >
          <HugeiconsIcon icon={ShoppingBasket01Icon} size={14} />
          New sale
        </Button>
      </div>

      {/* Search */}
      <div className="relative mt-6 w-full max-w-64">
        <HugeiconsIcon
          icon={Search01Icon}
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search invoices"
          className="h-9 rounded-full border-transparent bg-gray-100 pl-9 focus-visible:border-transparent focus-visible:bg-gray-200/70"
          aria-label="Search invoices"
          autoComplete="off"
        />
      </div>

      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-5">
            <div className="flex items-center gap-2 text-destructive">
              <HugeiconsIcon icon={AlertCircleIcon} size={16} />
              <p className="text-sm font-medium">
                Couldn&apos;t load your invoices
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (invoices ?? []).length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
              <HugeiconsIcon
                icon={Invoice01Icon}
                size={22}
                className="text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-sm font-medium">No invoices yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Complete your first sale and the invoice will land here.
              </p>
            </div>
            <Button
              size="sm"
              className="h-9 gap-1.5 px-4"
              render={<Link href="/dashboard/pos" />}
            >
              <HugeiconsIcon icon={ShoppingBasket01Icon} size={14} />
              Start selling
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border py-16 text-center">
            <p className="text-sm font-medium">Nothing matches your search</p>
            <Button variant="outline" size="sm" onClick={() => setSearch("")}>
              Clear search
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 pr-4 font-medium">Invoice</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Customer</th>
                <th className="px-4 py-2.5 font-medium">Items</th>
                <th className="px-4 py-2.5 font-medium">Payment</th>
                <th className="py-2.5 pl-4 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-border/60 last:border-0 transition-colors hover:bg-gray-50 cursor-pointer"
                  onClick={() => setViewing(invoice)}
                >
                  <td className="py-3 pr-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewing(invoice);
                      }}
                      className="font-mono text-xs font-medium text-foreground outline-none hover:underline focus-visible:underline cursor-pointer"
                    >
                      {invoice.number}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDateTime(invoice.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {invoice.customerName || "Walk-in"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {invoice.items.reduce((sum, i) => sum + i.quantity, 0)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {paymentLabels[invoice.paymentMethod]}
                  </td>
                  <td className="py-3 pl-4 text-right font-medium">
                    {formatNaira(invoice.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {(invoices ?? []).length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          {filtered.length} of {invoices?.length} invoices
        </p>
      )}

      <ReceiptDialog
        invoice={viewing}
        storeName={user?.businessName}
        newSaleLabel="Done"
        onClose={() => setViewing(null)}
      />
    </div>
  );
}
