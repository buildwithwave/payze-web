"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon, CancelCircleIcon } from "@hugeicons/core-free-icons";

const rules = [
  { test: (p: string) => p.length >= 8, label: "At least 8 characters" },
  { test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p: string) => /\d/.test(p), label: "One number" },
  { test: (p: string) => /[^a-zA-Z0-9]/.test(p), label: "One special character" },
];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  return (
    <ul className="space-y-1 mt-2">
      {rules.map(({ test, label }) => {
        const passed = test(password);
        return (
          <li key={label} className="flex items-center gap-1.5">
            <HugeiconsIcon
              icon={passed ? CheckmarkCircle02Icon : CancelCircleIcon}
              size={14}
              className={passed ? "text-emerald-600" : "text-red-500"}
            />
            <span className={`text-xs ${passed ? "text-emerald-600" : "text-red-500"}`}>
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
