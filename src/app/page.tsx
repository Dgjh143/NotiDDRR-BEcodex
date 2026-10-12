
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const ingresar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (usuario === "admin" && password === "123456") {
      sessionStorage.setItem("notiddrr_demo", "activo");
      router.push("/dashboard");
    } else {
      setError("Usuario o contraseña incorrectos");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-sky-700 p-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-900 text-3xl font-bold text-white">
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

        <form onSubmit={ingresar} className="space-y-5">
          <div>
            <label htmlFor="usuario" className="mb-2 block text-sm font-semibold text-gray-700">
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ingrese su usuario"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-gray-900 outline-none focus:border-blue-600"
            />
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600">
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
