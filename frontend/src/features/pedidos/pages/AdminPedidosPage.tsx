import React, { useState } from "react";
import { Paginacion } from "@/shared/components/Paginacion";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { PedidoDetalleModal } from "../components/PedidoDetalleModal";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido, Pedido } from "../types/pedido.types";

const PAGE_SIZE = 15;

export const AdminPedidosPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "">("");
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null
  );

  const { data, isLoading, isError, error } = usePedidos({
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    estado: filtroEstado || undefined,
  });

  const cambiarEstadoMutation = useCambiarEstadoPedido();

  const handleEstadoChange = (id: number, nuevoEstado: EstadoPedido) => {
    if (
      nuevoEstado === "CANCELADO" &&
      !window.confirm(
        `¿Cancelar el pedido #${id}? Se restituirá el stock automáticamente.`
      )
    ) {
      return;
    }
    cambiarEstadoMutation.mutate({ id, estado: nuevoEstado });
  };

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando pedidos...</p>;
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Gestión de Pedidos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Avanzá o cancelá pedidos según el flujo operativo
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            Filtrar por estado
          </label>
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value as EstadoPedido | "");
              setPage(0);
            }}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="EN_PREPARACION">En preparación</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400">
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Entrega / Pago</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Estado</th>
              <th className="py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-500">
                  No hay pedidos para mostrar.
                </td>
              </tr>
            ) : (
              pedidos.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                >
                  <td className="py-3 px-4 font-bold">#{p.id}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {new Date(p.created_at).toLocaleString("es-AR")}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-xs">{p.direccion_entrega}</p>
                    <p className="text-[11px] text-slate-500">{p.forma_pago}</p>
                  </td>
                  <td className="py-3 px-4 font-bold">
                    ${p.total.toLocaleString("es-AR")}
                  </td>
                  <td className="py-3 px-4">
                    <BadgeEstado estado={p.estado} />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPedidoSeleccionado(p)}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                      >
                        Detalle
                      </button>

                      {p.estado === "PENDIENTE" && (
                        <>
                          <button
                            type="button"
                            disabled={cambiarEstadoMutation.isPending}
                            onClick={() =>
                              handleEstadoChange(p.id, "EN_PREPARACION")
                            }
                            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer"
                          >
                            Preparar
                          </button>
                          <button
                            type="button"
                            disabled={cambiarEstadoMutation.isPending}
                            onClick={() => handleEstadoChange(p.id, "CANCELADO")}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </>
                      )}

                      {p.estado === "EN_PREPARACION" && (
                        <>
                          <button
                            type="button"
                            disabled={cambiarEstadoMutation.isPending}
                            onClick={() => handleEstadoChange(p.id, "ENTREGADO")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
                          >
                            Entregar
                          </button>
                          <button
                            type="button"
                            disabled={cambiarEstadoMutation.isPending}
                            onClick={() => handleEstadoChange(p.id, "CANCELADO")}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Paginacion
        page={page}
        limit={PAGE_SIZE}
        total={data?.total ?? 0}
        onPageChange={setPage}
      />

      {pedidoSeleccionado && (
        <PedidoDetalleModal
          pedido={pedidoSeleccionado}
          onClose={() => setPedidoSeleccionado(null)}
        />
      )}
    </div>
  );
};