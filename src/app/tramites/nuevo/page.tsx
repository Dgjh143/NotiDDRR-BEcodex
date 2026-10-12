
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Ciudadano = {
  id: string;
  nombre: string;
  ci: string;
  whatsapp: string;
};

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

export default function NuevoTramite() {
  const router = useRouter();

  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([]);
  const [ciudadanoId, setCiudadanoId] = useState("");
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("notiddrr_demo") !== "activo") {
      router.replace("/");
      return;
    }

    try {
      const datos = JSON.parse(
        localStorage.getItem("notiddrr_ciudadanos") || "[]"
      );
      setCiudadanos(Array.isArray(datos) ? datos : []);
    } catch {
      setCiudadanos([]);
    }

    setListo(true);
  }, [router]);

  const guardar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje("");

    const ciudadano = ciudadanos.find((c) => c.id === ciudadanoId);

    if (!ciudadano || !tipo || !descripcion.trim()) {
      setMensaje("Complete todos los campos del trámite.");
      return;
    }

    let tramites: Tramite[] = [];

    try {
      const datos = JSON.parse(
        localStorage.getItem("notiddrr_tramites") || "[]"
      );
      tramites = Array.isArray(datos) ? datos : [];
    } catch {
      tramites = [];
    }

    const numero = `DDRR-${Date.now()}-${crypto.randomUUID().slice(0, 4)}`;

    const nuevo: Tramite = {
      id: crypto.randomUUID(),
      numero,
      ciudadanoId: ciudadano.id,
      ciudadanoNombre: ciudadano.nombre,
      tipo,
      descripcion: descripcion.trim(),
      estado: "Recibido",
      fecha: new Date().toISOString(),
    };

    try {
      localStorage.setItem(
        "notiddrr_tramites",
        JSON.stringify([...tramites, nuevo])
      );

      router.push("/tramites");
    } catch {
      setMensaje("No se pudo guardar el trámite.");
    }
  };

  if (!listo) {
    return <main className="p-8">Cargando formulario...</main>;
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
            Complete la información para realizar el seguimiento.
          </p>

          {ciudadanos.length === 0 ? (
            <div className="mt-7 rounded-xl bg-yellow-50 p-5 text-yellow-900">
              Primero debe registrar un ciudadano.
              <Link
                href="/ciudadanos"
                className="ml-2 font-bold underline"
              >
                Registrar ciudadano
              </Link>
            </div>
          ) : (
            <form onSubmit={guardar} className="mt-7 space-y-5">
              <div>
                <label htmlFor="ciudadano" className="mb-2 block font-semibold text-gray-700">
                  Ciudadano
                </label>

                <select
                  id="ciudadano"
                  required
                  value={ciudadanoId}
                  onChange={(e) => setCiudadanoId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                >
                  <option value="">Seleccione un ciudadano</option>
                  {ciudadanos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} - CI: {c.ci}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="tipo" className="mb-2 block font-semibold text-gray-700">
                  Tipo de trámite
                </label>

                <select
                  id="tipo"
                  required
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                >
                  <option value="">Seleccione el tipo</option>
                  <option value="Inscripción">Inscripción</option>
                  <option value="Certificación">Certificación</option>
                  <option value="Subinscripción">Subinscripción</option>
                  <option value="Folio Real">Folio Real</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="descripcion" className="mb-2 block font-semibold text-gray-700">
                  Descripción del trámite
                </label>

                <textarea
                  id="descripcion"
                  required
                  rows={4}
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describa brevemente el trámite"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </div>

              <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                Estado inicial: <strong>Recibido</strong>
              </div>

              {mensaje && (
                <p role="alert" className="text-sm text-red-600">
                  {mensaje}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-900 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Guardar trámite
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
