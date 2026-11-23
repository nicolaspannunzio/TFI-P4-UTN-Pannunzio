import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { activarUsuario, desactivarUsuario } from "../api/usuarios.api";
import { USUARIOS_QUERY_KEY } from "./useUsuarios";

export function useToggleUsuarioEstado() {
  const queryClient = useQueryClient();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const activarMutation = useMutation({
    mutationFn: activarUsuario,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
      showNotification(`Usuario ${user.username} activado`, "success");
    },
    onError: (err: Error) => {
      showNotification(err.message, "error");
    },
  });

  const desactivarMutation = useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: USUARIOS_QUERY_KEY });
      showNotification(`Usuario ${user.username} desactivado`, "info");
    },
    onError: (err: Error) => {
      showNotification(err.message, "error");
    },
  });

  return { activarMutation, desactivarMutation };
}