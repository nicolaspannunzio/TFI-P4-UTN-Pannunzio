import React from "react";

export type EstadoPedido =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO";

const ESTILOS_ESTADO: Record<EstadoPedido, { label: string; classes: string }> = {
  PENDIENTE: {
    label: "Pendiente",
    classes:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
  },
  EN_PREPARACION: {
    label: "En preparación",
    classes:
      "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800",
  },
  ENTREGADO: {
    label: "Entregado",
    classes:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
  },
  CANCELADO: {
    label: "Cancelado",
    classes:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
  },
};

export const BadgeEstado: React.FC<{ estado: string }> = ({ estado }) => {
  const config = ESTILOS_ESTADO[estado as EstadoPedido] ?? {
    label: estado,
    classes: "bg-slate-100 text-slate-800 border-slate-300",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}
    >
      {config.label}
    </span>
  );
};