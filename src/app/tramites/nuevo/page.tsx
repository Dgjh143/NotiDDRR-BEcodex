
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  obtenerCiudadanosTramites,
  obtenerServicios,
  registrarTramite,
  type CiudadanoAPI,
  type ServicioAPI,
} from "@/lib/api/tramites";

export default function NuevoTramite() {
  const router = useRouter();

  const [ciudadanos, setCiudadanos] = useState<CiudadanoAPI[]>([]);
  const [servicios, setServicios] = useState<ServicioAPI[]>([]);
  const [ciudadanoId, setCiudadanoId] = useState("");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [matricula, setMatricula] = useState("");
  const [oficina, setOficina] = useState("Tarija");
  const [serviciosIds, setServiciosIds] = useState<number[]>([]);
  const [funcionarioId, setFuncionarioId] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const datosUsuario = sessionStorage.getItem("notiddrr_usuario");

    if (
      sessionStorage.getItem("notiddrr_demo") !== "activo" ||
      !datosUsuario
    ) {
      router.replace("/");
      return;
    }

    try {
      const usuario = JSON.parse(datosUsuario) as { id: number };
      if (!Number.isInteger(usuario.id)) {
        throw new Error("Usuario inválido");
      }
      // ID provisional de demostración; después vendrá del JWT.
      Promise.resolve().then(() => setFuncionarioId(usuario.id));
    } catch {
      router.replace("/");
      return;
    }

    let activo = true;

    Promise.all([
      obtenerCiudadanosTramites(),
      obtenerServicios(),
    ])
      .then(([datosCiudadanos, datosServicios]) => {
        if (!activo) return;
        setCiudadanos(datosCiudadanos);
        setServicios(datosServicios);
      })
      .catch((error: unknown) => {
        if (activo) {
          setMensaje(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los datos."
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

  const alternarServicio = (id: number) => {
    setServiciosIds((anteriores) =>
      anteriores.includes(id)
        ? anteriores.filter((valor) => valor !== id)
        : [...anteriores, id]
    );
  };

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (guardando) return;

    setMensaje("");

    if (
      !ciudadanoId ||
      !numeroDocumento.trim() ||
      !matricula.trim() ||
      !oficina.trim() ||
      serviciosIds.length === 0 ||
      !funcionarioId
    ) {
      setMensaje("Complete todos los campos y seleccione un servicio.");
      return;
    }

    setGuardando(true);

    try {
      await registrarTramite({
        numeroDocumento: numeroDocumento.trim(),
        matricula: matricula.trim(),
        oficina: oficina.trim(),
        ciudadanoId: Number(ciudadanoId),
        registradoPorId: funcionarioId,
        serviciosIds,
      });

      router.push("/tramites");
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el trámite."
      );
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <main className="p-8 text-gray-700">
        Cargando ciudadanos y servicios...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard"
          className="font-semibold text-blue-800 hover:underline"
        >
          ← Volver al panel
        </Link>

        <section className="mt-7 rounded-2xl bg-white p-8 shadow-md">
          <h1 className="text-3xl font-bold text-blue-950">
            Registrar nuevo trámite
          </h1>

          <p className="mt-2 text-gray-600">
            Registre el documento institucional de Derechos Reales.
          </p>

          {ciudadanos.length === 0 && (
            <p className="mt-5 rounded-xl bg-yellow-50 p-4 text-yellow-900">
              No hay ciudadanos disponibles.{" "}
              <Link href="/ciudadanos" className="font-bold underline">
                Registrar ciudadano
              </Link>
            </p>
          )}

          {mensaje && (
            <p
              role="alert"
              className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {mensaje}
            </p>
          )}

          <form onSubmit={guardar} className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Ciudadano
              </label>
              <select
                required
                value={ciudadanoId}
                onChange={(e) => setCiudadanoId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              >
                <option value="">Seleccione un ciudadano</option>
                {ciudadanos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombres} {c.apellidos} - CI: {c.ci}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Número de documento DDRR
              </label>
              <input
                required
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                placeholder="Número asignado por el sistema institucional"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />
              <p className="mt-1 text-xs text-gray-500">
                Este número se transcribe; NotiDDRR no lo genera.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Matrícula del inmueble
              </label>
              <input
                required
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Ej. 6011010000001"
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold text-gray-700">
                Oficina DDRR
              </label>
              <select
                value={oficina}
                onChange={(e) => setOficina(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
              >
                <option value="Tarija">Tarija</option>
                <option value="Bermejo">Bermejo</option>
                <option value="Yacuiba">Yacuiba</option>
                <option value="Villamontes">Villamontes</option>
                <option value="San Lorenzo">San Lorenzo</option>
                <option value="Entre Ríos">Entre Ríos</option>
              </select>
            </div>

            <fieldset className="rounded-xl border border-gray-200 p-4">
              <legend className="px-2 font-semibold text-gray-700">
                Servicios adquiridos
              </legend>

              <p className="mb-3 text-sm text-gray-500">
                Puede seleccionar más de un servicio.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {servicios.map((servicio) => (
                  <label
                    key={servicio.id}
                    className="flex items-center gap-2 text-sm text-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={serviciosIds.includes(servicio.id)}
                      onChange={() => alternarServicio(servicio.id)}
                      className="h-4 w-4 accent-blue-900"
                    />
                    {servicio.nombre}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
              Estado inicial: <strong>RECIBIDO</strong>
            </div>

            <button
              type="submit"
              disabled={guardando || ciudadanos.length === 0}
              className="w-full rounded-xl bg-blue-900 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {guardando ? "Guardando en PostgreSQL..." : "Guardar trámite"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
