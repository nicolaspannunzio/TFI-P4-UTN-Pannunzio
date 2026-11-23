import { api, buildApiError } from "@/shared/api/api";
import type { RegisterPayload, UsuarioAuth } from "../types/auth.types";

export async function registerRequest(
  payload: RegisterPayload
): Promise<UsuarioAuth> {
  try {
    const { data } = await api.post<UsuarioAuth>("/auth/register", payload);
    return data;
  } catch (err) {
    throw buildApiError(err, "No se pudo completar el registro");
  }
}