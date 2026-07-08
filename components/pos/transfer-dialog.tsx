"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";
import { HugeiconsIcon } from "@hugeicons/react";
import { CopyIcon } from "@hugeicons/core-free-icons";
import { toast } from "@/components/ui/toast";
import { useState, useEffect, useRef } from "react";
import { catalogService } from "@/services/catalog";
import { useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/store-context";

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  total: number;
  invoiceId: string;
  virtualAccount: {
    accountNumber: string;
    bankName: string;
    accountName: string;
  } | null;
  onSuccess: () => void;
}

export function TransferDialog({
  open,
  onOpenChange,
  total,
  invoiceId,
  virtualAccount,
  onSuccess,
}: TransferDialogProps) {
  const [checking, setChecking] = useState(false);
  const queryClient = useQueryClient();
  const { activeStoreId } = useStore();
  const pollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!open || !virtualAccount) {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
      return;
    }

    // Auto-detect payment by polling the backend (which checks the DB status updated by the webhook)
    pollInterval.current = setInterval(async () => {
      try {
        const res = await catalogService.verifyNombaPayment(
          invoiceId,
          total,
          virtualAccount.accountNumber,
        );
        if (res.status === "success") {
          if (pollInterval.current) {
            clearInterval(pollInterval.current);
            pollInterval.current = null;
          }
          toast.success("Transfer confirmed automatically!", "Payment received successfully.");

          queryClient.invalidateQueries({ queryKey: ["invoices", activeStoreId] });
          queryClient.invalidateQueries({ queryKey: ["products", activeStoreId] });
          queryClient.invalidateQueries({ queryKey: ["wallet", activeStoreId] });
          queryClient.invalidateQueries({ queryKey: ["wallet-summary", activeStoreId] });
          queryClient.invalidateQueries({ queryKey: ["metrics-overview", activeStoreId] });
          queryClient.invalidateQueries({ queryKey: ["sales-trend", activeStoreId] });
          queryClient.invalidateQueries({ queryKey: ["transactions", activeStoreId] });

          onSuccess();
        }
      } catch (err) {
        // Silently fail on background poll errors
      }
    }, 4000);

    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };
  }, [open, invoiceId, total, virtualAccount, activeStoreId, queryClient, onSuccess]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard", `${label} copied`);
  };

  const handleVerify = async () => {
    if (!virtualAccount) return;
    setChecking(true);
    try {
      const res = await catalogService.verifyNombaPayment(
        invoiceId,
        total,
        virtualAccount.accountNumber,
      );
      if (res.status === "success") {
        toast.success("Transfer confirmed!", "Payment received successfully.");

        // Invalidate queries to reflect the successful payment
        queryClient.invalidateQueries({
          queryKey: ["invoices", activeStoreId],
        });
        queryClient.invalidateQueries({
          queryKey: ["products", activeStoreId],
        });
        queryClient.invalidateQueries({ queryKey: ["wallet", activeStoreId] });
        queryClient.invalidateQueries({
          queryKey: ["wallet-summary", activeStoreId],
        });
        queryClient.invalidateQueries({
          queryKey: ["metrics-overview", activeStoreId],
        });
        queryClient.invalidateQueries({
          queryKey: ["sales-trend", activeStoreId],
        });
        queryClient.invalidateQueries({
          queryKey: ["transactions", activeStoreId],
        });

        onSuccess();
      } else {
        toast.info(
          "Transfer pending",
          "We haven't received the transfer yet. It might take a few moments. Please check again shortly.",
        );
      }
    } catch (err: any) {
      toast.error(
        "Error checking transfer",
        err.message || "An unexpected error occurred.",
      );
    } finally {
      setChecking(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !checking && onOpenChange(next)}
    >
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Transfer Instructions</DialogTitle>
        <DialogDescription>
          Please transfer exactly ₦{formatMoney(total)} to the account below.
        </DialogDescription>

        {virtualAccount && (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-border p-4 bg-gray-50/50">
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-xs text-muted-foreground font-medium">
                    Bank
                  </span>
                  <span className="text-sm font-semibold">
                    {virtualAccount.bankName || "Nomba"}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-xs text-muted-foreground font-medium">
                    Account Number
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tracking-wider">
                      {virtualAccount.accountNumber}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          virtualAccount.accountNumber,
                          "Account Number",
                        )
                      }
                      className="p-1 hover:bg-gray-200 rounded text-muted-foreground transition-colors outline-none cursor-pointer"
                    >
                      <HugeiconsIcon icon={CopyIcon} size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-border/50">
                  <span className="text-xs text-muted-foreground font-medium">
                    Account Name
                  </span>
                  <span className="text-sm font-semibold max-w-[200px] text-right truncate">
                    {virtualAccount.accountName}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-muted-foreground font-medium">
                    Amount
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-foreground">
                      ₦{formatMoney(total)}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(total.toString(), "Amount")
                      }
                      className="p-1 hover:bg-gray-200 rounded text-muted-foreground transition-colors outline-none cursor-pointer"
                    >
                      <HugeiconsIcon icon={CopyIcon} size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-11 relative overflow-hidden"
              size="lg"
              loading={checking}
              onClick={handleVerify}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] animate-[shimmer_2.5s_infinite]" />
              I have sent the money
            </Button>
            <p className="text-center text-xs text-muted-foreground pt-1">
              {checking ? "Checking..." : "We are automatically checking for your payment..."}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
