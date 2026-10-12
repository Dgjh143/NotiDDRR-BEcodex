import type { CiudadanoFormData } from "@/features/ciudadanos/types/ciudadano";
import { REGEX_CI, REGEX_WHATSAPP } from "./constants";

export const validateCI = (ci: string): string | null => {
  if (!ci.trim()) return "El CI es requerido.";
  if (!REGEX_CI.test(ci.trim())) return "El CI debe tener 7 u 8 dígitos.";
  return null;
};

export const validateWhatsApp = (wsp: string): string | null => {
  if (!wsp.trim()) return "WhatsApp es requerido.";
  if (!REGEX_WHATSAPP.test(wsp.trim()))
    return "Celular boliviano válido (empieza en 6 o 7).";
  return null;
};

export const validateNombre = (nombre: string): string | null => {
  if (!nombre.trim()) return "Ingrese el nombre completo.";
  return null;
};

export type FormErrors = Partial<
  Record<"nombre" | "ci" | "whatsapp", string>
>;

export const validatorsByField: Record<
  keyof CiudadanoFormData,
  (value: string) => string | null
> = {
  nombre: validateNombre,
  ci: validateCI,
  whatsapp: validateWhatsApp,
};

export const validateField = (
  field: keyof CiudadanoFormData,
  value: string
): string | null => validatorsByField[field](value);

export const validateForm = (
  nombre: string,
  ci: string,
  whatsapp: string
): { errors: FormErrors; isValid: boolean } => {
  const errors: FormErrors = {};
  const nombreErr = validateNombre(nombre);
  if (nombreErr) errors.nombre = nombreErr;
  const ciErr = validateCI(ci);
  if (ciErr) errors.ci = ciErr;
  const wspErr = validateWhatsApp(whatsapp);
  if (wspErr) errors.whatsapp = wspErr;
  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
