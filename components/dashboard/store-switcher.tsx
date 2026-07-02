"use client";

import { useState, useRef, useEffect, useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UnfoldMoreIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { CheckIcon, ArrowUpRightIcon } from "@phosphor-icons/react";

interface Store {
  id: string;
  name: string;
  email: string;
}

const stores: Store[] = [
  { id: "1", name: "Onigbinde Stores", email: "ogbstores@gmail.com" },
  { id: "2", name: "Payze HQ", email: "hello@payze.com" },
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function StoreSwitcher() {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeStore, setActiveStore] = useState(stores[0]);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listboxId = useId();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open) {
      const selected = stores.findIndex((s) => s.id === activeStore.id);
      setActiveIndex(selected === -1 ? 0 : selected);
      requestAnimationFrame(() => itemRefs.current[selected]?.focus());
    }
  }, [open, activeStore.id]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.min(activeIndex + 1, stores.length - 1);
      setActiveIndex(next);
      itemRefs.current[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = Math.max(activeIndex - 1, 0);
      setActiveIndex(prev);
      itemRefs.current[prev]?.focus();
    }
  }

  return (
    <div ref={ref} className="relative mx-1 mb-4" onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        className="group flex items-center gap-3 px-2.5 py-2 w-full rounded-lg hover:bg-gray-100 transition-colors text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-600/40"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
          {initials(activeStore.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate leading-tight">
            {activeStore.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {activeStore.email}
          </p>
        </div>
        <HugeiconsIcon
          icon={UnfoldMoreIcon}
          size={16}
          className="text-muted-foreground shrink-0 transition-transform group-hover:text-foreground"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            id={listboxId}
            aria-activedescendant={`store-option-${stores[activeIndex]?.id}`}
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-border bg-white shadow-lg shadow-black/5 p-1.5 origin-top"
          >
            <div className="space-y-0.5">
              {stores.map((store, i) => {
                const selected = store.id === activeStore.id;
                return (
                  <button
                    key={store.id}
                    id={`store-option-${store.id}`}
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    role="option"
                    aria-selected={selected}
                    tabIndex={-1}
                    onClick={() => {
                      setActiveStore(store);
                      setOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left transition-colors outline-none focus-visible:bg-gray-100 ${
                      selected ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600">
                      {initials(store.name)}
                    </div>
                    <span className="flex-1 text-sm font-medium truncate text-foreground">
                      {store.name}
                    </span>
                    {selected && (
                      <CheckIcon
                        weight="bold"
                        size={14}
                        className="text-blue-600 shrink-0"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="my-1.5 h-px bg-border" />

            <button
              className="flex items-center gap-2 rounded-lg text-sm w-full px-2.5 py-2 text-left text-blue-600 hover:bg-blue-50 transition-colors outline-none focus-visible:bg-blue-50"
              onClick={() => setOpen(false)}
            >
              <HugeiconsIcon icon={PlusSignIcon} size={15} />
              <span className="flex-1 font-medium">Create new store</span>
              <ArrowUpRightIcon size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
