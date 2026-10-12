export const STORAGE_KEY = "notiddrr_ciudadanos";

export const REGEX_CI = /^\d{7,8}$/;
export const REGEX_WHATSAPP = /^[67]\d{7}$/;
export const REGEX_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑñ\s]+$/;

export const LIMITS = {
  nombre: 80,
  ci: 8,
  whatsapp: 8,
} as const;
