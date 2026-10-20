
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api";

export interface CiudadanoAPI {
  id: number;
  nombres: string;
  apellidos: string;
  ci: string;
  whatsapp: string;
  aceptaNotificaciones: boolean;
  creadoEn: string;
}

export interface CrearCiudadanoAPI {
  nombres: string;
  apellidos: string;
  ci: string;
  whatsapp: string;
  aceptaNotificaciones: boolean;
}

async function verificarRespuesta(response: Response) {
  if (!response.ok) {
    const error = await response.json().catch(() => null);

    throw new Error(
      typeof error?.message === "string"
        ? error.message
        : `Error HTTP ${response.status}`,
    );
  }

  return response.json();
}

export async function obtenerCiudadanos(): Promise<CiudadanoAPI[]> {
  const response = await fetch(`${API_URL}/ciudadanos`, {
    cache: "no-store",
  });

  return verificarRespuesta(response);
}

export async function registrarCiudadano(
  datos: CrearCiudadanoAPI,
): Promise<CiudadanoAPI> {
  const response = await fetch(`${API_URL}/ciudadanos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos),
  });

  return verificarRespuesta(response);
}
