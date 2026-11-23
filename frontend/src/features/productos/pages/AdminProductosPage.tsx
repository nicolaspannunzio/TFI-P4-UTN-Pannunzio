import React, { useMemo, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { ImagenProducto } from "@/shared/ui/ImagenProducto";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { Modal } from "@/shared/ui/Modal";
import { useProductoMutations, useProductos } from "../hooks/useProductos";
import type { Producto } from "../types/producto.types";

const columnHelper = createColumnHelper<Producto>();

export const AdminProductosPage: React.FC = () => {
  // El panel pide limit=100 con paginación del lado del cliente (p. 20)
  const { data, isLoading, isError, error } = useProductos({
    skip: 0,
    limit: 100,
  });
  const { data: categorias = [] } = useCategorias();
  const { crear, actualizar, actualizarStock, eliminar } =
    useProductoMutations();

  const [modalProducto, setModalProducto] = useState(false);
  const [editando, setEditando] = useState<Producto | null>(null);
  const [modalStock, setModalStock] = useState<Producto | null>(null);
  const [errorForm, setErrorForm] = useState<string | null>(null);

  const productos = data?.items ?? [];

  const columns = useMemo(
    () => [
      columnHelper.accessor("nombre", {
        header: "Producto",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex items-center gap-3">
              <ImagenProducto
                src={p.imagen_url}
                alt={p.nombre}
                className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                fallbackClassName="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
              />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {p.nombre}
                </p>
                <p className="text-xs text-slate-500">
                  {p.categoria?.nombre ?? "Sin categoría"}
                </p>
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("precio_base", {
        header: "Precio",
        cell: (info) => (
          <span className="font-semibold">
            ${info.getValue().toLocaleString("es-AR")}
          </span>
        ),
      }),
      columnHelper.accessor("stock", {
        header: "Stock",
        cell: (info) => (
          <span className="font-mono font-semibold">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("disponible", {
        header: "Disponible",
        cell: (info) =>
          info.getValue() ? (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              Sí
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              No
            </span>
          ),
      }),
      columnHelper.display({
        id: "acciones",
        header: "Acciones",
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setErrorForm(null);
                  setModalStock(p);
                }}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold cursor-pointer"
              >
                Stock
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditando(p);
                  setErrorForm(null);
                  setModalProducto(true);
                }}
                className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
              >
                Editar
              </button>
              <button
                type="button"
                disabled={eliminar.isPending}
                onClick={() => {
                  if (
                    window.confirm(`¿Dar de baja el producto "${p.nombre}"?`)
                  ) {
                    eliminar.mutate(p.id);
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
    data: productos,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) {
    return <p className="text-sm text-slate-500">Cargando productos...</p>;
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
            Administración de Productos
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Creá, editá y controlá el stock de tus productos
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditando(null);
            setErrorForm(null);
            setModalProducto(true);
          }}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold cursor-pointer"
        >
          + Nuevo producto
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
                  No hay productos registrados.
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

      {modalProducto && (
        <ProductoFormModal
          producto={editando}
          categorias={categorias}
          errorApi={errorForm}
          onClose={() => setModalProducto(false)}
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
              setModalProducto(false);
            } catch (err) {
              setErrorForm(
                err instanceof Error ? err.message : "Error al guardar"
              );
            }
          }}
        />
      )}

      {modalStock && (
        <StockModal
          producto={modalStock}
          errorApi={errorForm}
          onClose={() => setModalStock(null)}
          onSubmit={async (values) => {
            setErrorForm(null);
            try {
              await actualizarStock.mutateAsync({
                id: modalStock.id,
                payload: values,
              });
              setModalStock(null);
            } catch (err) {
              setErrorForm(
                err instanceof Error ? err.message : "Error al actualizar stock"
              );
            }
          }}
        />
      )}
    </div>
  );
};

interface ProductoFormModalProps {
  producto: Producto | null;
  categorias: { id: number; nombre: string }[];
  errorApi: string | null;
  onClose: () => void;
  onSubmit: (values: {
    nombre: string;
    descripcion: string | null;
    precio_base: number;
    imagen_url: string | null;
    stock: number;
    disponible: boolean;
    categoria_id: number;
  }) => Promise<void>;
}

const ProductoFormModal: React.FC<ProductoFormModalProps> = ({
  producto,
  categorias,
  errorApi,
  onClose,
  onSubmit,
}) => {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? "",
      descripcion: producto?.descripcion ?? "",
      precio_base: producto?.precio_base ?? 0,
      imagen_url: producto?.imagen_url ?? "",
      stock: producto?.stock ?? 0,
      disponible: producto?.disponible ?? true,
      categoria_id: producto?.categoria_id ?? (categorias[0]?.id || 0),
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      });
    },
  });

  return (
    <Modal
      title={producto ? "Editar Producto" : "Nuevo Producto"}
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
        className="space-y-3"
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) =>
              value.trim().length < 2 ? "Mínimo 2 caracteres" : undefined,
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

        <form.Field
          name="categoria_id"
          validators={{
            onChange: ({ value }) =>
              Number(value) <= 0 ? "Seleccioná una categoría" : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-xs font-semibold mb-1">
                Categoría *
              </label>
              <select
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value={0}>Seleccionar...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-rose-500 mt-1">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-3">
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                Number(value) < 0 ? "Debe ser mayor o igual a 0" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Precio base *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
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

          <form.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                Number(value) < 0 ? "Debe ser mayor o igual a 0" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-semibold mb-1">
                  Stock *
                </label>
                <input
                  type="number"
                  min={0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
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
        </div>

        <form.Field name="imagen_url">
          {(field) => (
            <div>
              <label className="block text-xs font-semibold mb-1">
                URL de imagen
              </label>
              <input
                type="url"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="https://..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
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
                rows={2}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              Producto disponible para la venta
            </label>
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

interface StockModalProps {
  producto: Producto;
  errorApi: string | null;
  onClose: () => void;
  onSubmit: (values: { stock: number; disponible: boolean }) => Promise<void>;
}

const StockModal: React.FC<StockModalProps> = ({
  producto,
  errorApi,
  onClose,
  onSubmit,
}) => {
  const form = useForm({
    defaultValues: {
      stock: producto.stock,
      disponible: producto.disponible,
    },
    onSubmit: async ({ value }) => {
      await onSubmit({
        stock: Number(value.stock),
        disponible: value.disponible,
      });
    },
  });

  return (
    <Modal title={`Stock: ${producto.nombre}`} onClose={onClose}>
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
          name="stock"
          validators={{
            onChange: ({ value }) =>
              Number(value) < 0 ? "El stock no puede ser negativo" : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-xs font-semibold mb-1">
                Cantidad en stock *
              </label>
              <input
                type="number"
                min={0}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
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

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
              />
              Disponible en catálogo
            </label>
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
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold cursor-pointer"
              >
                {isSubmitting ? "Actualizando..." : "Actualizar stock"}
              </button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  );
};