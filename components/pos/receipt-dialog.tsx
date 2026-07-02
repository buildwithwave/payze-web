"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Receipt } from "@/components/pos/receipt";
import { Invoice } from "@/services/catalog";

export function ReceiptDialog({
  invoice,
  onClose,
  storeName,
  newSaleLabel = "New sale",
}: {
  invoice: Invoice | null;
  onClose: () => void;
  storeName?: string;
  newSaleLabel?: string;
}) {
  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <div className="flex flex-col items-center text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-gray-100">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={22}
              className="text-emerald-600"
            />
          </div>
          <DialogTitle className="mt-3">Payment complete</DialogTitle>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Invoice {invoice?.number} has been recorded.
          </p>
        </div>

        {invoice && (
          <div className="mt-5">
            <Receipt invoice={invoice} storeName={storeName} printable />
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-1.5 rounded-xl"
            onClick={() => window.print()}
          >
            <HugeiconsIcon icon={PrinterIcon} size={15} />
            Print receipt
          </Button>
          <Button className="flex-1 rounded-xl" onClick={onClose}>
            {newSaleLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
