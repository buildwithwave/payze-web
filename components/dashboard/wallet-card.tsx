"use client";

import { useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ViewIcon,
  EyeOffIcon,
  Copy01Icon,
  MoneySend01Icon,
} from "@hugeicons/core-free-icons";

export function WalletCard() {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  const balance = "2,450,000.00";
  const accountNumber = "8012345678";
  const bankName = "Nomba MFB";

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-6">
      {/* Currency badge */}
      <div className="mb-4">
        <div className="border border-border pl-2 pr-3 py-1 rounded-full w-fit flex items-center gap-1.5">
          <div className=" overflow-hidden shrink-0 relative">
            <Image
              src="/flags/ng2.png"
              alt="NGN"
              height={16}
              width={16}
              className=""
            />
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Nigerian Naira
          </p>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-medium text-muted-foreground">₦</span>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            {visible ? balance : "••••••••"}
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

      {/* Account info + Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 group cursor-pointer"
        >
          <span className="text-sm font-mono text-foreground">
            {accountNumber}
          </span>
          <span className="text-muted-foreground/30">•</span>
          <span className="text-xs text-muted-foreground">{bankName}</span>
          <HugeiconsIcon
            icon={Copy01Icon}
            size={12}
            className="text-muted-foreground/50 group-hover:text-muted-foreground transition-colors"
          />
          {copied && (
            <span className="text-[10px] text-emerald-500 font-medium">
              Copied
            </span>
          )}
        </button>

        {/* <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors cursor-pointer">
          Withdraw
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </button> */}
      </div>
    </div>
  );
}
