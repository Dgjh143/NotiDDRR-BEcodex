
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState("");

  const ingresar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!usuario.trim() || !password.trim()) {
      setError("Debe completar el usuario y la contraseña.");
      return;
    }

    if (usuario.trim() === "admin" && password === "123456") {
      sessionStorage.setItem("notiddrr_demo", "activo");
      router.push("/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos. Intente nuevamente.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-sky-700 p-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-900 text-3xl font-bold text-white shadow-md">
            N
          </div>

          <h1 className="text-3xl font-bold text-blue-950">
            NotiDDRR
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sistema de Seguimiento de Trámites
          </p>

          <p className="text-sm text-gray-500">
            Derechos Reales
          </p>
        </div>

        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-3 text-center">
          <p className="text-xs font-medium text-blue-800">
            Versión de demostración — Sprint 1
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Acceso simulado para pruebas del Frontend.
          </p>
        </div>

        <form onSubmit={ingresar} className="space-y-5">
          <div>
            <label
              htmlFor="usuario"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Usuario
            </label>

            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => {
                setUsuario(e.target.value);
                setError("");
              }}
              placeholder="Ingrese su usuario"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Contraseña
            </label>

            <div className="relative">
              <input
                id="password"
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Ingrese su contraseña"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 pr-24 text-gray-900 outline-none focus:border-blue-600"
              />

              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                aria-label={
                  mostrarPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-blue-800 hover:text-blue-600"
              >
                {mostrarPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-900 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Iniciar sesión
          </button>
        </form>

        <p className="mt-7 text-center text-xs text-gray-400">
          BEcodex | Proyecto Integrador Full Stack
        </p>
      </div>
    </main>
  );
}
