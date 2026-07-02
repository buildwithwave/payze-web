import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  catalogService,
  Product,
  ProductInput,
} from "@/services/catalog";
import { toast } from "@/components/ui/toast";

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong";
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: catalogService.getProducts,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductInput) => catalogService.createProduct(data),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added", `${product.name} is now in your catalogue`);
    },
    onError: (error) => {
      toast.error("Couldn't add product", getErrorMessage(error));
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductInput> }) =>
      catalogService.updateProduct(id, data),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated", `${product.name} has been saved`);
    },
    onError: (error) => {
      toast.error("Couldn't update product", getErrorMessage(error));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (product: Product) => catalogService.deleteProduct(product.id),
    onSuccess: (_, product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted", `${product.name} was removed`);
    },
    onError: (error) => {
      toast.error("Couldn't delete product", getErrorMessage(error));
    },
  });
}

export function useSeedProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: catalogService.seedSampleProducts,
    onSuccess: (products) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(
        "Sample products added",
        `${products.length} products are ready to sell`,
      );
    },
    onError: (error) => {
      toast.error("Couldn't add samples", getErrorMessage(error));
    },
  });
}
