"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useBanks, useResolveAccount, useWithdraw } from "@/hooks/use-wallet";
import { toast } from "@/components/ui/toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import { AxiosError } from "axios";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
}

function getResolveErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.response?.data?.error || error.message;
  }
  return error instanceof Error ? error.message : "Could not resolve account name";
}

export function WithdrawDialog({ open, onOpenChange, availableBalance }: WithdrawDialogProps) {
  const { data: banks = [], isLoading: loadingBanks } = useBanks();
  const { mutate: resolveAccount, isPending: resolvingAccount } = useResolveAccount();
  const withdraw = useWithdraw();

  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const selectedBank = banks.find((bank) => bank.code === bankCode);

  // Trigger name enquiry when bank is selected and account number is 10 digits
  useEffect(() => {
    if (bankCode && accountNumber.length === 10) {
      resolveAccount(
        { bankCode, accountNumber },
        {
          onSuccess: (name) => {
            setResolvedName(name);
          },
          onError: (error) => {
            setResolveError(getResolveErrorMessage(error));
          },
        }
      );
    }
  }, [bankCode, accountNumber, resolveAccount]);

  const resetForm = () => {
    setAmount("");
    setBankCode("");
    setAccountNumber("");
    setResolvedName(null);
    setResolveError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleBankChange = (value: string | null) => {
    setBankCode(value || "");
    setResolvedName(null);
    setResolveError(null);
  };

  const handleAccountNumberChange = (value: string) => {
    setAccountNumber(value.replace(/[^0-9]/g, ""));
    setResolvedName(null);
    setResolveError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Invalid amount", "Please enter a valid amount greater than 0");
      return;
    }

    if (amountNum > availableBalance) {
      toast.error("Insufficient balance", "You cannot withdraw more than your wallet balance");
      return;
    }

    if (!resolvedName) {
      toast.error("Unresolved account", "Please ensure the recipient account name is resolved");
      return;
    }

    withdraw.mutate(
      {
        amount: amountNum,
        bankCode,
        accountNumber,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Withdraw Funds</DialogTitle>
        <DialogDescription>
          Transfer money from your wallet to a Nigerian bank account instantly.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Amount */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="withdraw-amount">Amount (₦)</Label>
              <span className="text-xs text-muted-foreground">
                Balance: ₦{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Input
              id="withdraw-amount"
              type="number"
              inputMode="decimal"
              min="1"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {/* Select Bank */}
          <div className="space-y-1.5">
            <Label htmlFor="withdraw-bank">Destination Bank</Label>
            {loadingBanks ? (
              <div className="h-9 w-full rounded border bg-gray-50 animate-pulse" />
            ) : (
              <Select value={bankCode} onValueChange={handleBankChange}>
                <SelectTrigger id="withdraw-bank" className="h-9 text-left">
                  {selectedBank ? (
                    <span className="truncate">{selectedBank.name}</span>
                  ) : (
                    <SelectValue placeholder="Select bank" />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto">
                  {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-1.5">
            <Label htmlFor="withdraw-account">Account Number</Label>
            <Input
              id="withdraw-account"
              type="text"
              pattern="[0-9]{10}"
              maxLength={10}
              placeholder="0123456789"
              value={accountNumber}
              onChange={(e) => handleAccountNumberChange(e.target.value)}
              required
            />
          </div>

          {/* Resolved Name Indicator */}
          {resolvingAccount && (
            <div className="flex items-center gap-2 rounded-xl bg-gray-50 border border-border px-4 py-3 animate-pulse">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-xs text-muted-foreground font-medium">
                Resolving recipient name...
              </span>
            </div>
          )}

          {resolvedName && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-emerald-800 animate-fade-in">
              <HugeiconsIcon icon={Tick01Icon} size={15} className="text-emerald-600 shrink-0" />
              <span className="text-sm font-semibold truncate uppercase">
                {resolvedName}
              </span>
            </div>
          )}

          {resolveError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-red-800 animate-fade-in">
              <HugeiconsIcon icon={Cancel01Icon} size={15} className="text-red-600 shrink-0" />
              <span className="text-xs font-medium truncate">
                {resolveError}
              </span>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={withdraw.isPending}
              disabled={!resolvedName || withdraw.isPending}
            >
              Withdraw
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
