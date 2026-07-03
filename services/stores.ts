import api from "@/lib/axios";

export interface Store {
  id: string;
  name: string;
  createdAt: string;
}

export const storesService = {
  getStores: async (): Promise<Store[]> => {
    const res = await api.get<Store[]>("/stores");
    return res.data;
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
