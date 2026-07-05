"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  PrinterIcon,
  Download01Icon,
  Mail02Icon,
  WhatsappIcon,
  QrCode01Icon,
  Share08Icon
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt } from "@/components/pos/receipt";
import { Invoice, catalogService } from "@/services/catalog";
import { downloadInvoicePDF } from "@/lib/generate-invoice-pdf";
import { toast } from "@/components/ui/toast";

type DeliveryMethod = "qr" | "email" | "whatsapp" | "preview" | null;

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
  const [method, setMethod] = useState<DeliveryMethod>(null);
  const [destination, setDestination] = useState("");
  const [sending, setSending] = useState(false);

  const resetAndClose = () => {
    setMethod(null);
    setDestination("");
    onClose();
  };

  const handleSend = async () => {
    if (!invoice || !method || !destination.trim()) return;
    setSending(true);
    try {
      const res = await catalogService.sendReceipt(invoice.id, {
        channel: method as "email" | "whatsapp",
        destination: destination.trim(),
      });
      toast.success("Receipt sent", `Successfully sent to ${destination}`);
      resetAndClose();
    } catch (error) {
      toast.error("Failed to send", "Could not send receipt. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const receiptUrl = typeof window !== "undefined" && invoice
    ? `${window.location.origin}/receipt/${invoice.number}`
    : "";

  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-50">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              size={24}
              className="text-emerald-600"
            />
          </div>
          <DialogTitle className="mt-4 text-xl">Payment successful</DialogTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Invoice {invoice?.number} has been recorded.
          </p>
        </div>

        {/* View Options */}
        <div className="mt-6">
          {!method ? (
            <div className="space-y-3">
              <p className="text-center text-sm font-medium mb-4">How would you like to send the receipt?</p>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMethod("qr")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-gray-50 p-4 transition-colors hover:bg-gray-100 hover:border-border/80 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <HugeiconsIcon icon={QrCode01Icon} size={24} className="text-gray-700" />
                  <span className="text-sm font-medium">QR Code</span>
                </button>
                <button
                  onClick={() => setMethod("whatsapp")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-[#F2FAF6] p-4 transition-colors hover:bg-[#E5F5EC] hover:border-[#128C7E]/20 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <HugeiconsIcon icon={WhatsappIcon} size={24} className="text-[#128C7E]" />
                  <span className="text-sm font-medium text-[#128C7E]">WhatsApp</span>
                </button>
                <button
                  onClick={() => setMethod("email")}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-blue-50 p-4 transition-colors hover:bg-blue-100/50 hover:border-blue-200 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <HugeiconsIcon icon={Mail02Icon} size={24} className="text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Email</span>
                </button>
                <button
                  onClick={() => {
                    if (invoice) downloadInvoicePDF(invoice, storeName || "Payze Store");
                  }}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-gray-50 p-4 transition-colors hover:bg-gray-100 hover:border-border/80 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <HugeiconsIcon icon={Download01Icon} size={24} className="text-gray-700" />
                  <span className="text-sm font-medium">Download</span>
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <Button variant="ghost" className="text-muted-foreground w-full" onClick={() => setMethod("preview")}>
                  Preview receipt
                </Button>
              </div>
            </div>
          ) : method === "qr" ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <QRCodeSVG value={receiptUrl} size={180} level="M" />
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Ask the customer to scan this QR code <br/> with their phone camera
              </p>
              <Button variant="outline" className="mt-6 w-full" onClick={() => setMethod(null)}>
                Choose another method
              </Button>
            </div>
          ) : method === "whatsapp" || method === "email" ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {method === "whatsapp" ? "Customer's WhatsApp number" : "Customer's email address"}
                </label>
                <Input
                  type={method === "email" ? "email" : "tel"}
                  placeholder={method === "whatsapp" ? "e.g. 08012345678" : "e.g. customer@example.com"}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setMethod(null)}>Back</Button>
                <Button 
                  className="flex-[2]" 
                  disabled={!destination.trim()} 
                  loading={sending}
                  onClick={handleSend}
                >
                  Send receipt
                </Button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <div className="max-h-[40vh] overflow-y-auto rounded-xl border border-border p-4 bg-gray-50/50">
                <Receipt invoice={invoice!} storeName={storeName} />
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setMethod(null)}>Back</Button>
                <Button variant="outline" className="flex-1 gap-1.5" onClick={() => window.print()}>
                  <HugeiconsIcon icon={PrinterIcon} size={16} /> Print
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        {!method && (
          <div className="mt-6 border-t border-border pt-4">
            <Button className="w-full rounded-xl" size="lg" onClick={resetAndClose}>
              {newSaleLabel}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
