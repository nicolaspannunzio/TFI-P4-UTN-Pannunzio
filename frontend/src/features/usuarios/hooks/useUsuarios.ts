import { useQuery } from "@tanstack/react-query";
import { fetchUsuarios } from "../api/usuarios.api";

export const USUARIOS_QUERY_KEY = ["admin", "usuarios"] as const;

export function useUsuarios() {
  return useQuery({
    queryKey: USUARIOS_QUERY_KEY,
    queryFn: fetchUsuarios,
  });
}