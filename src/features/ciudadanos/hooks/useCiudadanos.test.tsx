import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useCiudadanos } from "@/features/ciudadanos/hooks/useCiudadanos";

describe("useCiudadanos", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("inicia vacío y con estado listo", () => {
    const { result } = renderHook(() => useCiudadanos());
    expect(result.current.status).toBe("ready");
    expect(result.current.ciudadanos).toEqual([]);
  });

  it("agrega un ciudadano y lo persiste", () => {
    const { result } = renderHook(() => useCiudadanos());

    act(() => {
      const res = result.current.agregarCiudadano({
        nombre: "Juan Pérez",
        ci: "12345678",
        whatsapp: "71234567",
      });
      expect(res.ok).toBe(true);
    });

    expect(result.current.ciudadanos).toHaveLength(1);
    expect(result.current.ciudadanos[0].nombre).toBe("Juan Pérez");
  });

  it("rechaza un CI duplicado", () => {
    const { result } = renderHook(() => useCiudadanos());

    act(() => {
      result.current.agregarCiudadano({
        nombre: "Juan",
        ci: "12345678",
        whatsapp: "71234567",
      });
    });

    act(() => {
      const res = result.current.agregarCiudadano({
        nombre: "Ana",
        ci: "12345678",
        whatsapp: "71234567",
      });
      expect(res.ok).toBe(false);
      if (!res.ok) expect(res.error).toContain("Ya existe");
    });

    expect(result.current.ciudadanos).toHaveLength(1);
  });

  it("rechaza un CI inválido", () => {
    const { result } = renderHook(() => useCiudadanos());

    act(() => {
      const res = result.current.agregarCiudadano({
        nombre: "Juan",
        ci: "123",
        whatsapp: "71234567",
      });
      expect(res.ok).toBe(false);
    });

    expect(result.current.ciudadanos).toHaveLength(0);
  });
});
