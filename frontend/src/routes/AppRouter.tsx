import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage, RegisterPage } from "@/features/auth";
import { AdminCategoriasPage } from "@/features/categorias";
import {
  AdminPedidosPage,
  AdminResumenPage,
  CarritoPage,
  CheckoutPage,
  MisPedidosPage,
} from "@/features/pedidos";
import { AdminProductosPage, CatalogoPage } from "@/features/productos";
import { AdminUsuariosPage } from "@/features/usuarios";
import { UnauthorizedPage } from "@/shared/components/UnauthorizedPage";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<CatalogoPage />} />
      <Route path="/carrito" element={<CarritoPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Rutas protegidas (cualquier usuario autenticado) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/mis-pedidos" element={<MisPedidosPage />} />
      </Route>

      {/* Rutas exclusivas de administrador */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/resumen" element={<AdminResumenPage />} />
        <Route path="/admin/categorias" element={<AdminCategoriasPage />} />
        <Route path="/admin/productos" element={<AdminProductosPage />} />
        <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
        <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};