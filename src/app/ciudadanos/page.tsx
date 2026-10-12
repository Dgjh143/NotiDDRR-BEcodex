
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Ciudadano = {
  id: string;
  nombre: string;
  ci: string;
  whatsapp: string;
};

export default function CiudadanosPage() {
  const router = useRouter();

  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([]);
  const [nombre, setNombre] = useState("");
  const [ci, setCi] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [listo, setListo] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("notiddrr_demo") !== "activo") {
      router.replace("/");
      return;
    }

    try {
      const guardados = JSON.parse(
        localStorage.getItem("notiddrr_ciudadanos") || "[]"
      );
      setCiudadanos(Array.isArray(guardados) ? guardados : []);
    } catch {
      setCiudadanos([]);
    }

    setListo(true);
  }, [router]);

  const registrar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMensaje("");

    if (!nombre.trim() || !ci.trim() || !whatsapp.trim()) {
      setMensaje("Complete todos los campos.");
      return;
    }

    if (!/^\d{7,8}$/.test(ci.trim())) {
      setMensaje("El CI debe tener 7 u 8 dígitos.");
      return;
    }

    if (!/^[67]\d{7}$/.test(whatsapp.trim())) {
      setMensaje("Ingrese un celular boliviano válido de 8 dígitos.");
      return;
    }

    if (ciudadanos.some((c) => c.ci === ci.trim())) {
      setMensaje("Ya existe un ciudadano registrado con ese CI.");
      return;
    }

    const nuevo: Ciudadano = {
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      ci: ci.trim(),
      whatsapp: whatsapp.trim(),
    };

    const actualizados = [...ciudadanos, nuevo];
    localStorage.setItem(
      "notiddrr_ciudadanos",
      JSON.stringify(actualizados)
    );
    setCiudadanos(actualizados);

    setNombre("");
    setCi("");
    setWhatsapp("");
    setMensaje("Ciudadano registrado correctamente.");
  };

  if (!listo) {
    return <main className="p-8">Cargando ciudadanos...</main>;
  }

  return (
    <main className="min-h-screen bg-gray-100 p-5 md:p-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="font-semibold text-blue-800 hover:underline"
        >
          ← Volver al panel
        </Link>

        <h1 className="mt-7 text-3xl font-bold text-blue-950">
          Registro de ciudadanos
        </h1>
        <p className="mt-2 text-gray-600">
          Registre los datos del ciudadano para asociarlo a un trámite.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl bg-white p-6 shadow lg:col-span-1">
            <h2 className="mb-5 text-xl font-bold text-blue-950">
              Nuevo ciudadano
            </h2>

            <form onSubmit={registrar} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="mb-1 block text-sm text-gray-700">
                  Nombre completo
                </label>
                <input
                  id="nombre"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="ci" className="mb-1 block text-sm text-gray-700">
                  Cédula de identidad
                </label>
                <input
                  id="ci"
                  required
                  value={ci}
                  onChange={(e) => setCi(e.target.value)}
                  placeholder="Ej. 12345678"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="whatsapp" className="mb-1 block text-sm text-gray-700">
                  Número de WhatsApp
                </label>
                <input
                  id="whatsapp"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej. 71234567"
                  className="w-full rounded-lg border border-gray-300 p-3 text-gray-900"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-blue-900 p-3 font-semibold text-white hover:bg-blue-700"
              >
                Guardar ciudadano
              </button>

              {mensaje && (
                <p role="status" className="text-sm text-blue-800">
                  {mensaje}
                </p>
              )}
            </form>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow lg:col-span-2">
            <h2 className="mb-5 text-xl font-bold text-blue-950">
              Ciudadanos registrados ({ciudadanos.length})
            </h2>

            {ciudadanos.length === 0 ? (
              <p className="rounded-xl bg-gray-50 p-8 text-center text-gray-500">
                Todavía no hay ciudadanos registrados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-blue-950 text-white">
                    <tr>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">CI</th>
                      <th className="p-3">WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ciudadanos.map((c) => (
                      <tr key={c.id} className="border-b border-gray-200">
                        <td className="p-3 text-gray-900">{c.nombre}</td>
                        <td className="p-3 text-gray-900">{c.ci}</td>
                        <td className="p-3 text-gray-900">{c.whatsapp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Sprint 1 — Datos de demostración guardados en este navegador
        </p>
      </div>
    </main>
  );
}
