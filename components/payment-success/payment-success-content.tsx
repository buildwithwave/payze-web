"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ReloadIcon,
  AlertCircleIcon,
  CancelCircleIcon,
  Store01Icon,
  Invoice03Icon,
} from "@hugeicons/core-free-icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { PaymentSuccessLottie } from "@/components/payment-success/payment-success-lottie";
import { usePaymentVerification } from "@/hooks/use-invoices";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4 py-10 sm:px-6">
      <section className="w-full max-w-lg text-center">{children}</section>
    </main>
  );
}

function ReferenceChip({ reference }: { reference: string }) {
  return (
    <p className="mx-auto mt-1 inline-flex items-center rounded-full bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">
      Ref: {reference}
    </p>
  );
}

function CheckingState() {
  return (
    <Shell>
      <div
        className="mx-auto flex size-16 items-center justify-center"
        aria-hidden="true"
      >
        <span className="size-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
      <div className="mt-6 space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Confirming your payment
        </h1>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          We&apos;re checking with Nomba to confirm your payment went through.
          This usually takes a few seconds — please don&apos;t close this page.
        </p>
      </div>
    </Shell>
  );
}

function SuccessState({
  orderReference,
}: {
  orderReference: string | undefined;
}) {
  return (
    <Shell>
      <PaymentSuccessLottie />

      <div className="mt-6 space-y-3">
        <p className="text-sm font-medium text-primary">Payment confirmed</p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Payment successful
        </h1>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          The transaction has been completed and your records are up to date.
        </p>
        {orderReference && <ReferenceChip reference={orderReference} />}
      </div>

      <Button size="lg" className="mt-8 w-full" onClick={() => window.close()}>
        Finish
      </Button>
    </Shell>
  );
}

function NotConfirmedState({
  orderReference,
  onRetry,
}: {
  orderReference: string | null;
  onRetry: () => void;
}) {
  return (
    <Shell>
      <div
        className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
        aria-hidden="true"
      >
        <HugeiconsIcon icon={AlertCircleIcon} size={28} />
      </div>

      <div className="mt-6 space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          We couldn&apos;t confirm your payment
        </h1>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          {orderReference
            ? "We're still waiting to hear back from Nomba. If money left your account, it will reflect automatically once confirmed — you don't need to pay again."
            : "We couldn't find a payment reference in this link. If you completed a payment, check your transactions before trying again."}
        </p>
        {orderReference && <ReferenceChip reference={orderReference} />}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {orderReference && (
          <Button size="lg" className="w-full" onClick={onRetry}>
            <HugeiconsIcon icon={ReloadIcon} aria-hidden="true" />
            Try again
          </Button>
        )}
        <Link
          href="/dashboard/payments"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: `w-full ${orderReference ? "" : "sm:col-span-2"}`,
          })}
        >
          <HugeiconsIcon icon={Invoice03Icon} aria-hidden="true" />
          View transactions
        </Link>
      </div>
    </Shell>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Shell>
      <div
        className="mx-auto flex size-16 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
        aria-hidden="true"
      >
        <HugeiconsIcon icon={CancelCircleIcon} size={28} />
      </div>

      <div className="mt-6 space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Something went wrong
        </h1>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          We couldn&apos;t reach the server to confirm your payment. Check
          your connection and try again.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Button size="lg" className="w-full" onClick={onRetry}>
          <HugeiconsIcon icon={ReloadIcon} aria-hidden="true" />
          Try again
        </Button>
        <Link
          href="/dashboard"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "w-full",
          })}
        >
          <HugeiconsIcon icon={Store01Icon} aria-hidden="true" />
          Go to dashboard
        </Link>
      </div>
    </Shell>
  );
}

export function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderReference = searchParams.get("orderReference");
  const { status, retry } = usePaymentVerification(orderReference);

  if (status === "checking") return <CheckingState />;
  if (status === "success") {
    return <SuccessState orderReference={orderReference ?? undefined} />;
  }
  if (status === "error") return <ErrorState onRetry={retry} />;

  // "not-confirmed" and "no-reference" share the same terminal, non-panicked state.
  return (
    <NotConfirmedState
      orderReference={orderReference}
      onRetry={retry}
    />
  );
}
