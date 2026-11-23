import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/shared/api/api";
import type { UsuarioAuth } from "@/features/auth/types/auth.types";

interface AuthState {
  usuario: UsuarioAuth | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username: string, password: string) => {
        const params = new URLSearchParams();
        params.append("username", username);
        params.append("password", password);

        await api.post("/auth/token", params, {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const { data } = await api.get<UsuarioAuth>("/auth/me");
        set({ usuario: data, cargando: false });
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } finally {
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const { data } = await api.get<UsuarioAuth>("/auth/me");
          set({ usuario: data, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      clearUser: () => {
        set({ usuario: null, cargando: false });
      },
    }),
    {
      name: "foodstore-auth",
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);