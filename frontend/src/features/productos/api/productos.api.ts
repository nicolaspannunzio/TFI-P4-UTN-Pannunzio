import { api, buildApiError } from "@/shared/api/api";
import type {
  Producto,
  ProductoFiltros,
  ProductoPayload,
  ProductosPaginados,
  ProductoStockPayload,
} from "../types/producto.types";

export async function fetchProductos(
  filtros: ProductoFiltros = {}
): Promise<ProductosPaginados> {
  try {
    const params: Record<string, string | number | boolean> = {
      skip: filtros.skip ?? 0,
      limit: filtros.limit ?? 20,
    };
    if (filtros.search && filtros.search.trim()) {
      params.search = filtros.search.trim();
    }
    if (filtros.categoria_id !== undefined) {
      params.categoria_id = filtros.categoria_id;
    }
    if (filtros.disponible !== undefined) {
      params.disponible = filtros.disponible;
    }

    const { data } = await api.get<ProductosPaginados>("/productos", {
      params,
    });
    return data;
  } catch (err) {
    throw buildApiError(err, "Error al cargar los productos");
  }
}

export async function createProducto(
  payload: ProductoPayload
): Promise<Producto> {
  try {
    const { data } = await api.post<Producto>("/productos", payload);
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo crear el producto");
  }
}

export async function updateProducto(
  id: number,
  payload: Partial<ProductoPayload>
): Promise<Producto> {
  try {
    const { data } = await api.put<Producto>(`/productos/${id}`, payload);
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo actualizar el producto");
  }
}

export async function updateProductoStock(
  id: number,
  payload: ProductoStockPayload
): Promise<Producto> {
  try {
    const { data } = await api.patch<Producto>(
      `/productos/${id}/stock`,
      payload
    );
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo actualizar el stock");
  }
}

export async function deleteProducto(id: number): Promise<void> {
  try {
    await api.delete(`/productos/${id}`);
  } catch (err) {
    throw buildApiError(err, "No se pudo eliminar el producto");
  }
}