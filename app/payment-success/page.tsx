import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentSuccessContent } from "@/components/payment-success/payment-success-content";

export const metadata: Metadata = {
  title: "Payment successful | Payze",
  description: "Your Payze payment was completed successfully.",
};

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
