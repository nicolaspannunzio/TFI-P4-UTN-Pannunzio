import React, { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "react-router-dom";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuth } from "../hooks/useAuth";

export const RegisterPage: React.FC = () => {
  const { registerUser } = useAuth();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const navigate = useNavigate();
  const [errorApi, setErrorApi] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setErrorApi(null);
      try {
        await registerUser({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        showNotification(
          "Registro exitoso. Ya podés iniciar sesión.",
          "success"
        );
        navigate("/login", { replace: true });
      } catch (err) {
        setErrorApi(
          err instanceof Error ? err.message : "Error al registrar usuario"
        );
      }
    },
  });

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Crear Cuenta
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Registrate como cliente en Food Store
        </p>

        {errorApi && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm">
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
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 3
                  ? "El usuario debe tener al menos 3 caracteres"
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Usuario *
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="ej. jperez"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
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
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2
                  ? "Ingresá tu nombre completo"
                  : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
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
            name="email"
            validators={{
              onChange: ({ value }) =>
                !value.includes("@") ? "Email inválido" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="juan@ejemplo.com"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
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
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length < 8 ? "Mínimo 8 caracteres" : undefined,
            }}
          >
            {(field) => (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña (mín. 8 caracteres) *
                </label>
                <input
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-rose-500 mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer"
              >
                {isSubmitting ? "Registrando..." : "Registrarse"}
              </button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          ¿Ya tenés cuenta?{" "}
          <Link
            to="/login"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
          >
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  );
};