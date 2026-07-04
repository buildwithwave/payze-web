"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Search01Icon,
  Package01Icon,
  MoreHorizontalIcon,
  PencilEdit02Icon,
  Delete02Icon,
  ShoppingBasket01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductFormSheet } from "@/components/products/product-form-sheet";
import { DeleteProductDialog } from "@/components/products/delete-product-dialog";
import { ProductThumb } from "@/components/products/product-thumb";
import { useProducts, useSeedProducts } from "@/hooks/use-products";
import { Product } from "@/services/catalog";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

function StockIndicator({ product }: { product: Product }) {
  const low = product.stock <= product.lowStockThreshold;
  const out = product.stock === 0;
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          out ? "bg-red-500" : low ? "bg-amber-500" : "bg-emerald-500",
        )}
      />
      {out
        ? "Out of stock"
        : low
          ? `${product.stock} left`
          : `${product.stock} in stock`}
    </span>
  );
}

export default function ProductsPage() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const seedProducts = useSeedProducts();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

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
        p.name.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    });
  }, [products, search, activeCategory]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Everything you sell, in one catalogue.
          </p>
        </div>
        <Button size="sm" className="h-9 gap-1.5 px-4" onClick={openAdd}>
          <HugeiconsIcon icon={PlusSignIcon} size={14} />
          Add product
        </Button>
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full max-w-64">
          <HugeiconsIcon
            icon={Search01Icon}
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            className="h-9 rounded-full border-transparent bg-gray-100 pl-9 focus-visible:border-transparent focus-visible:bg-gray-200/70"
            aria-label="Search products"
            autoComplete="off"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1">
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

      {/* Content */}
      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-xl" />
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
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-border py-20 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-gray-100">
              <HugeiconsIcon
                icon={Package01Icon}
                size={22}
                className="text-muted-foreground"
                strokeWidth={1.5}
              />
            </div>
            <div>
              <p className="text-sm font-medium">No products yet</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Add your first product and it&apos;ll show up on the sales
                screen.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="h-9 gap-1.5 px-4" onClick={openAdd}>
                <HugeiconsIcon icon={PlusSignIcon} size={14} />
                Add product
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4"
                loading={seedProducts.isPending}
                onClick={() => seedProducts.mutate()}
              >
                Load sample products
              </Button>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-border py-16 text-center">
            <p className="text-sm font-medium">Nothing matches your search</p>
            <p className="text-xs text-muted-foreground">
              Try a different name or clear the filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setActiveCategory(null);
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2.5 pr-4 font-medium">Product</th>
                <th className="px-4 py-2.5 font-medium">Category</th>
                <th className="px-4 py-2.5 font-medium">Barcode</th>
                <th className="px-4 py-2.5 font-medium text-right">Price</th>
                <th className="px-4 py-2.5 font-medium">Stock</th>
                <th className="w-12 py-2.5 pl-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border/60 last:border-0 transition-colors hover:bg-gray-50"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      <ProductThumb name={product.name} image={product.image} />
                      <span className="font-medium text-foreground">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {product.category}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {product.barcode}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatNaira(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <StockIndicator product={product} />
                  </td>
                  <td className="py-3 pl-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors outline-none hover:bg-gray-100 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                        aria-label={`Actions for ${product.name}`}
                      >
                        <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => openEdit(product)}>
                          <HugeiconsIcon icon={PencilEdit02Icon} size={14} />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(product)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={14} />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer hint */}
      {(products ?? []).length > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {filtered.length} of {products?.length} products
          </p>
          <Link
            href="/dashboard/pos"
            className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HugeiconsIcon icon={ShoppingBasket01Icon} size={14} />
            Open the sales screen
          </Link>
        </div>
      )}

      <ProductFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
        categories={categories}
      />
      <DeleteProductDialog
        product={deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
      />
    </div>
  );
}
