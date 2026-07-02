"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { BarCode02Icon, Tick01Icon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DetectedBarcode {
  rawValue: string;
}

interface BarcodeDetectorInstance {
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: new (options?: {
      formats?: string[];
    }) => BarcodeDetectorInstance;
  }
}

/** Short confirmation beep so the cashier doesn't need to watch the screen. */
function beep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1400;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
    osc.onended = () => ctx.close();
  } catch {
    // no audio available — scanning still works silently
  }
}

// Camera + detection live here so everything tears down when the
// dialog unmounts its content on close.
function ScannerView({
  onScan,
}: {
  onScan: (code: string) => { ok: boolean; label: string };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastScanRef = useRef<{ code: string; at: number }>({ code: "", at: 0 });
  const [status, setStatus] = useState<
    "starting" | "scanning" | "unsupported" | "denied"
  >(() => (window.BarcodeDetector ? "starting" : "unsupported"));
  const [lastResult, setLastResult] = useState<{
    ok: boolean;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (!window.BarcodeDetector) return;

    let cancelled = false;
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;

    const detector = new window.BarcodeDetector({
      formats: [
        "ean_13",
        "ean_8",
        "upc_a",
        "upc_e",
        "code_128",
        "code_39",
        "qr_code",
      ],
    });

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
      } catch {
        if (!cancelled) setStatus("denied");
        return;
      }
      if (cancelled || !videoRef.current) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      videoRef.current.srcObject = stream;
      await videoRef.current.play().catch(() => {});
      if (cancelled) return;
      setStatus("scanning");

      timer = setInterval(async () => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        try {
          const barcodes = await detector.detect(video);
          const code = barcodes[0]?.rawValue?.trim();
          if (!code) return;

          // Ignore repeat reads of the same code for a couple of seconds,
          // otherwise one product gets added on every frame.
          const now = Date.now();
          const last = lastScanRef.current;
          if (code === last.code && now - last.at < 2000) return;
          lastScanRef.current = { code, at: now };

          const result = onScan(code);
          if (result.ok) beep();
          setLastResult(result);
        } catch {
          // detection can fail on individual frames — keep scanning
        }
      }, 250);
    }

    start();

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onScan]);

  if (status === "unsupported") {
    return (
      <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-muted-foreground">
        Camera scanning isn&apos;t supported in this browser. Use a USB barcode
        scanner or type the code into the search box instead.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-muted-foreground">
        Camera access was blocked. Allow camera access for this site in your
        browser settings, then try again.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <div className="relative overflow-hidden rounded-xl bg-gray-950">
        <video
          ref={videoRef}
          playsInline
          muted
          className="aspect-[4/3] w-full object-cover"
        />
        {/* Aiming frame */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-24 w-56 rounded-lg border-2 border-white/70" />
        </div>
        {status === "starting" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-white/80">Starting camera…</p>
          </div>
        )}
      </div>

      <div
        className="mt-3 flex min-h-9 items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
        role="status"
        aria-live="polite"
      >
        {lastResult ? (
          <>
            <HugeiconsIcon
              icon={lastResult.ok ? Tick01Icon : BarCode02Icon}
              size={14}
              className={cn(
                "shrink-0",
                lastResult.ok ? "text-emerald-600" : "text-amber-600",
              )}
              strokeWidth={2}
            />
            <p className="text-xs text-foreground">{lastResult.label}</p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">
            Point the camera at a barcode — items are added automatically.
          </p>
        )}
      </div>
    </div>
  );
}

export function CameraScannerDialog({
  open,
  onOpenChange,
  onScan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScan: (code: string) => { ok: boolean; label: string };
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Scan with camera</DialogTitle>
        <DialogDescription className="mt-1">
          Keep scanning — every match goes straight into the cart.
        </DialogDescription>
        <ScannerView onScan={onScan} />
      </DialogContent>
    </Dialog>
  );
}
