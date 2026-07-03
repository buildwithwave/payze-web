import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  catalogService,
  Product,
  ProductInput,
} from "@/services/catalog";
import { useStore } from "@/lib/store-context";
import { toast } from "@/components/ui/toast";
import { AxiosError } from "axios";

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.response?.data?.error || error.message;
  }
  return error instanceof Error ? error.message : "Something went wrong";
}

function generateBarcode(): string {
  let code = "2";
  for (let i = 0; i < 12; i++) code += Math.floor(Math.random() * 10);
  return code;
}

export function useProducts() {
  const { activeStoreId } = useStore();

  return useQuery({
    queryKey: ["products", activeStoreId],
    queryFn: () => catalogService.getProducts(activeStoreId!),
    enabled: !!activeStoreId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { activeStoreId } = useStore();

  return useMutation({
    mutationFn: (data: ProductInput) =>
      catalogService.createProduct(activeStoreId!, data),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products", activeStoreId] });
      toast.success("Product added", `${product.name} is now in your catalogue`);
    },
    onError: (error) => {
      toast.error("Couldn't add product", getErrorMessage(error));
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { activeStoreId } = useStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductInput> }) =>
      catalogService.updateProduct(activeStoreId!, id, data),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products", activeStoreId] });
      toast.success("Product updated", `${product.name} has been saved`);
    },
    onError: (error) => {
      toast.error("Couldn't update product", getErrorMessage(error));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { activeStoreId } = useStore();

  return useMutation({
    mutationFn: (product: Product) =>
      catalogService.deleteProduct(activeStoreId!, product.id),
    onSuccess: (_, product) => {
      queryClient.invalidateQueries({ queryKey: ["products", activeStoreId] });
      toast.success("Product deleted", `${product.name} was removed`);
    },
    onError: (error) => {
      toast.error("Couldn't delete product", getErrorMessage(error));
    },
  });
}

export function useSeedProducts() {
  const queryClient = useQueryClient();
  const { activeStoreId } = useStore();

  return useMutation({
    mutationFn: async () => {
      if (!activeStoreId) throw new Error("No active store");
      const samples: Array<Omit<ProductInput, "barcode" | "lowStockThreshold">> = [
        { name: "Golden Penny Semovita 1kg", category: "Groceries", price: 1850, stock: 40 },
        { name: "Dangote Sugar 500g", category: "Groceries", price: 950, stock: 60 },
        { name: "Indomie Chicken 70g", category: "Groceries", price: 350, stock: 200 },
        { name: "Peak Milk Tin 170g", category: "Groceries", price: 1200, stock: 48 },
        { name: "Coca-Cola 50cl", category: "Drinks", price: 400, stock: 120 },
        { name: "Eva Water 75cl", category: "Drinks", price: 300, stock: 90 },
        { name: "Chivita Juice 1L", category: "Drinks", price: 1700, stock: 35 },
        { name: "Gala Sausage Roll", category: "Snacks", price: 350, stock: 150 },
        { name: "Digestive Biscuits", category: "Snacks", price: 1500, stock: 25 },
        { name: "Sunlight Detergent 900g", category: "Household", price: 2200, stock: 30 },
        { name: "Hypo Bleach 500ml", category: "Household", price: 650, stock: 45 },
        { name: "Dettol Soap 110g", category: "Personal Care", price: 700, stock: 80 },
      ];

      const promises = samples.map((s) =>
        catalogService.createProduct(activeStoreId, {
          ...s,
          barcode: generateBarcode(),
          lowStockThreshold: 10,
        })
      );

      return Promise.all(promises);
    },
    onSuccess: (products) => {
      queryClient.invalidateQueries({ queryKey: ["products", activeStoreId] });
      toast.success(
        "Sample products added",
        `${products.length} products are ready to sell`
      );
    },
    onError: (error) => {
      toast.error("Couldn't add samples", getErrorMessage(error));
    },
  });
}
