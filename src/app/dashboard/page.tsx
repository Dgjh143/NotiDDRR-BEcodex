
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Usuario = {
  id: number;
  nombre: string;
  username: string;
  rol: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [verificando, setVerificando] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const sesion = sessionStorage.getItem("notiddrr_demo");
    const usuarioGuardado = sessionStorage.getItem("notiddrr_usuario");

    if (sesion !== "activo" || !usuarioGuardado) {
      router.replace("/");
      return;
    }

    try {
      const datos = JSON.parse(usuarioGuardado) as Usuario;

      if (!datos.nombre || !datos.rol) {
        throw new Error("Sesión inválida");
      }

      setUsuario(datos);
      setVerificando(false);
    } catch {
      sessionStorage.removeItem("notiddrr_demo");
      sessionStorage.removeItem("notiddrr_usuario");
      router.replace("/");
    }
  }, [router]);

  const cerrarSesion = () => {
    sessionStorage.removeItem("notiddrr_demo");
    sessionStorage.removeItem("notiddrr_usuario");
    router.replace("/");
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

        <div className="flex flex-wrap items-center gap-4">
          <div className="text-right">
            <p className="font-semibold">
              {usuario?.nombre}
            </p>
            <p className="text-xs text-blue-200">
              Rol: {usuario?.rol}
            </p>
          </div>

          <button
            onClick={cerrarSesion}
            className="rounded-lg bg-red-600 px-5 py-2 font-semibold transition hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-3xl font-bold text-blue-950">
          Panel Principal
        </h2>

        <p className="mt-2 text-gray-600">
          Bienvenido, {usuario?.nombre}. Gestiona los
          trámites de Derechos Reales desde este panel.
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
              Registrar y consultar ciudadanos almacenados
              en PostgreSQL.
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
              Registrar un documento DDRR, su matrícula
              y los servicios adquiridos.
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
              Consultar documentos, estados y seguimiento
              de trámites.
            </p>
            <span className="mt-5 inline-block font-semibold text-blue-700">
              Ver trámites →
            </span>
          </Link>
        </div>

        <section className="mt-10 rounded-2xl bg-white p-7 shadow-md">
          <h3 className="text-xl font-bold text-blue-950">
            Estado del proyecto — Sprint 2
          </h3>

          <p className="mt-3 text-gray-600">
            Integración Full Stack de Next.js, NestJS,
            Prisma y PostgreSQL.
          </p>

          <div className="mt-5 space-y-3 text-sm text-gray-700">
            <p>
              ✅ Registro y consulta de ciudadanos
              conectados a PostgreSQL.
            </p>
            <p>
              ✅ Verificación de credenciales mediante
              NestJS y bcrypt.
            </p>
            <p>
              ✅ Roles de funcionarios registrados
              en la base de datos.
            </p>
            <p>
              🔧 En desarrollo: sesiones seguras,
              autorización de roles y documentos DDRR.
            </p>
            <p>
              🔧 Pendiente: integración de notificaciones
              por WhatsApp.
            </p>
          </div>
        </section>

        <p className="mt-10 text-center text-sm text-gray-500">
          BEcodex | Proyecto Integrador Full Stack
        </p>
      </main>
    </div>
  );
}
