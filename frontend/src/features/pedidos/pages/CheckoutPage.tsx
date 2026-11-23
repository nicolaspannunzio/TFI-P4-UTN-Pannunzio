import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";
import { useCrearPedido } from "../hooks/usePedidos";
import type { FormaPago } from "../types/pedido.types";

export const CheckoutPage: React.FC = () => {
  const { items, total, vaciar } = useCartStore();
  const crearPedidoMutation = useCrearPedido();
  const navigate = useNavigate();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      try {
        await crearPedidoMutation.mutateAsync({
          items: items.map((i) => ({
            producto_id: i.producto_id,
            cantidad: i.cantidad,
          })),
          direccion_entrega: value.direccion_entrega.trim(),
          forma_pago: value.forma_pago,
          notas: value.notas.trim() || null,
        });
        vaciar();
        navigate("/mis-pedidos", { replace: true });
      } catch (err) {
        setErrorApi(
          err instanceof Error ? err.message : "No se pudo confirmar el pedido"
        );
      }
    },
  });

  if (items.length === 0) {
    return <Navigate to="/carrito" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Confirmar Pedido
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Completá los datos de entrega y medio de pago
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          {errorApi && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
              {errorApi}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) => {
                  const len = value.trim().length;
                  if (len < 5)
                    return "La dirección debe tener al menos 5 caracteres";
                  if (len > 200)
                    return "La dirección no puede superar los 200 caracteres";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Dirección de entrega *
                  </label>
                  <input
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej. San Martín 2450, Piso 2 Depto B"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-rose-500 mt-1">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="forma_pago">
              {(field) => (
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Forma de pago *
                  </label>
                  <select
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as FormaPago)
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="EFECTIVO">Efectivo al recibir</option>
                    <option value="TRANSFERENCIA">
                      Transferencia bancaria
                    </option>
                  </select>
                </div>
              )}
            </form.Field>

            <form.Field name="notas">
              {(field) => (
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    rows={3}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Ej. Sin cebolla, tocar timbre 2B..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              )}
            </form.Field>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Link
                to="/carrito"
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold"
              >
                Volver al carrito
              </Link>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold cursor-pointer"
                  >
                    {isSubmitting ? "Confirmando..." : "Confirmar Pedido"}
                  </button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </div>

        <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-fit space-y-3">
          <h2 className="font-bold text-base">Detalle a confirmar</h2>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
            {items.map((item) => (
              <div
                key={item.producto_id}
                className="py-2 flex items-center justify-between gap-2"
              >
                <span>
                  {item.cantidad}x {item.nombre}
                </span>
                <span className="font-semibold">
                  $
                  {(item.precio_unitario * item.cantidad).toLocaleString(
                    "es-AR"
                  )}
                </span>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between font-extrabold text-base">
            <span>Total</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              ${total().toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};