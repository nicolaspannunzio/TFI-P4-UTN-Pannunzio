import React, { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAuthStore } from "@/store/authStore";
import type { UsuarioAuth } from "@/features/auth/types/auth.types";
import { useUsuarios } from "../hooks/useUsuarios";
import { useToggleUsuarioEstado } from "../hooks/useToggleUsuarioEstado";

const columnHelper = createColumnHelper<UsuarioAuth>();

export const AdminUsuariosPage: React.FC = () => {
  const usuarioActual = useAuthStore((s) => s.usuario);
  const { data: usuarios = [], isLoading, isError, error } = useUsuarios();
  const { activarMutation, desactivarMutation } = useToggleUsuarioEstado();

  const columns = useMemo(
    () => [
      columnHelper.accessor("username", {
        header: "Usuario",
        cell: (info) => (
          <span className="font-semibold text-slate-900 dark:text-white">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("full_name", {
        header: "Nombre",
      }),
      columnHelper.accessor("email", {
        header: "Email",
      }),
      columnHelper.accessor("role", {
        header: "Rol",
        cell: (info) => (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
              info.getValue() === "admin"
                ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300"
                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("disabled", {
        header: "Estado",
        cell: (info) =>
          info.getValue() ? (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              Desactivado
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Activo
            </span>
          ),
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const u = row.original;
          const esMismoUsuario = usuarioActual?.id === u.id;
          const cargando =
            activarMutation.isPending || desactivarMutation.isPending;

          if (esMismoUsuario) {
            return (
              <span className="text-xs italic text-slate-400">Sesión actual</span>
            );
          }

          return u.disabled ? (
            <button
              type="button"
              disabled={cargando}
              onClick={() => activarMutation.mutate(u.id)}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
            >
              Activar
            </button>
          ) : (
            <button
              type="button"
              disabled={cargando}
              onClick={() => desactivarMutation.mutate(u.id)}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
            >
              Desactivar
            </button>
          );
        },
      }),
    ],
    [usuarioActual?.id, activarMutation, desactivarMutation]
  );

  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando usuarios...</p>;
  }

  if (isError) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
        {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Gestión de Usuarios
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Activá o desactivá cuentas registradas en el sistema
        </p>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr
                key={hg.id}
                className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs uppercase text-slate-500 dark:text-slate-400"
              >
                {hg.headers.map((header) => (
                  <th key={header.id} className="py-3 px-4 font-semibold">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};