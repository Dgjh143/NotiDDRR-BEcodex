
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    const sesion = sessionStorage.getItem("notiddrr_demo");

    if (sesion !== "activo") {
      router.replace("/");
    } else {
      setVerificando(false);
    }
  }, [router]);

  const cerrarSesion = () => {
    sessionStorage.removeItem("notiddrr_demo");
    router.push("/");
  };

  if (verificando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-700">
        Cargando panel...
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex flex-wrap items-center justify-between gap-4 bg-blue-950 px-8 py-5 text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-bold">NotiDDRR</h1>
          <p className="text-sm text-blue-200">
            Sistema de Seguimiento de Trámites
          </p>
        </div>

        <button
          onClick={cerrarSesion}
          className="rounded-lg bg-red-600 px-5 py-2 font-semibold hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-3xl font-bold text-blue-950">
          Panel Principal
        </h2>

        <p className="mt-2 text-gray-600">
          Bienvenido al sistema de gestión de trámites de Derechos Reales.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Link
            href="/ciudadanos"
            className="rounded-2xl bg-white p-7 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 text-4xl">👥</div>
            <h3 className="text-xl font-bold text-blue-950">
              Ciudadanos
            </h3>
            <p className="mt-2 text-gray-600">
              Registrar y consultar los ciudadanos del sistema.
            </p>
            <span className="mt-5 inline-block font-semibold text-blue-700">
              Ir a ciudadanos →
            </span>
          </Link>

          <Link
            href="/tramites/nuevo"
            className="rounded-2xl bg-white p-7 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 text-4xl">📝</div>
            <h3 className="text-xl font-bold text-blue-950">
              Nuevo trámite
            </h3>
            <p className="mt-2 text-gray-600">
              Registrar un trámite y asociarlo a un ciudadano.
            </p>
            <span className="mt-5 inline-block font-semibold text-blue-700">
              Registrar trámite →
            </span>
          </Link>

          <Link
            href="/tramites"
            className="rounded-2xl bg-white p-7 shadow-md transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="mb-4 text-4xl">📋</div>
            <h3 className="text-xl font-bold text-blue-950">
              Lista de trámites
            </h3>
            <p className="mt-2 text-gray-600">
              Consultar los trámites registrados y sus estados.
            </p>
            <span className="mt-5 inline-block font-semibold text-blue-700">
              Ver trámites →
            </span>
          </Link>
        </div>

        <section className="mt-10 rounded-2xl bg-white p-7 shadow-md">
          <h3 className="text-xl font-bold text-blue-950">
            Estado del proyecto
          </h3>

          <p className="mt-3 text-gray-600">
            Sprint 1: Desarrollo del Frontend con Next.js,
            React, TypeScript y Tailwind CSS.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Los registros utilizarán almacenamiento local.
            La integración con backend y las notificaciones
            por WhatsApp se realizarán en futuros Sprints.
          </p>
        </section>

        <p className="mt-10 text-center text-sm text-gray-500">
          BEcodex | Proyecto Integrador Full Stack
        </p>
      </main>
    </div>
  );
}
