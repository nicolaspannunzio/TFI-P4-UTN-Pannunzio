import { api, buildApiError } from "@/shared/api/api";
import type {
  EstadoPedido,
  Pedido,
  PedidoCreate,
  PedidoFiltros,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedido.types";

export async function crearPedido(payload: PedidoCreate): Promise<Pedido> {
  try {
    const { data } = await api.post<Pedido>("/pedidos", payload);
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo confirmar el pedido");
  }
}

export async function fetchPedidos(
  filtros: PedidoFiltros = {}
): Promise<PedidosPaginados> {
  try {
    const params: Record<string, string | number> = {
      skip: filtros.skip ?? 0,
      limit: filtros.limit ?? 20,
    };
    if (filtros.estado) {
      params.estado = filtros.estado;
    }
    const { data } = await api.get<PedidosPaginados>("/pedidos", { params });
    return data;
  } catch (err) {
    throw buildApiError(err, "Error al cargar los pedidos");
  }
}

export async function fetchPedidoDetalle(id: number): Promise<Pedido> {
  try {
    const { data } = await api.get<Pedido>(`/pedidos/${id}`);
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo cargar el detalle del pedido");
  }
}

export async function cambiarEstadoPedido(
  id: number,
  estado: EstadoPedido
): Promise<Pedido> {
  try {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}/estado`, {
      estado,
    });
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo cambiar el estado del pedido");
  }
}

export async function cancelarPedidoCliente(id: number): Promise<Pedido> {
  try {
    const { data } = await api.patch<Pedido>(`/pedidos/${id}/cancelar`);
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo cancelar el pedido");
  }
}

export async function fetchResumenPedidos(): Promise<ResumenPedidos> {
  try {
    const { data } = await api.get<ResumenPedidos>("/pedidos/resumen");
    return data;
  } catch (err) {
    throw buildApiError(err, "Error al cargar el resumen del negocio");
  }
}