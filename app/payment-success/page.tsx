import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ReceiptText, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { PaymentSuccessLottie } from "@/components/payment-success/payment-success-lottie";

export const metadata: Metadata = {
  title: "Payment successful | Payze",
  description: "Your Payze payment was completed successfully.",
};

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 sm:px-6">
      <section className="w-full max-w-lg text-center">
        <PaymentSuccessLottie />

        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-primary">Payment confirmed</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Payment successful
          </h1>
          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            The transaction has been completed and your records are up to date.
          </p>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard"
            className={buttonVariants({ size: "lg", className: "w-full" })}
          >
            <Store aria-hidden="true" />
            Go to dashboard
          </Link>
          <Link
            href="/dashboard/pos"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "w-full",
            })}
          >
            <ReceiptText aria-hidden="true" />
            New sale
          </Link>
        </div>

        <Link
          href="/dashboard/payments"
          className="mt-6 inline-flex min-h-10 items-center gap-1.5 rounded px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          View transactions
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>
    </main>
  );
}
