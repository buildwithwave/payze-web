"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Store02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { useStore } from "@/lib/store-context";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CreateFirstStoreGate({ children }: { children: React.ReactNode }) {
  const { stores, isLoading, createStore } = useStore();
  const [storeName, setStoreName] = useState("");

  const needsStore = !isLoading && stores.length === 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = storeName.trim();
    if (!name) return;
    createStore.mutate(name);
  }

  return (
    <>
      {children}

      <Dialog
        open={needsStore}
        // Never allow closing — intercept all close attempts
        onOpenChange={() => {}}
        modal
      >
        <DialogContent
          showCloseButton={false}
          // Prevent clicking the backdrop from closing

          className="max-w-[420px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key="create-store"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Icon */}
              <div className="flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
                  <HugeiconsIcon icon={Store02Icon} size={26} className="text-white" />
                </div>
              </div>

              {/* Heading */}
              <div className="text-center space-y-1.5">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Create your first store
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  You need at least one store to start managing products,
                  sales, and payments. It only takes a second.
                </DialogDescription>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  id="first-store-name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g., Onigbinde Stores"
                  autoFocus
                  required
                  disabled={createStore.isPending}
                />

                <Button
                  type="submit"
                  className="w-full gap-2"
                  loading={createStore.isPending}
                  disabled={!storeName.trim() || createStore.isPending}
                >
                  {createStore.isPending ? "Creating…" : "Create store"}
                  {!createStore.isPending && (
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground">
                You can add more stores anytime from the sidebar.
              </p>
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
