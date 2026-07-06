"use client";

import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BarCode02Icon,
  Image01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import {
  DEFAULT_CATEGORIES,
  generateBarcode,
  Product,
  catalogService,
} from "@/services/catalog";
import { toast } from "@/components/ui/toast";

interface FormErrors {
  name?: string;
  category?: string;
  price?: string;
  stock?: string;
}

/** Downscale an uploaded image so it stays small enough for local storage. */
function fileToThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const max = 512;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas
        .getContext("2d")
        ?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read image"));
    };
    img.src = url;
  });
}

// State lives here so the form resets naturally: the sheet unmounts its
// content when closed, and this remounts with fresh values on open.
function ProductFormBody({
  product,
  categories,
  onDone,
  onCancel,
}: {
  product?: Product | null;
  categories: string[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const isEdit = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const pending = createProduct.isPending || updateProduct.isPending;

  const [name, setName] = useState(product?.name ?? "");
  const [category, setCategory] = useState<string | null>(
    product?.category ?? null,
  );
  const [newCategory, setNewCategory] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [costPrice, setCostPrice] = useState(
    product?.costPrice ? String(product.costPrice) : "",
  );
  const [stock, setStock] = useState(product ? String(product.stock) : "");
  const [lowStock, setLowStock] = useState(
    product ? String(product.lowStockThreshold) : "10",
  );
  const [barcode, setBarcode] = useState(product?.barcode ?? "");
  const [image, setImage] = useState<string | undefined>(product?.image);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const allCategories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...categories]),
  );

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const url = await catalogService.uploadImage(file);
      setImage(url);
      toast.success("Photo uploaded", "Product image is ready");
    } catch {
      toast.error("Upload failed", "Could not upload the image file");
    } finally {
      setUploadingImage(false);
    }
    e.target.value = "";
  };

  const handleSubmit = () => {
    const resolvedCategory = addingCategory ? newCategory.trim() : category;
    const priceNum = Number(price);
    const stockNum = Number(stock);

    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Give the product a name";
    if (!resolvedCategory) nextErrors.category = "Pick a category";
    if (!price || isNaN(priceNum) || priceNum <= 0)
      nextErrors.price = "Enter a price above ₦0";
    if (stock === "" || isNaN(stockNum) || stockNum < 0)
      nextErrors.stock = "Enter how many are in stock";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const data = {
      name: name.trim(),
      category: resolvedCategory!,
      price: priceNum,
      costPrice: costPrice ? Number(costPrice) : undefined,
      stock: stockNum,
      lowStockThreshold: Number(lowStock) || 0,
      barcode: barcode.trim() || generateBarcode(),
      image,
    };

    if (isEdit && product) {
      updateProduct.mutate({ id: product.id, data }, { onSuccess: onDone });
    } else {
      createProduct.mutate(data, { onSuccess: onDone });
    }
  };

  return (
    <>
      <SheetBody className="space-y-5">
        {/* Image */}
        <div className="flex items-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageChange}
            aria-label="Upload product photo"
          />
          {uploadingImage ? (
            <div className="flex size-16 items-center justify-center rounded-xl border border-border bg-gray-50">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : image ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Product"
                className="size-16 rounded-xl object-cover border border-border"
              />
              <button
                type="button"
                onClick={() => setImage(undefined)}
                className="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-white outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                aria-label="Remove photo"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={10} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex size-16 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors outline-none hover:border-foreground/40 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <HugeiconsIcon icon={Image01Icon} size={20} strokeWidth={1.5} />
            </button>
          )}
          <div>
            <p className="text-sm font-medium">Product photo</p>
            <p className="text-xs text-muted-foreground">
              Optional. Shows on the sales screen.
            </p>
          </div>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="product-name">Name</Label>
          <Input
            id="product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Peak Milk Tin 170g"
            aria-invalid={!!errors.name}
            autoComplete="off"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="product-category">Category</Label>
            <button
              type="button"
              onClick={() => setAddingCategory(!addingCategory)}
              className="text-xs font-medium text-primary outline-none hover:underline focus-visible:underline cursor-pointer"
            >
              {addingCategory ? "Pick existing" : "New category"}
            </button>
          </div>
          {addingCategory ? (
            <Input
              id="product-category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Frozen Foods"
              aria-invalid={!!errors.category}
              autoComplete="off"
            />
          ) : (
            <Select
              value={category}
              onValueChange={(value) => setCategory(value as string)}
            >
              <SelectTrigger
                id="product-category"
                aria-invalid={!!errors.category}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.category && (
            <p className="text-xs text-destructive">{errors.category}</p>
          )}
        </div>

        {/* Price / Cost */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="product-price">Selling price (₦)</Label>
            <Input
              id="product-price"
              type="number"
              inputMode="decimal"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-cost">Cost price (₦)</Label>
            <Input
              id="product-cost"
              type="number"
              inputMode="decimal"
              min="0"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        {/* Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="product-stock">In stock</Label>
            <Input
              id="product-stock"
              type="number"
              inputMode="numeric"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="0"
              aria-invalid={!!errors.stock}
            />
            {errors.stock && (
              <p className="text-xs text-destructive">{errors.stock}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="product-lowstock">Low stock alert</Label>
            <Input
              id="product-lowstock"
              type="number"
              inputMode="numeric"
              min="0"
              value={lowStock}
              onChange={(e) => setLowStock(e.target.value)}
              placeholder="10"
            />
          </div>
        </div>

        {/* Barcode */}
        <div className="space-y-1.5">
          <Label htmlFor="product-barcode">Barcode / SKU</Label>
          <div className="flex gap-2">
            <Input
              id="product-barcode"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or type a code"
              className="font-mono"
              autoComplete="off"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 shrink-0 gap-1.5"
              onClick={() => setBarcode(generateBarcode())}
            >
              <HugeiconsIcon icon={BarCode02Icon} size={14} />
              Generate
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave empty and we&apos;ll generate one for you.
          </p>
        </div>
      </SheetBody>

      <SheetFooter>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-4"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          className="h-9 px-4"
          loading={pending}
          onClick={handleSubmit}
        >
          {isEdit ? "Save changes" : "Add product"}
        </Button>
      </SheetFooter>
    </>
  );
}

export function ProductFormSheet({
  open,
  onOpenChange,
  product,
  categories,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  categories: string[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{product ? "Edit product" : "Add product"}</SheetTitle>
          <SheetDescription>
            {product
              ? "Update the details and save."
              : "It'll be available at the point of sale right away."}
          </SheetDescription>
        </SheetHeader>
        <ProductFormBody
          product={product}
          categories={categories}
          onDone={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
