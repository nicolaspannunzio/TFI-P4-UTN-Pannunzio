import React from "react";
import { Link } from "react-router-dom";

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 text-center">
      <span className="text-5xl font-extrabold text-rose-500 mb-2">403</span>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        Acceso Denegado
      </h1>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
        No tenés los permisos necesarios para acceder a esta sección.
      </p>
      <Link
        to="/categories"
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm transition-colors"
      >
        Volver al catálogo
      </Link>
    </div>
  );
};