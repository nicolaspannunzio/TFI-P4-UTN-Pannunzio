import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Paginacion } from "@/shared/components/Paginacion";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { PedidoDetalleModal } from "../components/PedidoDetalleModal";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import type { Pedido } from "../types/pedido.types";

const PAGE_SIZE = 10;

export const MisPedidosPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null
  );

  const { data, isLoading, isError, error } = usePedidos({
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
  });
  const cancelarMutation = useCancelarPedido();

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando tus pedidos...</p>;
  }

  if (isError) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
        {(error as Error).message}
      </div>
    );
  }

  const pedidos = data?.items ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Mis Pedidos
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Consultá el estado y el detalle de tus compras
        </p>
      </div>

      {pedidos.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-lg font-semibold">Todavía no realizaste pedidos</p>
          <Link
            to="/"
            className="inline-block px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
          >
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-base">
                    Pedido #{pedido.id}
                  </span>
                  <BadgeEstado estado={pedido.estado} />
                </div>
                <p className="text-xs text-slate-500">
                  {new Date(pedido.created_at).toLocaleString("es-AR")} ·{" "}
                  {pedido.forma_pago} · {pedido.direccion_entrega}
                </p>
                <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  Total: ${pedido.total.toLocaleString("es-AR")} (
                  {pedido.items.length} ítems)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPedidoSeleccionado(pedido)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
                >
                  Ver detalle
                </button>

                {pedido.estado === "PENDIENTE" && (
                  <button
                    type="button"
                    disabled={cancelarMutation.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          `¿Seguro que querés cancelar el pedido #${pedido.id}?`
                        )
                      ) {
                        cancelarMutation.mutate(pedido.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
                  >
                    Cancelar pedido
                  </button>
                )}
              </div>
            </div>
          ))}

          <Paginacion
            page={page}
            limit={PAGE_SIZE}
            total={data?.total ?? 0}
            onPageChange={setPage}
          />
        </div>
      )}

      {pedidoSeleccionado && (
        <PedidoDetalleModal
          pedido={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}
    </div>
  );
};