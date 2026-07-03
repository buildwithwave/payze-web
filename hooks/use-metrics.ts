import { useQuery } from "@tanstack/react-query";
import { useStore } from "@/lib/store-context";
import { metricsService } from "@/services/metrics";

export function useMetricsOverview() {
  const { activeStoreId } = useStore();

  return useQuery({
    queryKey: ["metrics-overview", activeStoreId],
    queryFn: () => metricsService.getOverview(activeStoreId!),
    enabled: !!activeStoreId,
  });
}

export function useSalesTrend(range: string) {
  const { activeStoreId } = useStore();

  return useQuery({
    queryKey: ["sales-trend", activeStoreId, range],
    queryFn: () => metricsService.getSalesTrend(activeStoreId!, range),
    enabled: !!activeStoreId,
  });
}
