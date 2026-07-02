import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogService, CheckoutPayload } from "@/services/catalog";
import { toast } from "@/components/ui/toast";

export function useInvoices() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: catalogService.getInvoices,
  });
}

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckoutPayload) => catalogService.checkout(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      toast.error(
        "Payment failed",
        error instanceof Error ? error.message : "Something went wrong",
      );
    },
  });
}
