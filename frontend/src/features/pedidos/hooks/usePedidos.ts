import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import {
  cambiarEstadoPedido,
  cancelarPedidoCliente,
  crearPedido,
  fetchPedidos,
  fetchResumenPedidos,
} from "../api/pedidos.api";
import type {
  EstadoPedido,
  PedidoCreate,
  PedidoFiltros,
} from "../types/pedido.types";

export function usePedidos(filtros: PedidoFiltros = {}) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () => fetchPedidos(filtros),
  });
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: ["pedidos", "resumen"],
    queryFn: fetchResumenPedidos,
  });
}

export function useCrearPedido() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((s) => s.showNotification);

  return useMutation({
    mutationFn: (payload: PedidoCreate) => crearPedido(payload),
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification(`¡Pedido #${pedido.id} creado con éxito!`, "success");
    },
    onError: (err: Error) => {
      showNotification(err.message, "error");
    },
  });
}

export function useCambiarEstadoPedido() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((s) => s.showNotification);

  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, estado),
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      if (pedido.estado === "CANCELADO") {
        queryClient.invalidateQueries({ queryKey: ["productos"] });
      }
      showNotification(
        `Pedido #${pedido.id} actualizado a ${pedido.estado}`,
        "success"
      );
    },
    onError: (err: Error) => {
      showNotification(err.message, "error");
    },
  });
}

export function useCancelarPedido() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((s) => s.showNotification);

  return useMutation({
    mutationFn: (id: number) => cancelarPedidoCliente(id),
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification(
        `Pedido #${pedido.id} cancelado y stock restituido`,
        "info"
      );
    },
    onError: (err: Error) => {
      showNotification(err.message, "error");
    },
  });
}