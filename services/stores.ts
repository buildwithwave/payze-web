import api from "@/lib/axios";

export interface Store {
  id: string;
  name: string;
  createdAt: string;
}

type StoresResponse = Store[] | { data?: Store[]; stores?: Store[] };

function normalizeStores(response: StoresResponse): Store[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.stores)) return response.stores;
  return [];
}

export const storesService = {
  getStores: async (): Promise<Store[]> => {
    const res = await api.get<StoresResponse>("/stores");
    return normalizeStores(res.data);
  },

  createStore: async (name: string): Promise<Store> => {
    const res = await api.post<Store>("/stores", { name });
    return res.data;
  },

  renameStore: async (id: string, name: string): Promise<Store> => {
    const res = await api.patch<Store>(`/stores/${id}`, { name });
    return res.data;
  },
};
