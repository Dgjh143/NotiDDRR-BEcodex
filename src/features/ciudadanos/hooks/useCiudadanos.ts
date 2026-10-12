"use client";

import { useCallback, useSyncExternalStore } from "react";
import type {
  Ciudadano,
  CiudadanoFormData,
} from "@/features/ciudadanos/types/ciudadano";
import {
  getServerSnapshot,
  getSnapshot,
  subscribe,
  writeCiudadanos,
} from "@/features/ciudadanos/lib/storage";
import { validateCI } from "@/features/ciudadanos/lib/validators";

export type LoadStatus = "loading" | "ready";

export type AgregarResult =
  | { ok: true; ciudadano: Ciudadano }
  | { ok: false; error: string };

const noopSubscribe = () => () => {};

function useIsHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export function useCiudadanos() {
  const ciudadanos = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const isHydrated = useIsHydrated();
  const status: LoadStatus = isHydrated ? "ready" : "loading";

  const agregarCiudadano = useCallback(
    (datos: CiudadanoFormData): AgregarResult => {
      const actuales = getSnapshot();
      const ciNormalizado = datos.ci.trim();
      const ciError = validateCI(ciNormalizado);
      if (ciError) return { ok: false, error: ciError };

      if (actuales.some((c) => c.ci.trim() === ciNormalizado)) {
        return {
          ok: false,
          error: "Ya existe un ciudadano registrado con ese CI.",
        };
      }

      const nuevo: Ciudadano = {
        id: crypto.randomUUID(),
        nombre: datos.nombre.trim(),
        ci: ciNormalizado,
        whatsapp: datos.whatsapp.trim(),
        createdAt: new Date().toISOString(),
      };

      try {
        writeCiudadanos([...actuales, nuevo]);
      } catch {
        return {
          ok: false,
          error: "No se pudo guardar en este navegador. Inténtalo nuevamente.",
        };
      }

      return { ok: true, ciudadano: nuevo };
    },
    []
  );

  return {
    ciudadanos,
    status,
    agregarCiudadano,
  };
}
