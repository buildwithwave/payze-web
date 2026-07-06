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
