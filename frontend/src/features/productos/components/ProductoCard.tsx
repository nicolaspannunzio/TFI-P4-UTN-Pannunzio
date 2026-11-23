import React from "react";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { ImagenProducto } from "@/shared/ui/ImagenProducto";
import type { Producto } from "../types/producto.types";

interface ProductoCardProps {
  producto: Producto;
}

export const ProductoCard: React.FC<ProductoCardProps> = ({ producto }) => {
  const agregar = useCartStore((s) => s.agregar);
  const itemsCarrito = useCartStore((s) => s.items);
  const showNotification = useNotificationStore((s) => s.showNotification);

  const enCarrito = itemsCarrito.find((i) => i.producto_id === producto.id);
  const sinStock = !producto.disponible || producto.stock <= 0;
  const topeAlcanzado =
    enCarrito !== undefined && enCarrito.cantidad >= producto.stock;

  const handleAgregar = () => {
    if (sinStock || topeAlcanzado) return;
    agregar(
      {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: producto.precio_base,
        stock: producto.stock,
        imagen_url: producto.imagen_url,
      },
      1
    );
    showNotification(`"${producto.nombre}" agregado al carrito`, "success");
  };

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <ImagenProducto
          src={producto.imagen_url}
          alt={producto.nombre}
          className="w-full h-full object-cover"
          fallbackClassName="w-full h-full flex items-center justify-center text-4xl"
        />
        {producto.categoria && (
          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900/80 text-white">
            {producto.categoria.nombre}
          </span>
        )}
        {sinStock && (
          <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-600 text-white">
            Sin stock
          </span>
        )}
      </div>

      <div className="flex-1 p-4 flex flex-col justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {producto.nombre}
          </h3>
          {producto.descripcion && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {producto.descripcion}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              ${producto.precio_base.toLocaleString("es-AR")}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Stock: {producto.stock}
            </span>
          </div>

          <button
            type="button"
            disabled={sinStock || topeAlcanzado}
            onClick={handleAgregar}
            className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            {sinStock
              ? "No disponible"
              : topeAlcanzado
              ? `Máximo en carrito (${enCarrito?.cantidad})`
              : enCarrito
              ? `Agregar otro (${enCarrito.cantidad} en carrito)`
              : "Agregar al carrito"}
          </button>
        </div>
      </div>
    </article>
  );
};