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
