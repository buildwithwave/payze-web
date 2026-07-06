"use client";

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Store, storesService } from "@/services/stores";
import { toast } from "@/components/ui/toast";

interface StoreContextType {
  stores: Store[];
  activeStore: Store | null;
  activeStoreId: string | null;
  setActiveStoreId: (id: string) => void;
  isLoading: boolean;
  createStore: {
    mutate: (name: string, options?: { onSuccess?: () => void }) => void;
    isPending: boolean;
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("token")
  );
  const [activeStoreIdState, setActiveStoreIdState] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem("active_store_id")
  );
  const storesQueryKey = useMemo(() => ["stores", token] as const, [token]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncToken = () => {
      setToken(localStorage.getItem("token"));
    };

    syncToken();
    window.addEventListener("storage", syncToken);
    window.addEventListener("focus", syncToken);
    window.addEventListener("payze-auth-token-changed", syncToken);

    return () => {
      window.removeEventListener("storage", syncToken);
      window.removeEventListener("focus", syncToken);
      window.removeEventListener("payze-auth-token-changed", syncToken);
    };
  }, [pathname]);

  const { data: fetchedStores = [], isLoading, isFetching } = useQuery({
    queryKey: storesQueryKey,
    queryFn: storesService.getStores,
    enabled: !!token,
  });
  const stores = useMemo(() => (token ? fetchedStores : []), [fetchedStores, token]);

  useEffect(() => {
    if (typeof window === "undefined" || stores.length === 0) return;

    const activeStoreId =
      stores.find((store) => store.id === activeStoreIdState)?.id ?? stores[0].id;
    localStorage.setItem("active_store_id", activeStoreId);
  }, [activeStoreIdState, stores]);

  const activeStoreId =
    token
      ? stores.find((store) => store.id === activeStoreIdState)?.id ??
        stores[0]?.id ??
        null
      : null;

  const activeStore = stores.find((s) => s.id === activeStoreId) || null;

  useEffect(() => {
    if (!token || !activeStoreId) return;
    queryClient.invalidateQueries({ queryKey: ["wallet"] });
    queryClient.invalidateQueries({ queryKey: ["wallet-summary"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["metrics-overview"] });
    queryClient.invalidateQueries({ queryKey: ["sales-trend"] });
  }, [activeStoreId, queryClient, token]);

  const setActiveStoreId = (id: string) => {
    setActiveStoreIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_store_id", id);
    }
  };

  const createStoreMutation = useMutation({
    mutationFn: (name: string) => storesService.createStore(name),
    onSuccess: (newStore) => {
      queryClient.setQueryData<Store[]>(storesQueryKey, (current = []) => {
        if (current.some((store) => store.id === newStore.id)) return current;
        return [...current, newStore];
      });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
      toast.success("Store created", `"${newStore.name}" is ready`);
      setActiveStoreId(newStore.id);
    },
    onError: (error: unknown) => {
      const message =
        error instanceof AxiosError
          ? error.response?.data?.message || error.response?.data?.error || error.message
          : error instanceof Error
            ? error.message
            : "Something went wrong";
      toast.error(
        "Couldn't create store",
        message
      );
    },
  });

  return (
    <StoreContext.Provider
      value={{
        stores,
        activeStore,
        activeStoreId,
        setActiveStoreId,
        isLoading: (!!token && (isLoading || isFetching)) || (!!token && stores.length > 0 && !activeStore),
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
