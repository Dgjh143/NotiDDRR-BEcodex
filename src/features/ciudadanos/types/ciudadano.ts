
export type Ciudadano = {
  id: string;
  nombre: string;
  ci: string;
  whatsapp: string;
  createdAt?: string;
};

export type CiudadanoFormData = {
  nombre: string;
  ci: string;
  whatsapp: string;
};

// Estructura recibida desde PostgreSQL mediante NestJS
export type CiudadanoAPI = {
  id: number;
  nombres: string;
  apellidos: string;
  ci: string;
  whatsapp: string;
  aceptaNotificaciones: boolean;
  creadoEn: string;
};

// Adapta los datos del backend al diseño actual del frontend
export function adaptarCiudadano(datos: CiudadanoAPI): Ciudadano {
  return {
    id: String(datos.id),
    nombre: `${datos.nombres} ${datos.apellidos}`.trim(),
    ci: datos.ci,
    whatsapp: datos.whatsapp,
    createdAt: datos.creadoEn,
  };
}
