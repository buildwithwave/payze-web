"use client";

import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 px-6 gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Toast Test</h1>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => toast.success("Payment received", "Your account has been credited")}>
          Success
        </Button>
        <Button variant="destructive" onClick={() => toast.error("Transfer failed", "Insufficient funds in your account")}>
          Error
        </Button>
        <Button variant="outline" onClick={() => toast.warning("Session expiring", "You will be logged out in 5 minutes")}>
          Warning
        </Button>
        <Button variant="secondary" onClick={() => toast.info("New update", "Version 2.0 is now available")}>
          Info
        </Button>
      </div>
    </div>
  );
}
