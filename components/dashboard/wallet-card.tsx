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
import { ArrowUpRightIcon } from "@phosphor-icons/react";

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
        <div className="border border-border pl-1.5 pr-3 py-1 rounded-full w-fit flex items-center gap-2">
          <div className=" overflow-hidden shrink-0 relative">
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
      <div className="mb-2 flex items-center gap-2">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-medium text-muted-foreground">₦</span>
          <h2 className="text-4xl font-bold tracking-tight text-foreground">
            {visible ? balance : "****.••"}
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
          <span className="text-sm font-mono text-[#1f1f1f] font-semibold">
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
      </div>

      <div className="flex items-center gap-4 mt-4">
        <button className="bg-gray-50 flex flex-col gap-2 p-3 rounded-2xl h-40 w-52 justify-between">
          <div className="bg-gray-100 rounded-full p-3 w-fit">
            <ArrowUpRightIcon size={16} className="text-gray-700" />
          </div>
          <p className="font-medium text-left px-2 tracking-tight">
            Send money
          </p>
        </button>
      </div>
    </div>
  );
}
