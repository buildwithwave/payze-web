/* eslint-disable @next/next/no-img-element */
import { cn } from "@/lib/utils";

export function ProductThumb({
  name,
  image,
  className,
}: {
  name: string;
  image?: string;
  className?: string;
}) {
  if (image) {
    return (
      <img
        src={image}
        alt=""
        className={cn("size-9 shrink-0 rounded-lg object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-muted-foreground",
        className,
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
