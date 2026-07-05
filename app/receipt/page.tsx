"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Invoice03Icon,
  Store01Icon,
  Alert01Icon,
} from "@hugeicons/core-free-icons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { catalogService } from "@/services/catalog";
import { Receipt } from "@/components/pos/receipt";
import { toast } from "sonner";
import { Invoice } from "@/services/catalog";

import { Suspense } from "react";

function ReceiptLookupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [stores, setStores] = useState<{ id: string; name: string }[]>([]);
  const [storeId, setStoreId] = useState<string>("");
  const [code, setCode] = useState("");
  
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [receipt, setReceipt] = useState<(Invoice & { storeName: string }) | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Pre-fill from query params if available
    const qCode = searchParams.get("code");
    const qStoreId = searchParams.get("storeId");
    if (qCode) setCode(qCode);
    if (qStoreId) setStoreId(qStoreId);

    catalogService.getPublicStores()
      .then((data) => {
        setStores(data);
        if (qStoreId && data.some((s) => s.id === qStoreId)) {
          setStoreId(qStoreId);
        }
      })
      .catch((err) => console.error("Failed to fetch stores", err))
      .finally(() => setIsLoadingStores(false));
  }, [searchParams]);

  useEffect(() => {
    // Auto-search if both are present from URL
    const qCode = searchParams.get("code");
    const qStoreId = searchParams.get("storeId");
    if (qCode && qStoreId && stores.length > 0) {
      handleSearch(qCode, qStoreId);
    }
  }, [searchParams, stores.length]);

  const handleSearchEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !storeId) return;
    
    // Update URL to match search state
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("code", code.trim());
    newParams.set("storeId", storeId);
    router.replace(`/receipt?${newParams.toString()}`);

    await handleSearch(code.trim(), storeId);
  };

  const handleSearch = async (searchCode: string, searchStoreId: string) => {
    setIsSearching(true);
    setError("");
    setReceipt(null);
    try {
      const data = await catalogService.lookupInvoice(searchCode.toUpperCase(), searchStoreId);
      setReceipt(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError("Receipt not found. Please check your invoice number and store selection.");
      } else {
        setError("Failed to load receipt. Please try again.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1 flex-col items-center justify-center p-6">
        
        {!receipt ? (
          <div className="w-full max-w-md rounded-2xl border border-border bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <HugeiconsIcon icon={Invoice03Icon} size={28} />
              </div>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
                Find your receipt
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your invoice number and select the store to download your
                receipt.
              </p>
            </div>

            <form onSubmit={handleSearchEvent} className="mt-8 space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  <HugeiconsIcon icon={Alert01Icon} size={16} />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="space-y-1 text-left">
                <label className="text-sm font-medium text-foreground">Store</label>
                <Select value={storeId} onValueChange={(value) => setStoreId(value || "")}>
                  <SelectTrigger className="h-12 w-full rounded-xl text-base px-3.5 bg-white">
                    <SelectValue placeholder={isLoadingStores ? "Loading stores..." : "Select the store"} />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-sm font-medium text-foreground">Invoice Number</label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. INV-2507-0001"
                    className="h-12 rounded-xl pl-10 text-base bg-white"
                    autoFocus
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl text-base mt-2"
                disabled={!code.trim() || !storeId || isSearching || isLoadingStores}
              >
                {isSearching ? "Searching..." : "Find Receipt"}
              </Button>
            </form>
          </div>
        ) : (
          <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-300">
            <div className="mb-4 flex items-center justify-between">
              <Button 
                variant="ghost" 
                onClick={() => setReceipt(null)}
                className="text-muted-foreground"
              >
                &larr; Back to search
              </Button>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
              <Receipt 
                invoice={receipt} 
                storeName={receipt.storeName} 
              />
            </div>
          </div>
        )}
      </div>

      <footer className="py-6 text-center text-sm text-muted-foreground">
        Powered by <span className="font-semibold text-foreground">Payze</span>
      </footer>
    </div>
  );
}

export default function ReceiptLookupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <ReceiptLookupContent />
    </Suspense>
  );
}
