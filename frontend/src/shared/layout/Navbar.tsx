import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useThemeStore } from "@/store/themeStore";

export const Navbar: React.FC = () => {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const cantidadCarrito = useCartStore((s) =>
    s.items.reduce((acc, item) => acc + item.cantidad, 0)
  );
  const { darkMode, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const isAdmin = usuario?.role === "admin";

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors";

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <Link
            to="/"
            className="font-extrabold text-emerald-600 dark:text-emerald-400 text-xl tracking-tight"
          >
            🍔 Food Store
          </Link>

          <div className="flex items-center gap-4 text-sm font-medium flex-wrap">
            <NavLink to="/" end className={navLinkClass}>
              Catálogo
            </NavLink>

            <NavLink to="/carrito" className={navLinkClass}>
              Carrito
              {cantidadCarrito > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-600 text-white">
                  {cantidadCarrito}
                </span>
              )}
            </NavLink>

            {usuario && (
              <NavLink to="/mis-pedidos" className={navLinkClass}>
                Mis pedidos
              </NavLink>
            )}

            {isAdmin && (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                <NavLink to="/admin/resumen" className={navLinkClass}>
                  Resumen
                </NavLink>
                <NavLink to="/admin/pedidos" className={navLinkClass}>
                  Pedidos
                </NavLink>
                <NavLink to="/admin/productos" className={navLinkClass}>
                  Productos
                </NavLink>
                <NavLink to="/admin/categorias" className={navLinkClass}>
                  Categorías
                </NavLink>
                <NavLink to="/admin/usuarios" className={navLinkClass}>
                  Usuarios
                </NavLink>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            title="Alternar tema claro/oscuro"
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {usuario ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                  {usuario.full_name}
                </p>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
                  {usuario.role}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 bg-rose-100 dark:bg-rose-950 hover:bg-rose-200 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};