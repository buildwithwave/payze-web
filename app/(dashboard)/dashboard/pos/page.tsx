"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BarCode02Icon,
  Camera01Icon,
  Package01Icon,
  PlusSignIcon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { ProductThumb } from "@/components/products/product-thumb";
import { CartPanel, CartItem } from "@/components/pos/cart-panel";
import { PaymentDialog } from "@/components/pos/payment-dialog";
import { ReceiptDialog } from "@/components/pos/receipt-dialog";
import { CameraScannerDialog } from "@/components/pos/camera-scanner-dialog";
import { useProducts } from "@/hooks/use-products";
import { useCheckout, useNombaCheckout } from "@/hooks/use-invoices";
import { useUser } from "@/hooks/use-auth";
import { Invoice, PaymentMethod, Product } from "@/services/catalog";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function PosPage() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const { data: user } = useUser();
  const checkout = useCheckout();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [discount, setDiscount] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const categories = useMemo(
    () => Array.from(new Set((products ?? []).map((p) => p.category))).sort(),
    [products],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (products ?? []).filter((p) => {
      if (activeCategory && p.category !== activeCategory) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q)
      );
    });
  }, [products, search, activeCategory]);

  // A USB barcode scanner types anywhere on the page — route those
  // keystrokes into the search box so scans always land.
  const dialogShowing = paymentOpen || scannerOpen || !!completedInvoice;
  useEffect(() => {
    if (dialogShowing) return;
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const typingInField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      if (typingInField || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length === 1 && searchRef.current) {
        searchRef.current.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dialogShowing]);

  const addToCart = (product: Product): boolean => {
    if (product.stock === 0) {
      toast.warning("Out of stock", `${product.name} has no stock left`);
      return false;
    }
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing && existing.quantity >= product.stock) {
      toast.warning(
        "No more in stock",
        `Only ${product.stock} of ${product.name} available`,
      );
      return false;
    }
    setCart((prev) => {
      const found = prev.find((item) => item.product.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    return true;
  };

  // Stable identity via ref so the camera stream doesn't restart every
  // time the cart changes while the scanner dialog is open.
  const cameraScanRef = useRef<(code: string) => { ok: boolean; label: string }>(
    () => ({ ok: false, label: "" }),
  );
  useEffect(() => {
    cameraScanRef.current = (code: string) => {
      const product = (products ?? []).find(
        (p) => p.barcode.toLowerCase() === code.toLowerCase(),
      );
      if (!product) {
        return { ok: false, label: `No product with code ${code}` };
      }
      const added = addToCart(product);
      return added
        ? { ok: true, label: `Added ${product.name}` }
        : { ok: false, label: `${product.name} — no more stock to add` };
    };
  });
  const handleCameraScan = useCallback(
    (code: string) => cameraScanRef.current(code),
    [],
  );

  const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const code = search.trim().toLowerCase();
    if (!code) return;

    const byBarcode = (products ?? []).find(
      (p) => p.barcode.toLowerCase() === code,
    );
    const match =
      byBarcode ?? (filtered.length === 1 ? filtered[0] : undefined);

    if (match) {
      if (addToCart(match)) setSearch("");
    } else {
      toast.warning("No match found", `Nothing with the code “${search.trim()}”`);
    }
  };

  const setQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity: Math.min(Math.max(1, quantity), item.product.stock),
            }
          : item,
      ),
    );
  };

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const total = subtotal - Math.min(Number(discount) || 0, subtotal);

  const nombaCheckout = useNombaCheckout();

  const handleConfirmPayment = (
    method: PaymentMethod,
    amountTendered?: number,
  ) => {
    const payload = {
      items: cart.map(({ product, quantity }) => ({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      })),
      discount: Math.min(Number(discount) || 0, subtotal),
      paymentMethod: method,
      amountTendered,
      customerName,
    };

    if (method === "cash") {
      checkout.mutate(payload, {
        onSuccess: (invoice) => {
          setPaymentOpen(false);
          setCompletedInvoice(invoice);
          setCart([]);
          setCustomerName("");
          setDiscount("");
        },
      });
    } else {
      nombaCheckout.mutate(payload, {
        onSuccess: (data) => {
          setPaymentOpen(false);
          setCart([]);
          setCustomerName("");
          setDiscount("");
          // Open Nomba Checkout Link in a new tab
          window.open(data.checkoutLink, "_blank");
          toast.success("Please complete the payment in the new tab");
        },
      });
    }
  };

  return (
    <div className="flex h-full">
      {/* Product picker */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 px-6 pt-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-semibold tracking-tight">
                Point of Sale
              </h1>
              <p className="text-sm text-muted-foreground">
                Scan a barcode or tap products to build the sale.
              </p>
            </div>
          </div>

          {/* Scan / search */}
          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <HugeiconsIcon
                icon={BarCode02Icon}
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchSubmit}
                placeholder="Scan barcode or search products…"
                className="h-10 rounded-full border-transparent bg-gray-100 pl-9 text-base focus-visible:border-transparent focus-visible:bg-gray-200/70"
                aria-label="Scan barcode or search products"
                autoComplete="off"
                autoFocus
              />
            </div>
            <button
              onClick={() => setScannerOpen(true)}
              className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-gray-100 px-4 text-sm font-medium text-muted-foreground transition-colors outline-none hover:bg-gray-200/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <HugeiconsIcon icon={Camera01Icon} size={16} strokeWidth={1.5} />
              Scan
            </button>
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setActiveCategory(null)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                  !activeCategory
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-gray-100 hover:text-foreground",
                )}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() =>
                    setActiveCategory(activeCategory === c ? null : c)
                  }
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer",
                    activeCategory === c
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-5">
              <div className="flex items-center gap-2 text-destructive">
                <HugeiconsIcon icon={AlertCircleIcon} size={16} />
                <p className="text-sm font-medium">
                  Couldn&apos;t load your products
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Try again
              </Button>
            </div>
          ) : (products ?? []).length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
                <HugeiconsIcon
                  icon={Package01Icon}
                  size={22}
                  className="text-muted-foreground"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                <p className="text-sm font-medium">Nothing to sell yet</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Add products to your catalogue to start selling.
                </p>
              </div>
              <Button
                size="sm"
                className="h-9 gap-1.5 px-4"
                render={<Link href="/dashboard/products" />}
                nativeButton={false}
              >
                <HugeiconsIcon icon={PlusSignIcon} size={14} />
                Add products
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm font-medium">Nothing matches</p>
              <p className="text-xs text-muted-foreground">
                No product with that name or barcode.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setActiveCategory(null);
                }}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((product) => {
                const inCart =
                  cart.find((item) => item.product.id === product.id)
                    ?.quantity ?? 0;
                const soldOut = product.stock === 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={soldOut}
                    className={cn(
                      "group relative flex flex-col items-start gap-3 rounded-xl border border-border p-4 text-left transition-all outline-none hover:border-primary/40 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.99] cursor-pointer",
                      soldOut && "pointer-events-none opacity-50",
                    )}
                  >
                    {inCart > 0 && (
                      <span className="absolute top-2.5 right-2.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                        {inCart}
                      </span>
                    )}
                    <ProductThumb
                      name={product.name}
                      image={product.image}
                      className="size-10 rounded-lg text-base"
                    />
                    <div className="min-w-0 w-full">
                      <p className="truncate text-sm font-medium text-foreground">
                        {product.name}
                      </p>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          ₦{formatMoney(product.price)}
                        </p>
                        <p
                          className={cn(
                            "text-[11px] font-medium",
                            soldOut
                              ? "text-red-500"
                              : product.stock <= product.lowStockThreshold
                                ? "text-amber-600"
                                : "text-muted-foreground",
                          )}
                        >
                          {soldOut ? "Sold out" : `${product.stock} left`}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="w-[380px] shrink-0">
        <CartPanel
          items={cart}
          customerName={customerName}
          discount={discount}
          onCustomerNameChange={setCustomerName}
          onDiscountChange={setDiscount}
          onSetQuantity={setQuantity}
          onRemove={removeItem}
          onClear={() => setCart([])}
          onCharge={() => setPaymentOpen(true)}
        />
      </div>

      <CameraScannerDialog
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onScan={handleCameraScan}
      />
      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        total={total}
        pending={checkout.isPending}
        onConfirm={handleConfirmPayment}
      />
      <ReceiptDialog
        invoice={completedInvoice}
        storeName={user?.businessName}
        onClose={() => {
          setCompletedInvoice(null);
          searchRef.current?.focus();
        }}
      />
    </div>
  );
}
