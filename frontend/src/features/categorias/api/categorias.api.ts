import { api, buildApiError } from "@/shared/api/api";
import type { Categoria, CategoriaPayload } from "../types/categoria.types";

export async function fetchCategorias(): Promise<Categoria[]> {
  try {
    const { data } = await api.get<Categoria[]>("/categorias");
    return data;
  } catch (err) {
    throw buildApiError(err, "Error al cargar las categorías");
  }
}

export async function createCategoria(
  payload: CategoriaPayload
): Promise<Categoria> {
  try {
    const { data } = await api.post<Categoria>("/categorias", payload);
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo crear la categoría");
  }
}

export async function updateCategoria(
  id: number,
  payload: Partial<CategoriaPayload>
): Promise<Categoria> {
  try {
    const { data } = await api.put<Categoria>(`/categorias/${id}`, payload);
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo actualizar la categoría");
  }
}

export async function deleteCategoria(id: number): Promise<void> {
  try {
    await api.delete(`/categorias/${id}`);
  } catch (err) {
    throw buildApiError(err, "No se pudo eliminar la categoría");
  }
}