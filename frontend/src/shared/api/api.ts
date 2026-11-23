import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
});

export function handleApiError(err: unknown, fallback = "Ocurrió un error inesperado"): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const detail = err.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((d: { msg?: string }) => d.msg ?? "Dato inválido")
        .join(", ");
    }
    if (status) {
      return `${fallback} (HTTP ${status})`;
    }
  }
  return err instanceof Error ? err.message : fallback;
}

export function buildApiError(err: unknown, fallback: string): Error {
  return new Error(handleApiError(err, fallback));
}

export default api;