import { beforeEach, describe, expect, it } from "vitest";
import {
  readCiudadanos,
  writeCiudadanos,
} from "@/features/ciudadanos/lib/storage";
import { STORAGE_KEY } from "@/features/ciudadanos/lib/constants";
import type { Ciudadano } from "@/features/ciudadanos/types/ciudadano";

const muestra: Ciudadano = {
  id: "1",
  nombre: "Juan",
  ci: "12345678",
  whatsapp: "71234567",
};

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("devuelve [] cuando no hay datos", () => {
    expect(readCiudadanos()).toEqual([]);
  });

  it("persiste y recupera ciudadanos", () => {
    writeCiudadanos([muestra]);
    expect(readCiudadanos()).toEqual([muestra]);
  });

  it("ignora elementos con forma inválida", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([muestra, { id: 1 }, null])
    );
    expect(readCiudadanos()).toEqual([muestra]);
  });

  it("devuelve [] si el JSON es inválido", () => {
    localStorage.setItem(STORAGE_KEY, "{no-json");
    expect(readCiudadanos()).toEqual([]);
  });

  it("devuelve [] si el valor no es un array", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ a: 1 }));
    expect(readCiudadanos()).toEqual([]);
  });
});
