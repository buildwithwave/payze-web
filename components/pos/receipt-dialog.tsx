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
} from "@hugeicons/core-free-icons";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt } from "@/components/pos/receipt";
import { Invoice, catalogService } from "@/services/catalog";
import { downloadInvoicePDF } from "@/lib/generate-invoice-pdf";
import { formatDateTime } from "@/lib/format";
import { toast } from "@/components/ui/toast";

type DeliveryMethod = "qr" | "email" | "whatsapp" | "preview" | null;

export function ReceiptDialog({
  invoice,
  onClose,
  storeName,
  newSaleLabel = "New sale",
  variant = "success",
}: {
  invoice: Invoice | null;
  onClose: () => void;
  storeName?: string;
  newSaleLabel?: string;
  /**
   * "success" — post-checkout: celebration header, share options first.
   * "view" — browsing records: opens straight into the receipt preview.
   */
  variant?: "success" | "view";
}) {
  const isView = variant === "view";
  const home: DeliveryMethod = isView ? "preview" : null;
  const [method, setMethod] = useState<DeliveryMethod>(home);
  const [destination, setDestination] = useState("");
  const [sending, setSending] = useState(false);

  const resetAndClose = () => {
    setMethod(home);
    setDestination("");
    onClose();
  };

  const backToHome = () => {
    setDestination("");
    setMethod(home);
  };

  const handleSend = async () => {
    if (!invoice || !method || !destination.trim()) return;
    setSending(true);
    try {
      await catalogService.sendReceipt(invoice.id, {
        channel: method as "email" | "whatsapp",
        destination: destination.trim(),
      });
      toast.success("Receipt sent", `Successfully sent to ${destination}`);
      resetAndClose();
    } catch {
      toast.error("Failed to send", "Could not send receipt. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleDownload = () => {
    if (invoice) downloadInvoicePDF(invoice, storeName || "Payze Store");
  };

  const receiptUrl =
    typeof window !== "undefined" && invoice
      ? `${window.location.origin}/receipt/${invoice.number}`
      : "";

  const shareActions = [
    { key: "qr" as const, icon: QrCode01Icon, label: "QR Code", onClick: () => setMethod("qr") },
    { key: "whatsapp" as const, icon: WhatsappIcon, label: "WhatsApp", onClick: () => setMethod("whatsapp") },
    { key: "email" as const, icon: Mail02Icon, label: "Email", onClick: () => setMethod("email") },
    { key: "download" as const, icon: Download01Icon, label: "PDF", onClick: handleDownload },
  ];

  return (
    <Dialog open={!!invoice} onOpenChange={(open) => !open && resetAndClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[425px]">
        {/* Header */}
        {isView ? (
          <div className="pr-8">
            <DialogTitle className="font-mono text-base font-semibold tracking-tight">
              {invoice?.number}
            </DialogTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {invoice ? formatDateTime(invoice.createdAt) : ""}
            </p>
          </div>
        ) : (
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
        )}

        <div className={isView ? "mt-4" : "mt-6"}>
          {!method ? (
            <div className="space-y-3">
              <p className="mb-4 text-center text-sm font-medium">
                How would you like to send the receipt?
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                {shareActions.map((action) => (
                  <button
                    key={action.key}
                    onClick={action.onClick}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border p-4 transition-colors hover:bg-gray-50 outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                  >
                    <HugeiconsIcon
                      icon={action.icon}
                      size={22}
                      className="text-gray-700"
                    />
                    <span className="text-sm font-medium">
                      {action.label === "PDF" ? "Download" : action.label}
                    </span>
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                className="mt-1 w-full text-muted-foreground"
                onClick={() => setMethod("preview")}
              >
                Preview receipt
              </Button>
            </div>
          ) : method === "qr" ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
              <div className="rounded-2xl border border-border bg-white p-6">
                <QRCodeSVG value={receiptUrl} size={180} level="M" />
              </div>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Ask the customer to scan this QR code <br /> with their phone
                camera
              </p>
              <Button
                variant="outline"
                className="mt-6 w-full"
                onClick={backToHome}
              >
                Back
              </Button>
            </div>
          ) : method === "whatsapp" || method === "email" ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="space-y-2">
                <label
                  htmlFor="receipt-destination"
                  className="text-sm font-medium"
                >
                  {method === "whatsapp"
                    ? "Customer's WhatsApp number"
                    : "Customer's email address"}
                </label>
                <Input
                  id="receipt-destination"
                  type={method === "email" ? "email" : "tel"}
                  placeholder={
                    method === "whatsapp"
                      ? "e.g. 08012345678"
                      : "e.g. customer@example.com"
                  }
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={backToHome}>
                  Back
                </Button>
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
              <div className="max-h-[48vh] overflow-y-auto rounded-2xl bg-gray-50 p-3">
                {invoice && (
                  <Receipt invoice={invoice} storeName={storeName} printable />
                )}
              </div>

              {isView ? (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {shareActions.map((action) => (
                    <button
                      key={action.key}
                      onClick={action.onClick}
                      className="flex flex-col items-center gap-1.5 rounded-xl border border-border py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-gray-50 hover:text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
                    >
                      <HugeiconsIcon icon={action.icon} size={18} />
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={backToHome}
                  >
                    Back
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-1.5"
                    onClick={() => window.print()}
                  >
                    <HugeiconsIcon icon={PrinterIcon} size={16} /> Print
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Action — post-checkout only */}
        {!isView && !method && (
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
