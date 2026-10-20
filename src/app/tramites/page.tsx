
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  actualizarEstado,
  obtenerTramites,
  type EstadoTramite,
  type TramiteAPI,
} from "@/lib/api/tramites";

const ESTADOS: { valor: EstadoTramite; nombre: string }[] = [
  { valor: "RECIBIDO", nombre: "Recibido" },
  { valor: "EN_PROCESO", nombre: "En proceso" },
  { valor: "OBSERVADO", nombre: "Observado" },
  { valor: "MESA_SALIDA", nombre: "Mesa de salida / Listo para recoger" },
  { valor: "ENTREGADO", nombre: "Entregado" },
];

function nombreEstado(estado: EstadoTramite) {
  return ESTADOS.find((e) => e.valor === estado)?.nombre ?? estado;
}

export default function ListaTramites() {
  const router = useRouter();

  const [tramites, setTramites] = useState<TramiteAPI[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("TODOS");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState<number | null>(null);
  const [funcionarioId, setFuncionarioId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [detalle, setDetalle] = useState<number | null>(null);

  useEffect(() => {
    const usuarioGuardado = sessionStorage.getItem("notiddrr_usuario");

    if (
      sessionStorage.getItem("notiddrr_demo") !== "activo" ||
      !usuarioGuardado
    ) {
      router.replace("/");
      return;
    }

    try {
      const usuario = JSON.parse(usuarioGuardado) as { id: number };
      Promise.resolve().then(() => setFuncionarioId(usuario.id));
    } catch {
      router.replace("/");
      return;
    }

    let activo = true;

    obtenerTramites()
      .then((datos) => {
        if (activo) setTramites(datos);
      })
      .catch((error: unknown) => {
        if (activo) {
          setMensaje(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los trámites."
          );
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [router]);

  const cambiarEstado = async (
    tramite: TramiteAPI,
    estado: EstadoTramite
  ) => {
    if (!funcionarioId || estado === tramite.estado) return;

    if (
      estado === "MESA_SALIDA" &&
      !window.confirm(
        "¿Confirma que el documento está físicamente listo para recoger? " +
        "Se preparará el aviso de WhatsApp si el ciudadano lo autorizó."
      )
    ) {
      return;
    }

    const observacion =
      window.prompt("Observación del cambio de estado (opcional):", "") ??
      null;

    if (observacion === null) return;

    setProcesando(tramite.id);
    setMensaje("");

    try {
      await actualizarEstado(
        tramite.id,
        estado,
        funcionarioId,
        observacion
      );

      const datos = await obtenerTramites();
      setTramites(datos);
      setMensaje("Estado actualizado correctamente en PostgreSQL.");
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado."
      );
    } finally {
      setProcesando(null);
    }
  };

  const filtrados = tramites.filter((t) => {
    const texto = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      t.numeroDocumento.toLowerCase().includes(texto) ||
      t.matricula.toLowerCase().includes(texto) ||
      `${t.ciudadano.nombres} ${t.ciudadano.apellidos}`
        .toLowerCase()
        .includes(texto);

    return (
      coincideBusqueda &&
      (filtro === "TODOS" || t.estado === filtro)
    );
  });

  if (cargando) {
    return (
      <main className="p-8 text-gray-700">
        Cargando trámites desde PostgreSQL...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="mx-auto max-w-7xl">
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
              Documentos de Derechos Reales y seguimiento de estados.
            </p>
          </div>

          <Link
            href="/tramites/nuevo"
            className="rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            + Nuevo trámite
          </Link>
        </div>

        {mensaje && (
          <p role="status" className="mt-5 rounded-lg bg-blue-50 p-4 text-blue-900">
            {mensaje}
          </p>
        )}

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-md">
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por documento, matrícula o ciudadano..."
              className="rounded-xl border border-gray-300 p-3 text-gray-900"
            />

            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="rounded-xl border border-gray-300 p-3 text-gray-900"
            >
              <option value="TODOS">Todos los estados</option>
              {ESTADOS.map((e) => (
                <option key={e.valor} value={e.valor}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <h2 className="mb-4 font-semibold text-blue-950">
            Trámites encontrados: {filtrados.length}
          </h2>

          {filtrados.length === 0 ? (
            <p className="rounded-xl bg-gray-50 p-10 text-center text-gray-600">
              No se encontraron trámites.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-blue-950 text-white">
                  <tr>
                    <th className="p-3">Documento</th>
                    <th className="p-3">Ciudadano</th>
                    <th className="p-3">Matrícula</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Acciones</th>
                  </tr>
                </thead>

                <tbody>
                  {filtrados.map((t) => (
                    <tr key={t.id} className="border-b align-top">
                      <td className="p-3 font-semibold text-blue-900">
                        {t.numeroDocumento}
                      </td>
                      <td className="p-3 text-gray-800">
                        {t.ciudadano.nombres} {t.ciudadano.apellidos}
                      </td>
                      <td className="p-3 text-gray-800">
                        {t.matricula}
                      </td>
                      <td className="p-3">
                        <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-900">
                          {nombreEstado(t.estado)}
                        </span>
                      </td>
                      <td className="space-y-2 p-3">
                        <select
                          value={t.estado}
                          disabled={procesando === t.id}
                          onChange={(e) =>
                            void cambiarEstado(
                              t,
                              e.target.value as EstadoTramite
                            )
                          }
                          className="w-full rounded-lg border p-2 text-gray-900"
                        >
                          {ESTADOS.map((e) => (
                            <option key={e.valor} value={e.valor}>
                              {e.nombre}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() =>
                            setDetalle(detalle === t.id ? null : t.id)
                          }
                          className="text-sm font-semibold text-blue-700 underline"
                        >
                          {detalle === t.id ? "Ocultar detalle" : "Ver detalle"}
                        </button>

                        {detalle === t.id && (
                          <div className="min-w-60 space-y-2 rounded-lg bg-gray-50 p-3 text-gray-700">
                            <p><strong>Oficina:</strong> {t.oficina}</p>
                            <p>
                              <strong>Servicios:</strong>{" "}
                              {t.servicios.map((s) => s.servicio.nombre).join(", ")}
                            </p>
                            <p>
                              <strong>Registrado por:</strong>{" "}
                              {t.registradoPor.nombre}
                            </p>

                            <h4 className="font-bold">Historial</h4>
                            {t.historial.length === 0 ? (
                              <p>Sin cambios de estado todavía.</p>
                            ) : (
                              t.historial.map((h) => (
                                <p key={h.id}>
                                  {nombreEstado(h.estadoNuevo)} —{" "}
                                  {h.funcionario.nombre}
                                  {h.observacion && `: ${h.observacion}`}
                                </p>
                              ))
                            )}

                            <h4 className="font-bold">WhatsApp</h4>
                            {t.notificaciones.length === 0 ? (
                              <p>Sin avisos generados.</p>
                            ) : (
                              t.notificaciones.map((n) => (
                                <div key={n.id} className="border-t pt-2">
                                  <p><strong>Estado:</strong> {n.estado}</p>
                                  <p><strong>Teléfono:</strong> {n.telefono}</p>
                                  <p className="whitespace-pre-line">{n.mensaje}</p>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-6 text-center text-xs text-gray-500">
          BEcodex — Sprint 2 | Datos almacenados en PostgreSQL
        </p>
      </div>
    </main>
  );
}
