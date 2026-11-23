import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock: number;
  imagen_url?: string | null;
}

interface CartState {
  items: CartItem[];
  agregar: (item: Omit<CartItem, "cantidad">, cantidad?: number) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (nuevo, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find(
            (i) => i.producto_id === nuevo.producto_id
          );
          if (existente) {
            const nuevaCant = Math.min(
              existente.cantidad + cantidad,
              nuevo.stock
            );
            return {
              items: state.items.map((i) =>
                i.producto_id === nuevo.producto_id
                  ? { ...i, cantidad: nuevaCant, stock: nuevo.stock }
                  : i
              ),
            };
          }
          const cantInicial = Math.min(Math.max(1, cantidad), nuevo.stock);
          if (cantInicial <= 0) return state;
          return {
            items: [...state.items, { ...nuevo, cantidad: cantInicial }],
          };
        }),

      quitar: (producto_id) =>
        set((state) => ({
          items: state.items.filter((i) => i.producto_id !== producto_id),
        })),

      cambiarCantidad: (producto_id, cantidad) =>
        set((state) => {
          if (cantidad <= 0) {
            return {
              items: state.items.filter((i) => i.producto_id !== producto_id),
            };
          }
          return {
            items: state.items.map((i) =>
              i.producto_id === producto_id
                ? { ...i, cantidad: Math.min(cantidad, i.stock) }
                : i
            ),
          };
        }),

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce(
          (acc, item) => acc + item.precio_unitario * item.cantidad,
          0
        ),

      cantidadTotal: () =>
        get().items.reduce((acc, item) => acc + item.cantidad, 0),
    }),
    {
      name: "foodstore-cart",
    }
  )
);