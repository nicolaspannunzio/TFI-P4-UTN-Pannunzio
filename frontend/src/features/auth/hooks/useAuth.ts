import { useAuthStore } from "@/store/authStore";
import { registerRequest } from "../api/auth.api";
import type { RegisterPayload } from "../types/auth.types";

export function useAuth() {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const checkSession = useAuthStore((s) => s.checkSession);

  const registerUser = async (payload: RegisterPayload) => {
    return await registerRequest(payload);
  };

  return {
    usuario,
    cargando,
    isAdmin: usuario?.role === "admin",
    login,
    logout,
    checkSession,
    registerUser,
  };
}