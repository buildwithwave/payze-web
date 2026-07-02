"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  MinusSignIcon,
  PlusSignIcon,
  Delete02Icon,
  ShoppingBasket01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductThumb } from "@/components/products/product-thumb";
import { Product } from "@/services/catalog";
import { formatMoney, formatNaira } from "@/lib/format";

export interface CartItem {
  product: Product;
  quantity: number;
}

export function CartPanel({
  items,
  customerName,
  discount,
  onCustomerNameChange,
  onDiscountChange,
  onSetQuantity,
  onRemove,
  onClear,
  onCharge,
}: {
  items: CartItem[];
  customerName: string;
  discount: string;
  onCustomerNameChange: (value: string) => void;
  onDiscountChange: (value: string) => void;
  onSetQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
  onCharge: () => void;
}) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const discountNum = Math.min(Number(discount) || 0, subtotal);
  const total = subtotal - discountNum;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Current sale</h2>
          <p className="text-xs text-muted-foreground">
            {itemCount === 0
              ? "No items yet"
              : `${itemCount} item${itemCount === 1 ? "" : "s"}`}
          </p>
        </div>
        {items.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={onClear}
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex size-11 items-center justify-center rounded-full bg-gray-100">
              <HugeiconsIcon
                icon={ShoppingBasket01Icon}
                size={20}
                className="text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Scan a barcode or tap a product to add it.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex items-center gap-3">
                <ProductThumb name={product.name} image={product.image} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {product.name}
                  </p>
                  <p
                    className="text-xs text-muted-foreground"
                    style={{ fontFamily: "var(--font-currency)" }}
                  >
                    ₦{formatMoney(product.price)} each
                  </p>
                </div>

                {/* Quantity stepper */}
                <div className="flex shrink-0 items-center gap-1 rounded-full border border-border px-1 py-0.5">
                  <button
                    onClick={() =>
                      quantity === 1
                        ? onRemove(product.id)
                        : onSetQuantity(product.id, quantity - 1)
                    }
                    className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    aria-label={`Decrease quantity of ${product.name}`}
                  >
                    <HugeiconsIcon
                      icon={quantity === 1 ? Delete02Icon : MinusSignIcon}
                      size={12}
                    />
                  </button>
                  <span className="w-6 text-center text-sm font-medium tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => onSetQuantity(product.id, quantity + 1)}
                    disabled={quantity >= product.stock}
                    className="flex size-6 items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
                    aria-label={`Increase quantity of ${product.name}`}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={12} />
                  </button>
                </div>

                <p
                  className="w-20 shrink-0 text-right text-sm font-medium"
                  style={{ fontFamily: "var(--font-currency)" }}
                >
                  ₦{formatMoney(product.price * quantity)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Summary */}
      <div className="shrink-0 border-t border-border px-5 py-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label
              htmlFor="cart-customer"
              className="text-xs font-medium text-muted-foreground"
            >
              Customer (optional)
            </label>
            <Input
              id="cart-customer"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Walk-in"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="cart-discount"
              className="text-xs font-medium text-muted-foreground"
            >
              Discount (₦)
            </label>
            <Input
              id="cart-discount"
              type="number"
              inputMode="decimal"
              min="0"
              value={discount}
              onChange={(e) => onDiscountChange(e.target.value)}
              placeholder="0"
            />
          </div>
        </div>

        <div
          className="mt-4 space-y-1.5"
          style={{ fontFamily: "var(--font-currency)" }}
        >
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-sans">Subtotal</span>
            <span>₦{formatMoney(subtotal)}</span>
          </div>
          {discountNum > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="font-sans">Discount</span>
              <span>-₦{formatMoney(discountNum)}</span>
            </div>
          )}
          <div className="flex items-baseline justify-between pt-1">
            <span className="font-sans text-sm font-medium">Total</span>
            <span className="text-xl font-bold tracking-tight">
              ₦{formatMoney(total)}
            </span>
          </div>
        </div>

        <Button
          className="mt-4 w-full rounded-xl"
          size="lg"
          disabled={items.length === 0}
          onClick={onCharge}
        >
          Charge {items.length > 0 ? formatNaira(total) : ""}
        </Button>
      </div>
    </div>
  );
}
