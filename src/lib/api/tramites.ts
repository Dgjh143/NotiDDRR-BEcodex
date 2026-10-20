
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3001/api";

export type EstadoTramite =
  | "RECIBIDO"
  | "EN_PROCESO"
  | "OBSERVADO"
  | "MESA_SALIDA"
  | "ENTREGADO";

export type CiudadanoAPI = {
  id: number;
  nombres: string;
  apellidos: string;
  ci: string;
  whatsapp: string;
  aceptaNotificaciones: boolean;
};

export type ServicioAPI = {
  id: number;
  nombre: string;
  activo: boolean;
};

export type TramiteAPI = {
  id: number;
  numeroDocumento: string;
  matricula: string;
  oficina: string;
  estado: EstadoTramite;
  creadoEn: string;
  ciudadano: CiudadanoAPI;
  registradoPor: {
    id: number;
    nombre: string;
  };
  servicios: {
    servicio: ServicioAPI;
  }[];
  historial: {
    id: number;
    estadoAnterior: EstadoTramite;
    estadoNuevo: EstadoTramite;
    observacion: string | null;
    fecha: string;
    funcionario: {
      nombre: string;
    };
  }[];
  notificaciones: {
    id: number;
    telefono: string;
    mensaje: string;
    estado: string;
  }[];
};

export type CrearTramite = {
  numeroDocumento: string;
  matricula: string;
  oficina: string;
  ciudadanoId: number;
  registradoPorId: number;
  serviciosIds: number[];
};

async function peticion<T>(
  ruta: string,
  opciones?: RequestInit
): Promise<T> {
  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...opciones,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...opciones?.headers,
    },
  });

  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => null);

    const mensaje = error?.message;
    throw new Error(
      Array.isArray(mensaje)
        ? mensaje.join(", ")
        : typeof mensaje === "string"
          ? mensaje
          : "Error de conexión con el servidor."
    );
  }

  return respuesta.json() as Promise<T>;
}

export function obtenerCiudadanosTramites() {
  return peticion<CiudadanoAPI[]>("/ciudadanos");
}

export function obtenerServicios() {
  return peticion<ServicioAPI[]>("/servicios");
}

export function obtenerTramites() {
  return peticion<TramiteAPI[]>("/tramites");
}

export function registrarTramite(datos: CrearTramite) {
  return peticion<TramiteAPI>("/tramites", {
    method: "POST",
    body: JSON.stringify(datos),
  });
}

export function actualizarEstado(
  id: number,
  estado: EstadoTramite,
  funcionarioId: number,
  observacion: string
) {
  return peticion<{
    mensaje: string;
  }>(`/tramites/${id}/estado`, {
    method: "PATCH",
    body: JSON.stringify({
      estado,
      funcionarioId,
      observacion,
    }),
  });
}
