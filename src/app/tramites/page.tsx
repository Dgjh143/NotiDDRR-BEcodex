
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Tramite = {
  id: string;
  numero: string;
  ciudadanoId: string;
  ciudadanoNombre: string;
  tipo: string;
  descripcion: string;
  estado: string;
  fecha: string;
};

export default function ListaTramites() {
  const router = useRouter();
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("Todos");
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("notiddrr_demo") !== "activo") {
      router.replace("/");
      return;
    }

    try {
      const guardados = JSON.parse(
        localStorage.getItem("notiddrr_tramites") || "[]"
      );
      setTramites(Array.isArray(guardados) ? guardados : []); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {
      setTramites([]); // eslint-disable-line react-hooks/set-state-in-effect
    }

    setListo(true);
  }, [router]);

  const filtrados = tramites.filter((t) => {
    const texto = busqueda.toLowerCase();

    const coincideBusqueda =
      t.numero.toLowerCase().includes(texto) ||
      t.ciudadanoNombre.toLowerCase().includes(texto) ||
      t.tipo.toLowerCase().includes(texto);

    const coincideEstado =
      filtro === "Todos" || t.estado === filtro;

    return coincideBusqueda && coincideEstado;
  });

  const esVencido = (fecha: string) => {
    const fechaTramite = new Date(fecha);
    const hoy = new Date();
    const diferenciaDias = (hoy.getTime() - fechaTramite.getTime()) / (1000 * 60 * 60 * 24);
    return diferenciaDias > 30;
  };

  const fechaLegible = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-BO");
  };

  const countVencidos = tramites.filter((t) => esVencido(t.fecha)).length;

  if (!listo) {
    return <main className="p-8">Cargando trámites...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/dashboard"
          className="font-semibold text-blue-800 hover:underline"
        >
          ← Volver al panel
        </Link>

        <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-950">
              Lista de trámites
            </h1>

            <p className="mt-2 text-gray-600">
              Consulte los trámites registrados en el sistema.
            </p>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-lg bg-red-100 px-3 py-1 text-xs text-red-800 font-semibold">
              {countVencidos} vencidos
            </span>
            <a
              href="/tramites/nuevo"
              className="rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              + Nuevo trámite
            </a>
          </div>
        </div>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por número, ciudadano o tipo..."
              aria-label="Buscar trámites"
              className="rounded-xl border border-gray-300 p-3 text-gray-900"
            />

            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              aria-label="Filtrar por estado"
              className="rounded-xl border border-gray-300 p-3 text-gray-900"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Recibido">Recibido</option>
              <option value="En revisión">En revisión</option>
              <option value="En calificación">En calificación</option>
              <option value="Listo para recoger">Listo para recoger</option>
            </select>
          </div>

          <h2 className="mb-4 font-semibold text-blue-950">
            Trámites encontrados: {filtrados.length}
          </h2>

          {filtrados.length === 0 ? (
            <div className="rounded-xl bg-gray-50 p-10 text-center">
              <p className="text-lg font-semibold text-gray-700">
                No se encontraron trámites.
              </p>
              <p className="mt-2 text-gray-500">
                Registre un trámite o cambie los filtros de búsqueda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-blue-950 text-white">
                  <tr>
                    <th className="p-4">Número</th>
                    <th className="p-4">Ciudadano</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Estado</th>
                  </tr>
                </thead>

                <tbody>
                  {filtrados.map((t) => (
                    <tr
                      key={t.id}
                      className="border-b border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-4 font-semibold text-blue-900">
                        {t.numero}
                      </td>
                      <td className="p-4 text-gray-800">
                        {t.ciudadanoNombre}
                      </td>
                      <td className="p-4 text-gray-800">
                        {t.tipo}
                      </td>
                      <td className="p-4 text-gray-800">
                        {fechaLegible(t.fecha)}
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-800">
                          {t.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-gray-500">
          BEcodex — Sprint 1 | Datos almacenados localmente
        </p>
      </div>
    </main>
  );
}
