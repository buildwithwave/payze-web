import api from "@/lib/axios";

export interface MetricsOverview {
  products: number;
  orders: number;
  stores: number;
  invoices: number;
}

export interface SalesTrendPoint {
  label: string;
  date: string;
  sales: number;
}

export interface SalesTrend {
  range: "7D" | "1M" | "3M" | "6M" | "1Y";
  points: SalesTrendPoint[];
}

export const metricsService = {
  getOverview: async (storeId: string): Promise<MetricsOverview> => {
    const res = await api.get<MetricsOverview>("/metrics/overview", {
      params: { storeId },
    });
    return res.data;
  },

  getSalesTrend: async (storeId: string, range: string): Promise<SalesTrend> => {
    const res = await api.get<SalesTrend>("/metrics/sales-trend", {
      params: { storeId, range },
    });
    return res.data;
  },
};
