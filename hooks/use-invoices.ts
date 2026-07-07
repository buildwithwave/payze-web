import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogService, CheckoutPayload, VerifyPaymentResult } from "@/services/catalog";
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

export type PaymentVerificationStatus =
  | "checking"
  | "success"
  | "not-confirmed"
  | "error"
  | "no-reference";

export interface PaymentVerificationState {
  status: PaymentVerificationStatus;
  result: VerifyPaymentResult | null;
}

// Nomba's server-to-server webhook is unreliable, so this page is the primary
// confirmation path: poll the verify endpoint for a little while to ride out
// the gap between the redirect landing here and Nomba settling the payment.
const VERIFY_POLL_INTERVAL_MS = 2500;
const VERIFY_POLL_TIMEOUT_MS = 18000;

/**
 * Verifies (and, on the backend, completes) a Nomba checkout from the
 * payment-success redirect. Polls with a fixed interval up to a time budget
 * while the payment is still unconfirmed, then settles into a terminal state.
 */
export function usePaymentVerification(orderReference: string | null) {
  const [state, setState] = useState<PaymentVerificationState>(() => ({
    status: orderReference ? "checking" : "no-reference",
    result: null,
  }));
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!orderReference) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const startedAt = Date.now();

    const poll = async () => {
      try {
        const result = await catalogService.verifyNombaPayment(orderReference);
        if (cancelled) return;

        if (result.completed) {
          setState({ status: "success", result });
          return;
        }

        if (!result.invoiceId || Date.now() - startedAt >= VERIFY_POLL_TIMEOUT_MS) {
          setState({ status: "not-confirmed", result });
          return;
        }

        setState({ status: "checking", result });
        timer = setTimeout(poll, VERIFY_POLL_INTERVAL_MS);
      } catch {
        if (!cancelled) setState({ status: "error", result: null });
      }
    };

    poll();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [orderReference, attempt]);

  const retry = () => {
    setState({ status: "checking", result: null });
    setAttempt((n) => n + 1);
  };

  return { ...state, retry };
}
