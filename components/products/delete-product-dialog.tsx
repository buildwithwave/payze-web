"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteProduct } from "@/hooks/use-products";
import { Product } from "@/services/catalog";

export function DeleteProductDialog({
  product,
  onOpenChange,
}: {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
}) {
  const deleteProduct = useDeleteProduct();

  return (
    <Dialog open={!!product} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogTitle>Delete {product?.name}?</DialogTitle>
        <DialogDescription className="mt-1.5">
          It will disappear from your catalogue and the sales screen. Past
          invoices keep their records.
        </DialogDescription>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 px-4"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-9 px-4"
            loading={deleteProduct.isPending}
            onClick={() => {
              if (!product) return;
              deleteProduct.mutate(product, {
                onSuccess: () => onOpenChange(false),
              });
            }}
          >
            Delete product
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
