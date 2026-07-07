"use client";

import * as React from "react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Cancel01Icon, Tick01Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: ComboboxPrimitive.Root.Props<Value, Multiple>,
) {
  return <ComboboxPrimitive.Root data-slot="combobox" {...props} />;
}

function ComboboxInputGroup({
  className,
  children,
  ...props
}: ComboboxPrimitive.InputGroup.Props) {
  return (
    <ComboboxPrimitive.InputGroup
      data-slot="combobox-input-group"
      className={cn("relative flex items-center", className)}
      {...props}
    >
      <HugeiconsIcon
        icon={Search01Icon}
        size={14}
        className="pointer-events-none absolute left-2.5 text-muted-foreground"
      />
      {children}
    </ComboboxPrimitive.InputGroup>
  );
}

function ComboboxInput({ className, ...props }: ComboboxPrimitive.Input.Props) {
  return (
    <ComboboxPrimitive.Input
      data-slot="combobox-input"
      className={cn(
        "h-8 w-full min-w-0 rounded border border-input bg-transparent py-1 pr-7 pl-8 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:bg-primary/5 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxClear({ className, ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      className={cn(
        "absolute right-2 flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      <HugeiconsIcon icon={Cancel01Icon} size={12} />
    </ComboboxPrimitive.Clear>
  );
}

function ComboboxContent({
  className,
  children,
  ...props
}: ComboboxPrimitive.Popup.Props) {
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        className="isolate z-50 outline-none"
        sideOffset={4}
      >
        <ComboboxPrimitive.Popup
          data-slot="combobox-content"
          className={cn(
            "z-50 max-h-(--available-height) w-(--anchor-width) min-w-32 origin-(--transform-origin) overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          {children}
        </ComboboxPrimitive.Popup>
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  );
}

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  return (
    <ComboboxPrimitive.List
      data-slot="combobox-list"
      className={cn("flex flex-col", className)}
      {...props}
    />
  );
}

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "px-2 py-4 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "relative flex cursor-default items-center gap-1.5 rounded-md py-1.5 pr-8 pl-2 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute right-2 flex items-center justify-center">
        <ComboboxPrimitive.ItemIndicator>
          <HugeiconsIcon
            icon={Tick01Icon}
            size={14}
            className="text-primary"
            strokeWidth={2.5}
          />
        </ComboboxPrimitive.ItemIndicator>
      </span>
    </ComboboxPrimitive.Item>
  );
}

export {
  Combobox,
  ComboboxInputGroup,
  ComboboxInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxList,
  ComboboxEmpty,
  ComboboxItem,
};
