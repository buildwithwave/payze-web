// Client-side catalog store backed by localStorage.
// Mirrors the async shape of the axios services so it can be swapped
// for real API calls without touching the hooks or UI.

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

export type PaymentMethod = "cash" | "transfer" | "card";

export interface InvoiceItem {
  productId: string;
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
  items: InvoiceItem[];
  discount: number;
  paymentMethod: PaymentMethod;
  amountTendered?: number;
  customerName?: string;
}

export const DEFAULT_CATEGORIES = [
  "Groceries",
  "Drinks",
  "Snacks",
  "Household",
  "Personal Care",
  "Other",
];

const PRODUCTS_KEY = "payze_products";
const INVOICES_KEY = "payze_invoices";
const INVOICE_SEQ_KEY = "payze_invoice_seq";

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(key) || "[]") as T[];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextInvoiceNumber(): string {
  const seq = Number(localStorage.getItem(INVOICE_SEQ_KEY) || "0") + 1;
  localStorage.setItem(INVOICE_SEQ_KEY, String(seq));
  return `INV-${String(seq).padStart(4, "0")}`;
}

export function generateBarcode(): string {
  let code = "2";
  for (let i = 0; i < 12; i++) code += Math.floor(Math.random() * 10);
  return code;
}

export const catalogService = {
  getProducts: async (): Promise<Product[]> =>
    read<Product>(PRODUCTS_KEY).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),

  createProduct: async (input: ProductInput): Promise<Product> => {
    const products = read<Product>(PRODUCTS_KEY);
    if (
      input.barcode &&
      products.some((p) => p.barcode === input.barcode)
    ) {
      throw new Error("A product with this barcode already exists");
    }
    const now = new Date().toISOString();
    const product: Product = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    write(PRODUCTS_KEY, [...products, product]);
    return product;
  },

  updateProduct: async (
    id: string,
    input: Partial<ProductInput>,
  ): Promise<Product> => {
    const products = read<Product>(PRODUCTS_KEY);
    const existing = products.find((p) => p.id === id);
    if (!existing) throw new Error("Product not found");
    if (
      input.barcode &&
      products.some((p) => p.id !== id && p.barcode === input.barcode)
    ) {
      throw new Error("A product with this barcode already exists");
    }
    const updated: Product = {
      ...existing,
      ...input,
      updatedAt: new Date().toISOString(),
    };
    write(
      PRODUCTS_KEY,
      products.map((p) => (p.id === id ? updated : p)),
    );
    return updated;
  },

  deleteProduct: async (id: string): Promise<void> => {
    write(
      PRODUCTS_KEY,
      read<Product>(PRODUCTS_KEY).filter((p) => p.id !== id),
    );
  },

  getInvoices: async (): Promise<Invoice[]> =>
    read<Invoice>(INVOICES_KEY).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ),

  checkout: async (payload: CheckoutPayload): Promise<Invoice> => {
    if (payload.items.length === 0) throw new Error("Cart is empty");

    const products = read<Product>(PRODUCTS_KEY);
    const subtotal = payload.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const total = Math.max(0, subtotal - payload.discount);

    const invoice: Invoice = {
      id: crypto.randomUUID(),
      number: nextInvoiceNumber(),
      items: payload.items,
      subtotal,
      discount: payload.discount,
      total,
      paymentMethod: payload.paymentMethod,
      amountTendered: payload.amountTendered,
      change:
        payload.paymentMethod === "cash" && payload.amountTendered
          ? Math.max(0, payload.amountTendered - total)
          : undefined,
      customerName: payload.customerName?.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    write(
      PRODUCTS_KEY,
      products.map((p) => {
        const sold = payload.items.find((i) => i.productId === p.id);
        return sold
          ? { ...p, stock: Math.max(0, p.stock - sold.quantity) }
          : p;
      }),
    );
    write(INVOICES_KEY, [...read<Invoice>(INVOICES_KEY), invoice]);
    return invoice;
  },

  seedSampleProducts: async (): Promise<Product[]> => {
    const samples: Array<
      Pick<Product, "name" | "category" | "price" | "stock">
    > = [
      { name: "Golden Penny Semovita 1kg", category: "Groceries", price: 1850, stock: 40 },
      { name: "Dangote Sugar 500g", category: "Groceries", price: 950, stock: 60 },
      { name: "Indomie Chicken 70g", category: "Groceries", price: 350, stock: 200 },
      { name: "Peak Milk Tin 170g", category: "Groceries", price: 1200, stock: 48 },
      { name: "Coca-Cola 50cl", category: "Drinks", price: 400, stock: 120 },
      { name: "Eva Water 75cl", category: "Drinks", price: 300, stock: 90 },
      { name: "Chivita Juice 1L", category: "Drinks", price: 1700, stock: 35 },
      { name: "Gala Sausage Roll", category: "Snacks", price: 350, stock: 150 },
      { name: "Digestive Biscuits", category: "Snacks", price: 1500, stock: 25 },
      { name: "Sunlight Detergent 900g", category: "Household", price: 2200, stock: 30 },
      { name: "Hypo Bleach 500ml", category: "Household", price: 650, stock: 45 },
      { name: "Dettol Soap 110g", category: "Personal Care", price: 700, stock: 80 },
    ];
    const now = new Date().toISOString();
    const products: Product[] = samples.map((s) => ({
      ...s,
      id: crypto.randomUUID(),
      lowStockThreshold: 10,
      barcode: generateBarcode(),
      createdAt: now,
      updatedAt: now,
    }));
    write(PRODUCTS_KEY, [...read<Product>(PRODUCTS_KEY), ...products]);
    return products;
  },
};
