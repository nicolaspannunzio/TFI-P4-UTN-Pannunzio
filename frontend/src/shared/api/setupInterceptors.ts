import { api } from "./api";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";

let isSetup = false;

export function setupInterceptors() {
  if (isSetup) return;
  isSetup = true;

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const status: number | undefined = error.response?.status;
      const detail: unknown = error.response?.data?.detail;
      const url: string = error.config?.url || "";

      const esLoginOMe =
        url.includes("/auth/token") || url.includes("/auth/me");

      const esCuentaDesactivada =
        status === 400 &&
        typeof detail === "string" &&
        detail.toLowerCase().includes("cuenta de usuario desactivada");

      if ((status === 401 && !esLoginOMe) || esCuentaDesactivada) {
        useAuthStore.getState().clearUser();
      }

      if (status === 403) {
        useNotificationStore
          .getState()
          .showNotification(
            "Acceso denegado: no tenés permisos para esta acción.",
            "error"
          );
      }

      return Promise.reject(error);
    }
  );
}