import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { ImagenProducto } from "@/shared/ui/ImagenProducto";

export const CarritoPage: React.FC = () => {
  const { items, cambiarCantidad, quitar, vaciar, total } = useCartStore();
  const usuario = useAuthStore((s) => s.usuario);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        <p className="text-4xl">🛒</p>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Tu carrito está vacío
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Explorá el catálogo para agregar platos a tu pedido.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Carrito de Compras
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Revisá las cantidades antes de confirmar tu pedido
          </p>
        </div>
        <button
          type="button"
          onClick={vaciar}
          className="px-3 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 text-xs font-semibold cursor-pointer"
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div
              key={item.producto_id}
              className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center gap-3">
                <ImagenProducto
                  src={item.imagen_url}
                  alt={item.nombre}
                  className="w-16 h-16 rounded-lg object-cover bg-slate-100"
                  fallbackClassName="w-16 h-16 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    {item.nombre}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unitario: ${item.precio_unitario.toLocaleString("es-AR")} ·
                    Stock máx: {item.stock}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad - 1)
                    }
                    className="px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-sm font-semibold">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    disabled={item.cantidad >= item.stock}
                    onClick={() =>
                      cambiarCantidad(item.producto_id, item.cantidad + 1)
                    }
                    className="px-2.5 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <span className="font-bold text-sm w-24 text-right">
                  $
                  {(item.precio_unitario * item.cantidad).toLocaleString(
                    "es-AR"
                  )}
                </span>

                <button
                  type="button"
                  onClick={() => quitar(item.producto_id)}
                  className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-fit space-y-4">
          <h2 className="text-lg font-bold">Resumen del carrito</h2>
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Productos ({items.length})</span>
            <span>${total().toLocaleString("es-AR")}</span>
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-lg font-extrabold">
            <span>Total</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              ${total().toLocaleString("es-AR")}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(usuario ? "/checkout" : "/login", {
                state: { from: { pathname: "/checkout" } },
              })
            }
            className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            {usuario ? "Continuar al Checkout" : "Iniciá sesión para comprar"}
          </button>
        </aside>
      </div>
    </div>
  );
};