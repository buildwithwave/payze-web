import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useStore } from "@/lib/store-context";
import { walletService } from "@/services/wallet";
import { toast } from "@/components/ui/toast";
import { AxiosError } from "axios";

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.response?.data?.error || error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

export function useWallet() {
  const { activeStoreId } = useStore();

  return useQuery({
    queryKey: ["wallet", activeStoreId],
    queryFn: () => walletService.getWallet(activeStoreId!),
    enabled: !!activeStoreId,
  });
}

export function useWalletSummary(period = "week") {
  const { activeStoreId } = useStore();

  return useQuery({
    queryKey: ["wallet-summary", activeStoreId, period],
    queryFn: () => walletService.getWalletSummary(activeStoreId!, period),
    enabled: !!activeStoreId,
  });
}

export function useBanks() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: walletService.getBanks,
    staleTime: 24 * 60 * 60 * 1000, // cache for 24 hours
  });
}

export function useResolveAccount() {
  return useMutation({
    mutationFn: ({ bankCode, accountNumber }: { bankCode: string; accountNumber: string }) =>
      walletService.resolveAccount(bankCode, accountNumber),
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  const { activeStoreId } = useStore();

  return useMutation({
    mutationFn: ({
      amount,
      bankCode,
      accountNumber,
    }: {
      amount: number;
      bankCode: string;
      accountNumber: string;
    }) => walletService.withdraw(activeStoreId!, amount, bankCode, accountNumber),
    onSuccess: (tx) => {
      queryClient.invalidateQueries({ queryKey: ["wallet", activeStoreId] });
      queryClient.invalidateQueries({ queryKey: ["wallet-summary", activeStoreId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", activeStoreId] });
      queryClient.invalidateQueries({ queryKey: ["metrics-overview", activeStoreId] });
      toast.success("Transfer successful", `Withdrew ₦${tx.amount.toLocaleString()} successfully`);
    },
    onError: (error) => {
      toast.error("Withdrawal failed", getErrorMessage(error));
    },
  });
}

export function useTransactions(type?: "credit" | "debit", page = 1, limit = 20) {
  const { activeStoreId } = useStore();

  return useQuery({
    queryKey: ["transactions", activeStoreId, type, page, limit],
    queryFn: () => walletService.getTransactions(activeStoreId!, type, page, limit),
    enabled: !!activeStoreId,
  });
}
