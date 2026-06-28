"use client";

import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  AlertCircleIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";

type ToastVariant = "success" | "error" | "warning" | "info";

const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckmarkCircle02Icon; iconColor: string; bg: string; border: string; text: string }
> = {
  success: {
    icon: CheckmarkCircle02Icon,
    iconColor: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-900 dark:text-emerald-100",
  },
  error: {
    icon: CancelCircleIcon,
    iconColor: "text-red-700 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    text: "text-red-900 dark:text-red-100",
  },
  warning: {
    icon: AlertCircleIcon,
    iconColor: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-900 dark:text-amber-100",
  },
  info: {
    icon: InformationCircleIcon,
    iconColor: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-900 dark:text-blue-100",
  },
};

function CustomToast({
  variant,
  title,
  description,
}: {
  variant: ToastVariant;
  title: string;
  description?: string;
}) {
  const config = variantConfig[variant];

  return (
    <div className={`flex items-center gap-2.5 w-full rounded-lg border px-3 py-2.5 ${config.bg} ${config.border}`}>
      <HugeiconsIcon
        icon={config.icon}
        size={16}
        className={`shrink-0 ${config.iconColor}`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${config.text}`}>{title}</p>
        {description && (
          <p className={`text-xs ${config.text} opacity-70`}>{description}</p>
        )}
      </div>
    </div>
  );
}

function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "w-full max-w-xs",
        },
      }}
    />
  );
}

function showToast(variant: ToastVariant, title: string, description?: string) {
  return sonnerToast.custom(() => (
    <CustomToast variant={variant} title={title} description={description} />
  ));
}

const toast = {
  success: (title: string, description?: string) =>
    showToast("success", title, description),
  error: (title: string, description?: string) =>
    showToast("error", title, description),
  warning: (title: string, description?: string) =>
    showToast("warning", title, description),
  info: (title: string, description?: string) =>
    showToast("info", title, description),
};

export { Toaster, toast };
