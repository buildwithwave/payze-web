"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxList,
  ComboboxEmpty,
  ComboboxItem,
} from "@/components/ui/combobox";
import { useBanks, useResolveAccount, useWithdraw } from "@/hooks/use-wallet";
import { PaymentSuccessLottie } from "@/components/payment-success/payment-success-lottie";
import { formatMoney } from "@/lib/format";
import { AxiosError } from "axios";
import type { Bank } from "@/services/wallet";

interface WithdrawDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: number;
}

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.response?.data?.error || error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

export function WithdrawDialog({ open, onOpenChange, availableBalance }: WithdrawDialogProps) {
  const { data: banks = [], isLoading: loadingBanks } = useBanks();
  const { mutate: resolveAccount, isPending: resolvingAccount } = useResolveAccount();
  const withdraw = useWithdraw();

  const [step, setStep] = useState<"form" | "success">("form");
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [accountNumber, setAccountNumber] = useState("");
  const [resolvedName, setResolvedName] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const bankCode = selectedBank?.code ?? "";

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
            setResolveError(getErrorMessage(error));
          },
        }
      );
    }
  }, [bankCode, accountNumber, resolveAccount]);

  const resetForm = () => {
    setStep("form");
    setAmount("");
    setSelectedBank(null);
    setAccountNumber("");
    setResolvedName(null);
    setResolveError(null);
    setSubmitError(null);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) resetForm();
    onOpenChange(nextOpen);
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setSubmitError(null);
  };

  const handleBankChange = (bank: Bank | null) => {
    setSelectedBank(bank);
    setResolvedName(null);
    setResolveError(null);
    setSubmitError(null);
  };

  const handleAccountNumberChange = (value: string) => {
    setAccountNumber(value.replace(/[^0-9]/g, ""));
    setResolvedName(null);
    setResolveError(null);
    setSubmitError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const amountNum = Number(amount);

    if (isNaN(amountNum) || amountNum <= 0) {
      setSubmitError("Please enter a valid amount greater than 0");
      return;
    }

    if (amountNum > availableBalance) {
      setSubmitError("You cannot withdraw more than your wallet balance");
      return;
    }

    if (!resolvedName) {
      setSubmitError("Please wait for the recipient account name to resolve");
      return;
    }

    withdraw.mutate(
      { amount: amountNum, bankCode, accountNumber },
      {
        onSuccess: () => {
          setStep("success");
        },
        onError: (error) => {
          setSubmitError(getErrorMessage(error));
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        {step === "success" ? (
          <div className="flex flex-col items-center py-2 text-center">
            <DialogTitle className="sr-only">Transfer successful</DialogTitle>
            <PaymentSuccessLottie />
            <div className="mt-4 space-y-1">
              <p className="text-sm font-medium text-primary">Transfer successful</p>
              <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                ₦{formatMoney(Number(amount))}
              </h3>
              <p className="text-sm text-muted-foreground">
                Sent to {resolvedName} &middot; {selectedBank?.name}
              </p>
            </div>
            <Button
              size="lg"
              className="mt-6 w-full"
              onClick={() => handleOpenChange(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <>
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
                  onChange={(e) => handleAmountChange(e.target.value)}
                  aria-invalid={!!submitError}
                  required
                />
                {submitError && (
                  <p className="text-xs text-destructive">{submitError}</p>
                )}
              </div>

              {/* Select Bank */}
              <div className="space-y-1.5">
                <Label htmlFor="withdraw-bank">Destination Bank</Label>
                {loadingBanks ? (
                  <div className="h-9 w-full rounded border bg-gray-50 animate-pulse" />
                ) : (
                  <Combobox
                    items={banks}
                    value={selectedBank}
                    onValueChange={handleBankChange}
                    itemToStringLabel={(bank: Bank) => bank.name}
                  >
                    <ComboboxInputGroup>
                      <ComboboxInput id="withdraw-bank" placeholder="Search bank..." />
                      <ComboboxClear />
                    </ComboboxInputGroup>
                    <ComboboxContent className="max-h-60 overflow-y-auto">
                      <ComboboxEmpty>No banks found</ComboboxEmpty>
                      <ComboboxList>
                        {(bank: Bank) => (
                          <ComboboxItem key={bank.code} value={bank}>
                            {bank.name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
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

              {/* Account Name — read-only, filled in once resolved */}
              {accountNumber.length === 10 && (
                <div className="space-y-1.5">
                  <Label htmlFor="withdraw-account-name">Account Name</Label>
                  <div className="relative">
                    <Input
                      id="withdraw-account-name"
                      value={resolvingAccount ? "Resolving..." : (resolvedName ?? "")}
                      disabled
                      readOnly
                      className="uppercase disabled:opacity-100"
                    />
                    {resolvingAccount && (
                      <div className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    )}
                  </div>
                  {resolveError && (
                    <p className="text-xs text-destructive">{resolveError}</p>
                  )}
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
