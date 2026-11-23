import type { Categoria } from "@/features/categorias/types/categoria.types";

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria_id: number;
  categoria: Categoria | null;
}

export interface ProductosPaginados {
  total: number;
  items: Producto[];
}

export interface ProductoFiltros {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}

export interface ProductoPayload {
  nombre: string;
  descripcion?: string | null;
  precio_base: number;
  imagen_url?: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export interface ProductoStockPayload {
  stock: number;
  disponible: boolean;
}