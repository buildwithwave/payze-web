"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoneySend01Icon } from "@hugeicons/core-free-icons";
import { ArrowUpRightIcon, ArrowDownLeftIcon } from "@phosphor-icons/react";

type Transaction = {
  id: string;
  type: "received" | "sent" | "withdrawal";
  party: string;
  detail: string;
  amount: string;
  time: string;
};

// Swap for real data once the transactions endpoint is wired up.
const transactions: Transaction[] = [
  {
    id: "1",
    type: "received",
    party: "Adaeze N.",
    detail: "Payment received",
    amount: "+₦45,000",
    time: "2h ago",
  },
  {
    id: "2",
    type: "sent",
    party: "GTBank •••1234",
    detail: "Transfer out",
    amount: "-₦12,000",
    time: "5h ago",
  },
  {
    id: "3",
    type: "received",
    party: "Chidi O.",
    detail: "Payment received",
    amount: "+₦8,500",
    time: "Yesterday",
  },
  {
    id: "4",
    type: "withdrawal",
    party: "Nomba MFB",
    detail: "Withdrawal",
    amount: "-₦100,000",
    time: "Yesterday",
  },
];

const rowStyles = {
  received: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    amountColor: "text-emerald-600",
  },
  sent: {
    iconBg: "bg-gray-100",
    iconColor: "text-gray-700",
    amountColor: "text-foreground",
  },
  withdrawal: {
    iconBg: "bg-gray-100",
    iconColor: "text-gray-700",
    amountColor: "text-foreground",
  },
} as const;

function TransactionIcon({ type }: { type: Transaction["type"] }) {
  const { iconColor } = rowStyles[type];

  if (type === "received") {
    return <ArrowDownLeftIcon size={16} weight="bold" className={iconColor} />;
  }
  if (type === "sent") {
    return <ArrowUpRightIcon size={16} weight="bold" className={iconColor} />;
  }
  return (
    <HugeiconsIcon icon={MoneySend01Icon} size={16} className={iconColor} />
  );
}

export function RecentTransactions() {
  return (
    <div className="mt-8 w-full">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">
          Recent transactions
        </p>
        <Link
          href="/history"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View all
          <ArrowUpRightIcon size={14} />
        </Link>
      </div>

      <div className="rounded-2xl border border-border divide-y divide-border">
        {transactions.map((tx) => {
          const style = rowStyles[tx.type];

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.iconBg}`}
                >
                  <TransactionIcon type={tx.type} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {tx.party}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {tx.detail}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-sm font-semibold ${style.amountColor}`}>
                  {tx.amount}
                </p>
                <p className="text-xs text-muted-foreground">{tx.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
