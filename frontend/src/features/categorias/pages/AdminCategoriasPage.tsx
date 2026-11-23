import React, { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Modal } from "@/shared/ui/Modal";
import { useCategoriaMutations, useCategorias } from "../hooks/useCategorias";
import type { Categoria } from "../types/categoria.types";

const columnHelper = createColumnHelper<Categoria>();

export const AdminCategoriasPage: React.FC = () => {
  const { data: categorias = [], isLoading, isError, error } = useCategorias();
  const { crear, actualizar, eliminar } = useCategoriaMutations();

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const abrirCrear = () => {
    setEditando(null);
    setErrorForm(null);
    setModalOpen(true);
  };

  const abrirEditar = (cat: Categoria) => {
    setEditando(cat);
    setErrorForm(null);
    setModalOpen(true);
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => (
          <span className="font-mono text-xs text-slate-500">
            #{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("nombre", {
        header: "Nombre",
        cell: (info) => (
          <span className="font-semibold text-slate-900 dark:text-white">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("descripcion", {
        header: "Descripción",
        cell: (info) => info.getValue() || "—",
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => abrirEditar(cat)}
                className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Editar
              </button>
              <button
                type="button"
                disabled={eliminar.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      `¿Dar de baja la categoría "${cat.nombre}"?`
                    )
                  ) {
                    eliminar.mutate(cat.id);
                  }
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                Eliminar
              </button>
            </div>
          );
        },
      }),
    ],
    [eliminar]
  );

  const table = useReactTable({
    data: categorias,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando categorías...</p>;
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Administración de Categorías
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Gestioná las categorías activas del catálogo
          </p>
        </div>
        <button
          type="button"
          onClick={abrirCrear}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold cursor-pointer"
        >
          + Nueva categoría
        </button>
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
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 text-center text-slate-500"
                >
                  No hay categorías registradas.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="py-3 px-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {table.getPageCount() > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 text-xs">
            <span>
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <CategoriaFormModal
          categoria={editando}
          errorApi={errorForm}
          onClose={() => setModalOpen(false)}
          onSubmit={async (values) => {
            setErrorForm(null);
            try {
              if (editando) {
                await actualizar.mutateAsync({
                  id: editando.id,
                  payload: values,
                });
              } else {
                await crear.mutateAsync(values);
              }
              setModalOpen(false);
            } catch (err) {
              setErrorForm(
                err instanceof Error ? err.message : "Error al guardar"
              );
            }
          }}
        />
      )}
    </div>
  );
};

interface CategoriaFormModalProps {
  categoria: Categoria | null;
  errorApi: string | null;
  onClose: () => void;
  onSubmit: (values: {
    nombre: string;
    descripcion: string | null;
  }) => Promise<void>;
}

const CategoriaFormModal: React.FC<CategoriaFormModalProps> = ({
  categoria,
  errorApi,
  onClose,
  onSubmit,
}) => {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
      });
    },
  });

  return (
    <Modal
      title={categoria ? "Editar Categoría" : "Nueva Categoría"}
      onClose={onClose}
    >
      {errorApi && (
        <div className="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
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
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              const v = value.trim();
              if (v.length < 2) return "Mínimo 2 caracteres";
              if (v.length > 100) return "Máximo 100 caracteres";
              return undefined;
            },
          }}
        >
          {(field) => (
            <div>
              <label className="block text-xs font-semibold mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
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

        <form.Field name="descripcion">
          {(field) => (
            <div>
              <label className="block text-xs font-semibold mb-1">
                Descripción
              </label>
              <textarea
                rows={3}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}
        </form.Field>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
          >
            Cancelar
          </button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
};