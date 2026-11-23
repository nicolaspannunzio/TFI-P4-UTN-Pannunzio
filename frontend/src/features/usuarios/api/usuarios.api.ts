import { api, buildApiError } from "@/shared/api/api";
import type { UsuarioAuth } from "@/features/auth/types/auth.types";

export async function fetchUsuarios(): Promise<UsuarioAuth[]> {
  try {
    const { data } = await api.get<UsuarioAuth[]>("/admin/usuarios");
    return data;
  } catch (err) {
    throw buildApiError(err, "Error al cargar los usuarios");
  }
}

export async function activarUsuario(id: number): Promise<UsuarioAuth> {
  try {
    const { data } = await api.post<UsuarioAuth>(`/admin/usuarios/${id}/activar`);
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo activar el usuario");
  }
}

export async function desactivarUsuario(id: number): Promise<UsuarioAuth> {
  try {
    const { data } = await api.post<UsuarioAuth>(`/admin/usuarios/${id}/desactivar`);
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo desactivar el usuario");
  }
}