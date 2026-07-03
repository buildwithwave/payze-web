"use client";

import { useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ViewIcon,
  EyeOffIcon,
  Copy01Icon,
  Tick01Icon,
  QrCode01Icon,
  MoneySend01Icon,
} from "@hugeicons/core-free-icons";
import { ArrowUpRightIcon, TrendUpIcon, TrendDownIcon } from "@phosphor-icons/react";
import { useWallet, useWalletSummary } from "@/hooks/use-wallet";
import { WithdrawDialog } from "@/components/dashboard/withdraw-dialog";
import { formatMoney } from "@/lib/format";
import { Skeleton } from "@/components/ui/skeleton";

export function WalletCard() {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const { data: wallet, isLoading: loadingWallet } = useWallet();
  const { data: summary, isLoading: loadingSummary } = useWalletSummary("week");

  const handleCopy = () => {
    if (wallet?.accountNumber) {
      navigator.clipboard.writeText(wallet.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (loadingWallet) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-6 w-32 rounded-full" />
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    );
  }

  const balance = wallet ? formatMoney(wallet.balance) : "0.00";
  const weekTotal = summary ? formatMoney(summary.total) : "0.00";
  const changePercent = summary?.changePercent ?? 0;
  const isPositive = changePercent >= 0;

  return (
    <div className="w-full">
      {/* Currency badge */}
      <div className="mb-6">
        <div className="border border-border pl-1.5 pr-3 py-1 rounded-full w-fit flex items-center gap-2 bg-white">
          <div className="overflow-hidden shrink-0 relative">
            <Image
              src="https://purecatamphetamine.github.io/country-flag-icons/1x1/NG.svg"
              alt="NGN"
              width={32}
              height={32}
              className="rounded-full h-5 w-5"
            />
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Nigerian Naira
          </p>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-6 flex items-center gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-medium text-muted-foreground">₦</span>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            {visible ? balance : "****•**"}
          </h2>
        </div>

        <button
          onClick={() => setVisible(!visible)}
          className="p-1.5 rounded-full hover:bg-muted transition-colors cursor-pointer"
        >
          <HugeiconsIcon
            icon={visible ? ViewIcon : EyeOffIcon}
            size={18}
            className="text-muted-foreground"
          />
        </button>
      </div>

      {/* Account info — one-tap copy, instant feedback */}
      {wallet?.accountNumber ? (
        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 active:scale-[0.99] cursor-pointer"
        >
          <div className="min-w-0">
            <p className="font-mono text-base font-semibold tracking-tight text-foreground truncate">
              {wallet.accountNumber}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {wallet.bankName || "Nomba MFB"}
            </p>
          </div>
          <div
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
              copied
                ? "bg-emerald-100 text-emerald-700"
                : "bg-white text-muted-foreground border"
            }`}
          >
            <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={13} />
            {copied ? "Copied" : "Copy"}
          </div>
        </button>
      ) : (
        <div className="w-full flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-left border border-dashed border-border">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate animate-pulse">
              Setting up your virtual account...
            </p>
            <p className="text-xs text-muted-foreground truncate">
              Nomba MFB Provider
            </p>
          </div>
        </div>
      )}

      {/* Weekly earnings */}
      <div className="relative mt-6 overflow-hidden rounded-2xl border border-border p-4 bg-white shadow-sm">
        <svg
          className="pointer-events-none absolute -right-3 -bottom-4 opacity-[0.06]"
          width="120"
          height="90"
          viewBox="0 0 120 90"
          fill="none"
        >
          <circle
            cx="20"
            cy="70"
            r="16"
            fill="currentColor"
            className="text-blue-600"
          />
          <circle
            cx="55"
            cy="55"
            r="20"
            fill="currentColor"
            className="text-blue-600"
          />
          <circle
            cx="95"
            cy="32"
            r="24"
            fill="currentColor"
            className="text-blue-600"
          />
        </svg>

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">
              Earned this week
            </p>
            <p className="mt-0.5 text-2xl font-bold tracking-tight text-foreground">
              ₦{weekTotal}
            </p>
          </div>
          {loadingSummary ? (
            <Skeleton className="h-6 w-12 rounded-full" />
          ) : (
            <div
              className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                isPositive
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendUpIcon size={12} weight="bold" />
              ) : (
                <TrendDownIcon size={12} weight="bold" />
              )}
              {Math.abs(changePercent)}%
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 h-32 mt-10">
        <button className="flex h-full flex-col justify-between rounded-3xl bg-blue-600 p-5 text-left transition-colors hover:bg-blue-700 active:scale-[0.98] cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
            <HugeiconsIcon
              icon={QrCode01Icon}
              size={20}
              className="text-white"
            />
          </div>
          <p className="text-base font-semibold tracking-tight text-white">
            Receive
          </p>
        </button>

        <button className="flex h-full flex-col justify-between rounded-3xl bg-gray-50 p-5 text-left transition-colors hover:bg-gray-100 active:scale-[0.98] cursor-pointer">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <ArrowUpRightIcon size={20} className="text-gray-700" />
          </div>
          <p className="text-base font-semibold tracking-tight text-foreground">
            Send
          </p>
        </button>

        <button
          onClick={() => setWithdrawOpen(true)}
          className="flex h-full flex-col justify-between rounded-3xl bg-gray-50 p-5 text-left transition-colors hover:bg-gray-100 active:scale-[0.98] cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <HugeiconsIcon
              icon={MoneySend01Icon}
              size={20}
              className="text-gray-700"
            />
          </div>
          <p className="text-base font-semibold tracking-tight text-foreground">
            Withdraw
          </p>
        </button>
      </div>

      <WithdrawDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        availableBalance={wallet?.balance ?? 0}
      />
    </div>
  );
}
