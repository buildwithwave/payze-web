"use client";

import { useState, useRef, useEffect, useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { UnfoldMoreIcon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { CheckIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { useStore } from "@/lib/store-context";
import { useUser } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
  const { stores, activeStore, setActiveStoreId, createStore, isLoading } = useStore();
  const { data: user } = useUser();
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listboxId = useId();


  useEffect(() => {
    setIsMounted(true);
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && activeStore) {
      const selected = stores.findIndex((s) => s.id === activeStore.id);
      setActiveIndex(selected === -1 ? 0 : selected);
      requestAnimationFrame(() => itemRefs.current[selected]?.focus());
    }
  }, [open, activeStore?.id, stores]);

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

  const handleCreateStoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    createStore.mutate(newStoreName.trim());
    setNewStoreName("");
    setCreateOpen(false);
  };

  if (!isMounted || isLoading) {
    return (
      <div className="mx-1 mb-4 flex items-center gap-3 px-2.5 py-2 animate-pulse">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-2.5 w-32 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (!activeStore) {
    return (
      <div className="mx-1 mb-4">
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 rounded-lg text-sm w-full px-2.5 py-2 text-left text-blue-600 hover:bg-blue-50 transition-colors outline-none focus-visible:bg-blue-50"
        >
          <HugeiconsIcon icon={PlusSignIcon} size={15} />
          <span className="flex-1 font-medium">Create a store</span>
          <ArrowUpRightIcon size={14} />
        </button>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogTitle>Create new store</DialogTitle>
            <DialogDescription>
              Add a store to start managing products and sales.
            </DialogDescription>
            <form onSubmit={handleCreateStoreSubmit} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Input
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  placeholder="Store name (e.g., Onigbinde Stores)"
                  autoFocus
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={createStore.isPending}>
                  Create store
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
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
            {user?.email || "Store Account"}
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
                      setActiveStoreId(store.id);
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
              className="flex items-center gap-2 rounded-lg text-sm w-full px-2.5 py-2 text-left text-blue-600 hover:bg-blue-50 transition-colors outline-none focus-visible:bg-blue-50 cursor-pointer"
              onClick={() => {
                setOpen(false);
                setCreateOpen(true);
              }}
            >
              <HugeiconsIcon icon={PlusSignIcon} size={15} />
              <span className="flex-1 font-medium">Create new store</span>
              <ArrowUpRightIcon size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogTitle>Create new store</DialogTitle>
          <DialogDescription>
            Add a store to start managing products and sales.
          </DialogDescription>
          <form onSubmit={handleCreateStoreSubmit} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Input
                value={newStoreName}
                onChange={(e) => setNewStoreName(e.target.value)}
                placeholder="Store name (e.g., Onigbinde Stores)"
                autoFocus
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={createStore.isPending}>
                Create store
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
