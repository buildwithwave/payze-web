"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UnfoldMoreIcon,
  PlusSignIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

const stores = [
  { id: "1", name: "Onigbinde Stores" },
  { id: "2", name: "Payze HQ" },
];

export function StoreSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeStore, setActiveStore] = useState(stores[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative mx-1 mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-3 w-full py-2.5 rounded-lg bg-gray-200 hover:bg-black/5 transition-colors text-left cursor-pointer outline-none"
      >
        <div className="flex items-center justify-center size-9 rounded-full bg-foreground/10 text-[10px] font-bold text-foreground shrink-0">
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {activeStore.name}
          </p>
          <p className="text-xs /70">ogbstores@gmail.com</p>
        </div>
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          size={16}
          className="text-muted-foreground shrink-0"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1 z-50 rounded-lg border border-border bg-white p-3 flex flex-col min-h-44"
          >
            <p className="px-2 pt-1 pb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Stores
            </p>

            <div className="flex-1 space-y-0.5">
              {stores.map((store) => {
                const selected = store.id === activeStore.id;
                return (
                  <button
                    key={store.id}
                    onClick={() => {
                      setActiveStore(store);
                      setOpen(false);
                    }}
                    className={`flex items-center gap-2.5 w-full px-2 py-2 rounded-md text-left transition-colors cursor-pointer ${
                      selected ? "bg-primary/5" : "hover:bg-black/5"
                    }`}
                  >
                    <div className="flex items-center justify-center size-6 rounded-full bg-foreground/10 text-[10px] font-bold text-foreground shrink-0"></div>
                    <span className="flex-1 text-sm font-medium text-foreground/60 truncate">
                      {store.name}
                    </span>
                    {selected && (
                      <HugeiconsIcon
                        icon={Tick01Icon}
                        size={14}
                        className="text-primary shrink-0"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="border-border mt-1.5 pt-1.5">
              <Button
                variant="default"
                size="sm"
                className="w-full gap-1.5 rounded-md"
                onClick={() => setOpen(false)}
              >
                <HugeiconsIcon icon={PlusSignIcon} size={14} />
                Add new store
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
