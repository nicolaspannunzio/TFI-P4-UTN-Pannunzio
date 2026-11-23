import React from "react";

interface PaginacionProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (newPage: number) => void;
}

export const Paginacion: React.FC<PaginacionProps> = ({
  page,
  limit,
  total,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  if (total <= limit) return null;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        Página <span className="font-semibold">{page + 1}</span> de{" "}
        <span className="font-semibold">{totalPages}</span> ({total} resultados)
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};