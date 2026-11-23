import React from "react";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Modal } from "@/shared/ui/Modal";
import type { Pedido } from "../types/pedido.types";

interface PedidoDetalleModalProps {
  pedido: Pedido;
  onClose: () => void;
}

export const PedidoDetalleModal: React.FC<PedidoDetalleModalProps> = ({
  pedido,
  onClose,
}) => {
  return (
    <Modal title={`Detalle del Pedido #${pedido.id}`} onClose={onClose}>
      <div className="space-y-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs text-slate-500">Fecha</p>
            <p className="font-medium">
              {new Date(pedido.created_at).toLocaleString("es-AR")}
            </p>
          </div>
          <BadgeEstado estado={pedido.estado} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg">
          <div>
            <p className="text-xs text-slate-500">Dirección de entrega</p>
            <p className="font-medium">{pedido.direccion_entrega}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Forma de pago</p>
            <p className="font-medium">{pedido.forma_pago}</p>
          </div>
          {pedido.notas && (
            <div className="sm:col-span-2">
              <p className="text-xs text-slate-500">Notas</p>
              <p className="font-medium">{pedido.notas}</p>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">
            Productos del pedido
          </p>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            {pedido.items.map((item, idx) => (
              <div
                key={`${item.producto_id}-${idx}`}
                className="flex items-center justify-between px-3 py-2.5 bg-white dark:bg-slate-900"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {item.nombre_producto}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.cantidad} x $
                    {item.precio_unitario.toLocaleString("es-AR")}
                  </p>
                </div>
                <span className="font-semibold">
                  ${item.subtotal.toLocaleString("es-AR")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800 text-base font-extrabold">
          <span>Total</span>
          <span className="text-emerald-600 dark:text-emerald-400">
            ${pedido.total.toLocaleString("es-AR")}
          </span>
        </div>
      </div>
    </Modal>
  );
};