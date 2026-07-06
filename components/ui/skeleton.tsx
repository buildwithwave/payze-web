import { cn } from "@/lib/utils";

// Shimmer sweep lives in globals.css, keyed off data-slot="skeleton",
// so every instance animates in sync and reduced-motion gets a static block.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("relative overflow-hidden rounded-lg bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
