"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Store, storesService } from "@/services/stores";
import { toast } from "@/components/ui/toast";

interface StoreContextType {
  stores: Store[];
  activeStore: Store | null;
  activeStoreId: string | null;
  setActiveStoreId: (id: string) => void;
  isLoading: boolean;
  createStore: {
    mutate: (name: string) => void;
    isPending: boolean;
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  // Check token to ensure we only fetch when logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("token"));
      
      // Listen for local storage changes (in case of login/logout)
      const handleStorage = () => {
        setToken(localStorage.getItem("token"));
      };
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  const { data: stores = [], isLoading, refetch } = useQuery({
    queryKey: ["stores"],
    queryFn: storesService.getStores,
    enabled: !!token,
  });

  const [activeStoreId, setActiveStoreIdState] = useState<string | null>(null);

  // Initial load of activeStoreId from localStorage or first store
  useEffect(() => {
    if (typeof window !== "undefined" && stores.length > 0) {
      const saved = localStorage.getItem("active_store_id");
      const exists = stores.some((s) => s.id === saved);
      if (saved && exists) {
        setActiveStoreIdState(saved);
      } else {
        setActiveStoreIdState(stores[0].id);
        localStorage.setItem("active_store_id", stores[0].id);
      }
    }
  }, [stores]);

  const setActiveStoreId = (id: string) => {
    setActiveStoreIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_store_id", id);
    }
  };

  const createStoreMutation = useMutation({
    mutationFn: (name: string) => storesService.createStore(name),
    onSuccess: (newStore) => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success("Store created", `"${newStore.name}" is ready`);
      setActiveStoreId(newStore.id);
    },
    onError: (error: any) => {
      toast.error(
        "Couldn't create store",
        error?.response?.data?.message || error.message || "Something went wrong"
      );
    },
  });

  const activeStore = stores.find((s) => s.id === activeStoreId) || null;

  return (
    <StoreContext.Provider
      value={{
        stores,
        activeStore,
        activeStoreId,
        setActiveStoreId,
        isLoading: isLoading && !!token,
        createStore: {
          mutate: createStoreMutation.mutate,
          isPending: createStoreMutation.isPending,
        },
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
