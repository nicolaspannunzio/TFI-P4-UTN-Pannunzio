import React from "react";
import { Link } from "react-router-dom";
import { useResumenPedidos } from "../hooks/usePedidos";

export const AdminResumenPage: React.FC = () => {
  const { data, isLoading, isError, error } = useResumenPedidos();

  if (isLoading) {
    return (
      <p className="text-sm text-slate-500">Cargando resumen del negocio...</p>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
        {error instanceof Error ? error.message : "Error al cargar resumen"}
      </div>
    );
  }

  const tarjetas = [
    {
      titulo: "Pedidos Pendientes",
      valor: data.pendientes,
      color: "border-amber-400 text-amber-600 dark:text-amber-400",
    },
    {
      titulo: "En Preparación",
      valor: data.en_preparacion,
      color: "border-sky-400 text-sky-600 dark:text-sky-400",
    },
    {
      titulo: "Entregados",
      valor: data.entregados,
      color: "border-emerald-400 text-emerald-600 dark:text-emerald-400",
    },
    {
      titulo: "Cancelados",
      valor: data.cancelados,
      color: "border-rose-400 text-rose-600 dark:text-rose-400",
    },
    {
      titulo: "Pedidos de Hoy",
      valor: data.pedidos_hoy,
      color: "border-indigo-400 text-indigo-600 dark:text-indigo-400",
    },
    {
      titulo: "Ingresos (Entregados)",
      valor: `$${data.ingresos_entregados.toLocaleString("es-AR")}`,
      color: "border-emerald-500 text-emerald-600 dark:text-emerald-400",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Resumen del Negocio
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Indicadores operativos y facturación de pedidos entregados
          </p>
        </div>
        <Link
          to="/admin/pedidos"
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
        >
          Ver todos los pedidos
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tarjetas.map((t) => (
          <div
            key={t.titulo}
            className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-l-4 ${t.color} shadow-sm`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t.titulo}
            </p>
            <p className="text-3xl font-extrabold mt-2">{t.valor}</p>
          </div>
        ))}
      </div>
    </div>
  );
};