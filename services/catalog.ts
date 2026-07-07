import api from "@/lib/axios";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice?: number;
  stock: number;
  lowStockThreshold: number;
  barcode: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;

export type PaymentMethod = "cash" | "nomba";

export interface InvoiceItem {
  productId: string | null;
  name: string;
  price: number;
  quantity: number;
}

export interface Invoice {
  id: string;
  number: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountTendered?: number;
  change?: number;
  customerName?: string;
  createdAt: string;
}

export interface CheckoutPayload {
  items: { productId: string; name?: string; price?: number; quantity: number }[];
  discount: number;
  paymentMethod: PaymentMethod;
  amountTendered?: number;
  customerName?: string;
}

export interface VerifyPaymentResult {
  status: "success" | "pending";
  message: string;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const DEFAULT_CATEGORIES = [
  "Groceries",
  "Drinks",
  "Snacks",
  "Household",
  "Personal Care",
  "Other",
];

/** Generate a random 13-digit EAN-like barcode string */
export function generateBarcode(): string {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10));
  // calculate EAN-13 check digit
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return [...digits, check].join("");
}

export const catalogService = {

  getProducts: async (storeId: string): Promise<Product[]> => {
    const res = await api.get<Paginated<Product>>("/products", {
      params: { storeId, limit: 100 },
    });
    return res.data.data;
  },

  getProductByBarcode: async (storeId: string, code: string): Promise<Product> => {
    const res = await api.get<Product>(`/products/barcode/${code}`, {
      params: { storeId },
    });
    return res.data;
  },

  createProduct: async (storeId: string, input: ProductInput): Promise<Product> => {
    const res = await api.post<Product>("/products", {
      storeId,
      ...input,
    });
    return res.data;
  },

  updateProduct: async (
    storeId: string,
    id: string,
    input: Partial<ProductInput>
  ): Promise<Product> => {
    const res = await api.patch<Product>(`/products/${id}`, input, {
      params: { storeId },
    });
    return res.data;
  },

  deleteProduct: async (storeId: string, id: string): Promise<void> => {
    await api.delete(`/products/${id}`, {
      params: { storeId },
    });
  },

  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    const res = await api.post<{ url: string }>("/uploads", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data.url;
  },

  getInvoices: async (storeId: string): Promise<Invoice[]> => {
    const res = await api.get<Paginated<Invoice>>("/invoices", {
      params: { storeId, limit: 100 },
    });
    return res.data.data;
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const res = await api.get<Invoice>(`/invoices/${id}`);
    return res.data;
  },

  checkout: async (storeId: string, payload: CheckoutPayload): Promise<Invoice> => {
    const items = payload.items.map((item) => ({
      productId: item.productId!,
      quantity: item.quantity,
    }));

    const res = await api.post<Invoice>("/sales/checkout", {
      storeId,
      items,
      discount: payload.discount,
      paymentMethod: payload.paymentMethod,
      amountTendered: payload.amountTendered,
      customerName: payload.customerName || undefined,
    });
    return res.data;
  },

  createNombaCheckout: async (storeId: string, payload: CheckoutPayload): Promise<{ 
    invoiceId: string, 
    orderReference: string,
    virtualAccount: { accountNumber: string, bankName: string, accountName: string }
  }> => {
    const items = payload.items.map((item) => ({
      productId: item.productId!,
      quantity: item.quantity,
    }));

    const res = await api.post("/checkout/session", {
      storeId,
      items,
      discount: payload.discount,
      customerName: payload.customerName || undefined,
      paymentMethod: payload.paymentMethod,
    });
    return res.data;
  },

  sendReceipt: async (
    invoiceId: string,
    payload: { channel: "email" | "whatsapp"; destination: string }
  ): Promise<{ sent: boolean; channel: string; whatsappUrl?: string }> => {
    const res = await api.post(`/invoices/${invoiceId}/send-receipt`, payload);
    return res.data;
  },

  lookupInvoice: async (code: string, storeId: string): Promise<Invoice & { storeName: string }> => {
    // Note: This endpoint is public, we use the regular api instance (it handles auth optionality)
    const res = await api.get(`/invoices/lookup/${code}`, {
      params: { storeId }
    });
    return res.data;
  },

  getPublicStores: async (): Promise<{ id: string; name: string }[]> => {
    const res = await api.get(`/stores/public`);
    return res.data;
  },

  verifyNombaPayment: async (invoiceId: string, expectedAmount: number, accountNumber: string): Promise<VerifyPaymentResult> => {
    const res = await api.post<VerifyPaymentResult>("/payments/verify", {
      invoiceId,
      expectedAmount,
      accountNumber,
    });
    return res.data;
  },
};
