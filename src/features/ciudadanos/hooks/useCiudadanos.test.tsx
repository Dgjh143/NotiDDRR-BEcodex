
import { act, renderHook, waitFor } from "@testing-library/react";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { useCiudadanos } from "./useCiudadanos";

import {
  obtenerCiudadanos,
  registrarCiudadano,
} from "@/lib/api/ciudadanos";

vi.mock("@/lib/api/ciudadanos", () => ({
  obtenerCiudadanos: vi.fn(),
  registrarCiudadano: vi.fn(),
}));

const mockObtener = vi.mocked(obtenerCiudadanos);
const mockRegistrar = vi.mocked(registrarCiudadano);

const ciudadanoPrueba = {
  id: 1,
  nombres: "Juan",
  apellidos: "Pérez",
  ci: "12345678",
  whatsapp: "71234567",
  aceptaNotificaciones: false,
  creadoEn: "2026-10-20T12:00:00.000Z",
};

describe("useCiudadanos con API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockObtener.mockResolvedValue([]);
  });

  it("carga ciudadanos desde el backend", async () => {
    mockObtener.mockResolvedValue([ciudadanoPrueba]);

    const { result } = renderHook(() => useCiudadanos());

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    expect(result.current.ciudadanos).toHaveLength(1);
    expect(result.current.ciudadanos[0].nombre).toBe(
      "Juan Pérez"
    );
  });

  it("registra un ciudadano mediante la API", async () => {
    mockRegistrar.mockResolvedValue(ciudadanoPrueba);

    const { result } = renderHook(() => useCiudadanos());

    await waitFor(() => {
      expect(result.current.status).toBe("ready");
    });

    let respuesta:
      | Awaited<ReturnType<typeof result.current.agregarCiudadano>>
      | undefined;

    await act(async () => {
      respuesta = await result.current.agregarCiudadano({
        nombre: "Juan Pérez",
        ci: "12345678",
        whatsapp: "71234567",
      });
    });

    expect(respuesta?.ok).toBe(true);
    expect(mockRegistrar).toHaveBeenCalledOnce();
    expect(result.current.ciudadanos).toHaveLength(1);
  });

  it("rechaza un CI duplicado informado por la API", async () => {
    mockRegistrar.mockRejectedValue(
      new Error("Ya existe un ciudadano registrado con ese CI")
    );

    const { result } = renderHook(() => useCiudadanos());

    let respuesta:
      | Awaited<ReturnType<typeof result.current.agregarCiudadano>>
      | undefined;

    await act(async () => {
      respuesta = await result.current.agregarCiudadano({
        nombre: "Juan Pérez",
        ci: "12345678",
        whatsapp: "71234567",
      });
    });

    expect(respuesta?.ok).toBe(false);

    if (respuesta && !respuesta.ok) {
      expect(respuesta.error).toContain("Ya existe");
    }

    expect(result.current.ciudadanos).toHaveLength(0);
  });

  it("rechaza un CI inválido sin llamar al backend", async () => {
    const { result } = renderHook(() => useCiudadanos());

    let respuesta:
      | Awaited<ReturnType<typeof result.current.agregarCiudadano>>
      | undefined;

    await act(async () => {
      respuesta = await result.current.agregarCiudadano({
        nombre: "Juan Pérez",
        ci: "123",
        whatsapp: "71234567",
      });
    });

    expect(respuesta?.ok).toBe(false);
    expect(mockRegistrar).not.toHaveBeenCalled();
  });
});
