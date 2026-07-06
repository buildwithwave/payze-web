"use client";

import { Invoice } from "@/services/catalog";
import { formatMoney, formatDateTime } from "@/lib/format";

const paymentLabels: Record<Invoice["paymentMethod"], string> = {
  cash: "Cash",
  nomba: "Nomba",
};

export function Receipt({
  invoice,
  storeName,
  printable = false,
}: {
  invoice: Invoice;
  storeName?: string;
  printable?: boolean;
}) {
  return (
    <div
      id={printable ? "receipt-print" : undefined}
      className="rounded-xl border border-border bg-white px-5 py-6 text-sm"
    >
      {/* Header */}
      <div className="text-center">
        <p className="text-base font-semibold tracking-tight">
          {storeName || "Payze Store"}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDateTime(invoice.createdAt)}
        </p>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {invoice.number}
        </p>
      </div>

      {invoice.customerName && (
        <p className="mt-3 text-xs text-muted-foreground">
          Customer:{" "}
          <span className="text-foreground">{invoice.customerName}</span>
        </p>
      )}

      {/* Items */}
      <div className="mt-4 border-t border-border pt-3">
        <ul className="space-y-2">
          {invoice.items.map((item) => (
            <li
              key={item.productId}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {item.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quantity} × ₦{formatMoney(item.price)}
                </p>
              </div>
              <p className="shrink-0 font-medium">
                ₦{formatMoney(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {/* Totals */}
      <div className="mt-4 space-y-1.5 border-t border-border pt-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="font-sans">Subtotal</span>
          <span>₦{formatMoney(invoice.subtotal)}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-sans">Discount</span>
            <span>-₦{formatMoney(invoice.discount)}</span>
          </div>
        )}
        <div className="flex justify-between pt-1 text-base font-semibold">
          <span className="font-sans">Total</span>
          <span>₦{formatMoney(invoice.total)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="font-sans">
            Paid via {paymentLabels[invoice.paymentMethod]}
          </span>
          {invoice.amountTendered !== undefined && (
            <span>₦{formatMoney(invoice.amountTendered)}</span>
          )}
        </div>
        {invoice.change !== undefined && invoice.change > 0 && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-sans">Change</span>
            <span>₦{formatMoney(invoice.change)}</span>
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Thank you for shopping with us
      </p>
    </div>
  );
}
