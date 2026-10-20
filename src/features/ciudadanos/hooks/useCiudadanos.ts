
"use client";

import { useCallback, useEffect, useState } from "react";

import {
  adaptarCiudadano,
  type Ciudadano,
  type CiudadanoFormData,
} from "@/features/ciudadanos/types/ciudadano";

import {
  obtenerCiudadanos,
  registrarCiudadano,
} from "@/lib/api/ciudadanos";

import { validateCI } from "@/features/ciudadanos/lib/validators";

export type LoadStatus = "loading" | "ready";

export type AgregarResult =
  | { ok: true; ciudadano: Ciudadano }
  | { ok: false; error: string };

export function useCiudadanos() {
  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");

  // Cargar ciudadanos desde PostgreSQL mediante NestJS
  const cargarCiudadanos = useCallback(async () => {
    try {
      const datos = await obtenerCiudadanos();

      setCiudadanos(datos.map(adaptarCiudadano));
    } catch (error) {
      console.error("Error al cargar ciudadanos:", error);
    } finally {
      setStatus("ready");
    }
  }, []);

  // Ejecutar la consulta al iniciar el módulo
  useEffect(() => {
    void cargarCiudadanos();
  }, [cargarCiudadanos]);

  // Registrar un ciudadano en PostgreSQL
  const agregarCiudadano = useCallback(
    async (datos: CiudadanoFormData): Promise<AgregarResult> => {
      const ciNormalizado = datos.ci.trim();

      const ciError = validateCI(ciNormalizado);

      if (ciError) {
        return {
          ok: false,
          error: ciError,
        };
      }

      const nombreCompleto = datos.nombre.trim();
      const partes = nombreCompleto.split(/\s+/);

      if (partes.length < 2) {
        return {
          ok: false,
          error: "Ingrese nombres y apellidos del ciudadano.",
        };
      }

      const nombres = partes[0];
      const apellidos = partes.slice(1).join(" ");

      try {
        const nuevo = await registrarCiudadano({
          nombres,
          apellidos,
          ci: ciNormalizado,
          whatsapp: datos.whatsapp.trim(),
          aceptaNotificaciones: false,
        });

        const ciudadano = adaptarCiudadano(nuevo);

        setCiudadanos((actuales) => [ciudadano, ...actuales]);

        return {
          ok: true,
          ciudadano,
        };
      } catch (error) {
        return {
          ok: false,
          error:
            error instanceof Error
              ? error.message
              : "No se pudo registrar el ciudadano.",
        };
      }
    },
    [],
  );

  return {
    ciudadanos,
    status,
    agregarCiudadano,
  };
}
