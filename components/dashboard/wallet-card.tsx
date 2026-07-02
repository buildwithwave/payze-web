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
import { ArrowUpRightIcon, TrendUpIcon } from "@phosphor-icons/react";

export function WalletCard() {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const balance = "2,450,000.00";
  const accountNumber = "8012345678";
  const bankName = "Nomba MFB";
  const weekTotal = "639,000";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full">
      {/* Currency badge */}
      <div className="mb-4">
        <div className="border border-border pl-1.5 pr-3 py-1 rounded-full w-fit flex items-center gap-2">
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
      <div className="mb-4 flex items-center gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-medium text-muted-foreground">₦</span>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            {visible ? balance : "****.••"}
          </h2>
        </div>

        <button
          onClick={() => setVisible(!visible)}
          className="p-1.5 rounded-full hover:bg-muted transition-colors"
        >
          <HugeiconsIcon
            icon={visible ? ViewIcon : EyeOffIcon}
            size={18}
            className="text-muted-foreground"
          />
        </button>
      </div>

      {/* Account info — one-tap copy, instant feedback */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100 active:scale-[0.99]"
      >
        <div className="min-w-0">
          <p className="font-mono text-base font-semibold tracking-tight text-foreground truncate">
            {accountNumber}
          </p>
          <p className="text-xs text-muted-foreground truncate">{bankName}</p>
        </div>
        <div
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors ${
            copied
              ? "bg-emerald-100 text-emerald-700"
              : "bg-white text-muted-foreground"
          }`}
        >
          <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} size={13} />
          {copied ? "Copied" : "Copy"}
        </div>
      </button>

      {/* Weekly earnings — just the number and a mood, no day-by-day detail.
          A quiet ascending-coin motif stands in for a chart. */}
      <div className="relative mt-3 overflow-hidden rounded-2xl border border-border p-4">
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
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
            <TrendUpIcon size={12} weight="bold" />
            18%
          </div>
        </div>
      </div>

      {/* Transaction actions */}
      <div className="mt-3 grid grid-cols-3 gap-3 h-96">
        <button className="flex h-full flex-col justify-between rounded-4xl bg-blue-600 p-4 text-left transition-colors hover:bg-blue-700 active:scale-[0.98]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
            <HugeiconsIcon
              icon={QrCode01Icon}
              size={24}
              className="text-white"
            />
          </div>
          <p className="font-semibold tracking-tight text-white">Receive</p>
        </button>

        <button className="flex h-full flex-col justify-between rounded-4xl bg-gray-50 p-4 text-left transition-colors hover:bg-gray-100 active:scale-[0.98]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <ArrowUpRightIcon size={24} className="text-gray-700" />
          </div>
          <p className="text-lg font-semibold tracking-tight text-foreground">
            Send
          </p>
        </button>

        <button className="flex h-full flex-col justify-between rounded-4xl bg-gray-50 p-4 text-left transition-colors hover:bg-gray-100 active:scale-[0.98]">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
            <HugeiconsIcon
              icon={MoneySend01Icon}
              size={24}
              className="text-gray-700"
            />
          </div>
          <p className="font-semibold tracking-tight text-foreground">
            Withdraw
          </p>
        </button>
      </div>
    </div>
  );
}
