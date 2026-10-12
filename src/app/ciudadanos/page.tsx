"use client";

import { useDeferredValue, useMemo, useState } from "react";
import Link from "next/link";
import { useCiudadanos } from "@/features/ciudadanos/hooks/useCiudadanos";
import { CiudadanoForm } from "@/features/ciudadanos/components/CiudadanoForm";
import { CiudadanosTable } from "@/features/ciudadanos/components/CiudadanosTable";
import { CiudadanosEmptyState } from "@/features/ciudadanos/components/CiudadanosEmptyState";
import { CiudadanosSkeleton } from "@/features/ciudadanos/components/CiudadanosSkeleton";
import { SearchBar } from "@/features/ciudadanos/components/SearchBar";

export default function CiudadanosPage() {
  const { ciudadanos, status, agregarCiudadano } = useCiudadanos();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);

  const filtrados = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    if (!q) return ciudadanos;
    return ciudadanos.filter(
      (c) => c.nombre.toLowerCase().includes(q) || c.ci.includes(q)
    );
  }, [ciudadanos, deferredQuery]);

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6">
          <Link
            href="/dashboard"
            className="font-semibold text-blue-800 hover:underline"
          >
            ← Volver al panel
          </Link>
        </nav>

        <h1 className="mt-7 text-3xl font-bold text-blue-950">
          Registro de ciudadanos
        </h1>

        <p className="mt-2 text-gray-600">
          Registre los datos del ciudadano para asociarlo a un trámite.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow lg:col-span-1">
            <h2 className="mb-5 text-xl font-bold text-blue-950">
              Nuevo ciudadano
            </h2>

            <CiudadanoForm agregarCiudadano={agregarCiudadano} />
          </section>

          <section className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
            <h2 className="mb-5 text-xl font-bold text-blue-950">
              Ciudadanos registrados ({filtrados.length})
            </h2>

            {status === "ready" && ciudadanos.length > 0 && (
              <SearchBar value={query} onChange={setQuery} />
            )}

            {status === "loading" && <CiudadanosSkeleton />}

            {status === "ready" &&
              (ciudadanos.length === 0 ? (
                <CiudadanosEmptyState />
              ) : filtrados.length === 0 ? (
                <CiudadanosEmptyState
                  message={`Sin resultados para "${deferredQuery}".`}
                />
              ) : (
                <CiudadanosTable ciudadanos={filtrados} />
              ))}
          </section>
        </div>
      </div>
    </main>
  );
}
