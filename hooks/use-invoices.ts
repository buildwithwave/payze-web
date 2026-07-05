import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogService, CheckoutPayload } from "@/services/catalog";
import { useStore } from "@/lib/store-context";
import { toast } from "@/components/ui/toast";
import { AxiosError } from "axios";

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.response?.data?.error || error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

export function useInvoices() {
  const { activeStoreId } = useStore();

  return useQuery({
    queryKey: ["invoices", activeStoreId],
    queryFn: () => catalogService.getInvoices(activeStoreId!),
    enabled: !!activeStoreId,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();
  const { activeStoreId } = useStore();

  return useMutation({
    mutationFn: (payload: CheckoutPayload) =>
      catalogService.checkout(activeStoreId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", activeStoreId] });
      queryClient.invalidateQueries({ queryKey: ["products", activeStoreId] });
      queryClient.invalidateQueries({ queryKey: ["wallet", activeStoreId] });
      queryClient.invalidateQueries({ queryKey: ["wallet-summary", activeStoreId] });
      queryClient.invalidateQueries({ queryKey: ["metrics-overview", activeStoreId] });
      queryClient.invalidateQueries({ queryKey: ["sales-trend", activeStoreId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", activeStoreId] });
      toast.success("Sale completed", "Invoice has been recorded");
    },
    onError: (error) => {
      toast.error("Payment failed", getErrorMessage(error));
    },
  });
}

export function useNombaCheckout() {
  const queryClient = useQueryClient();
  const { activeStoreId } = useStore();

  return useMutation({
    mutationFn: (payload: CheckoutPayload) =>
      catalogService.createNombaCheckout(activeStoreId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices", activeStoreId] });
      queryClient.invalidateQueries({ queryKey: ["products", activeStoreId] });
      queryClient.invalidateQueries({ queryKey: ["transactions", activeStoreId] });
      toast.success("Checkout link generated");
    },
    onError: (error) => {
      toast.error("Checkout failed", getErrorMessage(error));
    },
  });
}
