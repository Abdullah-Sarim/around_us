import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  getProductsByCity,
  searchProducts,
} from "../lib/api";

// export const useProducts = () => {
//   const result = useQuery({ queryKey: ["products"], queryFn: getAllProducts });
//   return result;
// };

export const useProducts = (city, page = 1) => {
  return useQuery({
    queryKey: ["products", city, page],
    queryFn: () => city ? getProductsByCity(city, page) : getAllProducts(page),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// export const useCreateProduct = () => {
//   return useMutation({ mutationFn: createProduct });
// };

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
};


export const useProduct = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyProducts = () => {
  return useQuery({ queryKey: ["myProducts"], queryFn: getMyProducts, staleTime: 5 * 60 * 1000 });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["myProducts"] });
    },
  });
};

export const useSearchProducts = () => {
  return useMutation({
    mutationFn: ({ query, page = 1 }) => searchProducts({ query, page }),
  });
};
