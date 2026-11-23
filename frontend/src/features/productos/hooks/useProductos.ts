import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import {
  createProducto,
  deleteProducto,
  fetchProductos,
  updateProducto,
  updateProductoStock,
} from "../api/productos.api";
import type {
  ProductoFiltros,
  ProductoPayload,
  ProductoStockPayload,
} from "../types/producto.types";

export function useProductos(filtros: ProductoFiltros = {}) {
  return useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => fetchProductos(filtros),
  });
}

export function useProductoMutations() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["productos"] });
  };

  const crear = useMutation({
    mutationFn: (payload: ProductoPayload) => createProducto(payload),
    onSuccess: () => {
      invalidate();
      showNotification("Producto creado correctamente", "success");
    },
    onError: (err: Error) => showNotification(err.message, "error"),
  });

  const actualizar = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ProductoPayload>;
    }) => updateProducto(id, payload),
    onSuccess: () => {
      invalidate();
      showNotification("Producto actualizado", "success");
    },
    onError: (err: Error) => showNotification(err.message, "error"),
  });

  const actualizarStock = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ProductoStockPayload;
    }) => updateProductoStock(id, payload),
    onSuccess: () => {
      invalidate();
      showNotification("Stock y disponibilidad actualizados", "success");
    },
    onError: (err: Error) => showNotification(err.message, "error"),
  });

  const eliminar = useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => {
      invalidate();
      showNotification("Producto eliminado", "info");
    },
    onError: (err: Error) => showNotification(err.message, "error"),
  });

  return { crear, actualizar, actualizarStock, eliminar };
}