"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cash01Icon,
  BankIcon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaymentMethod } from "@/services/catalog";
import { formatMoney, formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

const methods: Array<{
  id: PaymentMethod;
  label: string;
  icon: typeof Cash01Icon;
}> = [
  { id: "cash", label: "Cash", icon: Cash01Icon },
  { id: "transfer", label: "Transfer", icon: BankIcon },
  { id: "card", label: "Card", icon: CreditCardIcon },
];

function quickAmounts(total: number): number[] {
  const notes = [500, 1000, 2000, 5000, 10000, 20000, 50000];
  const rounded = notes
    .map((n) => Math.ceil(total / n) * n)
    .filter((v) => v > total);
  return Array.from(new Set(rounded)).slice(0, 3);
}

// State lives here so it resets naturally: the dialog unmounts its
// content when closed, and this remounts fresh on the next sale.
function PaymentForm({
  total,
  pending,
  onConfirm,
}: {
  total: number;
  pending: boolean;
  onConfirm: (method: PaymentMethod, amountTendered?: number) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [tendered, setTendered] = useState("");

  const tenderedNum = Number(tendered) || 0;
  const change = tenderedNum - total;
  const cashInvalid = method === "cash" && (!tendered || tenderedNum < total);

  return (
    <>
      {/* Amount due */}
      <div className="mt-5 rounded-xl bg-gray-50 px-4 py-3 text-center">
        <p className="text-xs text-muted-foreground">Amount due</p>
        <p
          className="mt-0.5 text-3xl font-bold tracking-tight"
        >
          ₦{formatMoney(total)}
        </p>
      </div>

      {/* Method */}
      <div
        className="mt-4 grid grid-cols-3 gap-2"
        role="radiogroup"
        aria-label="Payment method"
      >
        {methods.map((m) => (
          <button
            key={m.id}
            role="radio"
            aria-checked={method === m.id}
            onClick={() => setMethod(m.id)}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
              method === m.id
                ? "border-foreground text-foreground"
                : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground",
            )}
          >
            <HugeiconsIcon
              icon={m.icon}
              size={18}
              strokeWidth={method === m.id ? 2 : 1.5}
            />
            {m.label}
          </button>
        ))}
      </div>

      {/* Cash details */}
      {method === "cash" && (
        <div className="mt-4 space-y-2">
          <label
            htmlFor="cash-received"
            className="text-xs font-medium text-muted-foreground"
          >
            Cash received (₦)
          </label>
          <Input
            id="cash-received"
            type="number"
            inputMode="decimal"
            min="0"
            value={tendered}
            onChange={(e) => setTendered(e.target.value)}
            placeholder={formatMoney(total)}
            className="h-10 text-base"
            autoFocus
          />
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setTendered(String(total))}
              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:bg-gray-100 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              Exact
            </button>
            {quickAmounts(total).map((amount) => (
              <button
                key={amount}
                onClick={() => setTendered(String(amount))}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors outline-none hover:bg-gray-100 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                ₦{formatMoney(amount).replace(".00", "")}
              </button>
            ))}
          </div>
          {tenderedNum >= total && tendered && change > 0 && (
            <p className="text-sm font-medium text-emerald-600">
              Change due: {formatNaira(change)}
            </p>
          )}
          {tendered && tenderedNum < total && (
            <p className="text-xs text-destructive">
              That&apos;s {formatNaira(total - tenderedNum)} short.
            </p>
          )}
        </div>
      )}

      {method === "transfer" && (
        <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-muted-foreground">
          Confirm the transfer has landed in your wallet before completing the
          sale.
        </p>
      )}

      <Button
        className="mt-5 w-full rounded-xl"
        size="lg"
        loading={pending}
        disabled={cashInvalid}
        onClick={() =>
          onConfirm(method, method === "cash" ? tenderedNum : undefined)
        }
      >
        Complete sale
      </Button>
    </>
  );
}

export function PaymentDialog({
  open,
  onOpenChange,
  total,
  pending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  pending: boolean;
  onConfirm: (method: PaymentMethod, amountTendered?: number) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogContent>
        <DialogTitle>Take payment</DialogTitle>
        <DialogDescription className="mt-1">
          How is the customer paying?
        </DialogDescription>
        <PaymentForm total={total} pending={pending} onConfirm={onConfirm} />
      </DialogContent>
    </Dialog>
  );
}
