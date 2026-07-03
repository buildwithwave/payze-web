import api from "@/lib/axios";

export interface Wallet {
  balance: number;
  currency: string;
  accountNumber: string | null;
  bankName: string | null;
  accountName: string;
}

export interface WalletSummary {
  total: number;
  changePercent: number;
  period: "day" | "week" | "month";
}

export interface Bank {
  name: string;
  code: string;
}

export interface Transaction {
  id: string;
  type: "credit" | "debit";
  channel: "transfer" | "card" | "withdrawal";
  amount: number;
  reference: string;
  counterparty?: string;
  status: "pending" | "successful" | "failed";
  createdAt: string;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
}

export const walletService = {
  getWallet: async (storeId: string): Promise<Wallet> => {
    const res = await api.get<Wallet>("/wallet", { params: { storeId } });
    return res.data;
  },

  getWalletSummary: async (storeId: string, period = "week"): Promise<WalletSummary> => {
    const res = await api.get<WalletSummary>("/wallet/summary", {
      params: { storeId, period },
    });
    return res.data;
  },

  getBanks: async (): Promise<Bank[]> => {
    const res = await api.get<Bank[]>("/banks");
    return res.data;
  },

  resolveAccount: async (bankCode: string, accountNumber: string): Promise<string> => {
    const res = await api.post<{ accountName: string }>("/wallet/resolve-account", {
      bankCode,
      accountNumber,
    });
    return res.data.accountName;
  },

  withdraw: async (
    storeId: string,
    amount: number,
    bankCode: string,
    accountNumber: string
  ): Promise<Transaction> => {
    const res = await api.post<Transaction>("/wallet/withdraw", {
      storeId,
      amount,
      bankCode,
      accountNumber,
    });
    return res.data;
  },

  getTransactions: async (
    storeId: string,
    type?: "credit" | "debit",
    page = 1,
    limit = 20
  ): Promise<PaginatedTransactions> => {
    const res = await api.get<PaginatedTransactions>("/transactions", {
      params: { storeId, type, page, limit },
    });
    return res.data;
  },
};
