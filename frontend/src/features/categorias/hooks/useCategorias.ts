import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import {
  createCategoria,
  deleteCategoria,
  fetchCategorias,
  updateCategoria,
} from "../api/categorias.api";
import type { CategoriaPayload } from "../types/categoria.types";

export const CATEGORIAS_QUERY_KEY = ["categorias"] as const;

export function useCategorias() {
  return useQuery({
    queryKey: CATEGORIAS_QUERY_KEY,
    queryFn: fetchCategorias,
  });
}

export function useCategoriaMutations() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: CATEGORIAS_QUERY_KEY });
  };

  const crear = useMutation({
    mutationFn: (payload: CategoriaPayload) => createCategoria(payload),
    onSuccess: () => {
      invalidate();
      showNotification("Categoría creada correctamente", "success");
    },
    onError: (err: Error) => showNotification(err.message, "error"),
  });

  const actualizar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<CategoriaPayload>;
    }) => updateCategoria(id, payload),
    onSuccess: () => {
      invalidate();
      showNotification("Categoría actualizada", "success");
    },
    onError: (err: Error) => showNotification(err.message, "error"),
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => {
      invalidate();
      showNotification("Categoría eliminada", "info");
    },
    onError: (err: Error) => showNotification(err.message, "error"),
  });

  return { crear, actualizar, eliminar };
}