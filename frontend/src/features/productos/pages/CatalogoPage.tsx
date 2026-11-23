import React, { useState } from "react";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { Paginacion } from "@/shared/components/Paginacion";
import { CatalogoSkeleton } from "@/shared/components/Skeleton";
import { ProductoCard } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const PAGE_SIZE = 8;

export const CatalogoPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const { data: categorias = [] } = useCategorias();
  const { data, isLoading, isError, error } = useProductos({
    skip: page * PAGE_SIZE,
    limit: PAGE_SIZE,
    search: search || undefined,
    categoria_id: categoriaId,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(0);
  };

  const handleCategoriaChange = (value: string) => {
    setCategoriaId(value ? Number(value) : undefined);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Nuestro Menú
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Elegí tus platos favoritos y armá tu pedido
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full sm:w-64 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          />
          <select
            value={categoriaId ?? ""}
            onChange={(e) => handleCategoriaChange(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
          >
            <option value="">Todas las categorías</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <CatalogoSkeleton count={PAGE_SIZE} />
      ) : isError ? (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
          {(error as Error).message}
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-200">
            No encontramos productos con esos filtros
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Probá limpiando la búsqueda o seleccionando otra categoría.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.items.map((prod) => (
              <ProductoCard key={prod.id} producto={prod} />
            ))}
          </div>

          <Paginacion
            page={page}
            limit={PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};