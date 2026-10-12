import { describe, expect, it } from "vitest";
import {
  validateCI,
  validateField,
  validateForm,
  validateNombre,
  validateWhatsApp,
} from "@/features/ciudadanos/lib/validators";

describe("validateCI", () => {
  it("acepta 7 u 8 dígitos", () => {
    expect(validateCI("1234567")).toBeNull();
    expect(validateCI("12345678")).toBeNull();
  });

  it("rechaza vacío", () => {
    expect(validateCI("")).toBe("El CI es requerido.");
    expect(validateCI("   ")).toBe("El CI es requerido.");
  });

  it("rechaza longitud o caracteres inválidos", () => {
    expect(validateCI("12345")).toBe("El CI debe tener 7 u 8 dígitos.");
    expect(validateCI("123456789")).toBe("El CI debe tener 7 u 8 dígitos.");
    expect(validateCI("abcdefg")).toBe("El CI debe tener 7 u 8 dígitos.");
  });
});

describe("validateWhatsApp", () => {
  it("acepta celular boliviano que empieza en 6 o 7", () => {
    expect(validateWhatsApp("71234567")).toBeNull();
    expect(validateWhatsApp("61234567")).toBeNull();
  });

  it("rechaza vacío", () => {
    expect(validateWhatsApp("")).toBe("WhatsApp es requerido.");
  });

  it("rechaza prefijo o longitud inválida", () => {
    expect(validateWhatsApp("51234567")).toBe(
      "Celular boliviano válido (empieza en 6 o 7)."
    );
    expect(validateWhatsApp("7123456")).toBe(
      "Celular boliviano válido (empieza en 6 o 7)."
    );
  });
});

describe("validateNombre", () => {
  it("acepta un nombre no vacío", () => {
    expect(validateNombre("Juan Pérez")).toBeNull();
  });

  it("rechaza vacío", () => {
    expect(validateNombre("   ")).toBe("Ingrese el nombre completo.");
  });
});

describe("validateForm", () => {
  it("devuelve válido sin errores", () => {
    const { errors, isValid } = validateForm(
      "Juan Pérez",
      "12345678",
      "71234567"
    );
    expect(isValid).toBe(true);
    expect(errors).toEqual({});
  });

  it("acumula el error de cada campo", () => {
    const { errors, isValid } = validateForm("", "123", "51234567");
    expect(isValid).toBe(false);
    expect(errors.nombre).toBeDefined();
    expect(errors.ci).toBeDefined();
    expect(errors.whatsapp).toBeDefined();
  });
});

describe("validateField", () => {
  it("delega al validador del campo indicado", () => {
    expect(validateField("ci", "12345678")).toBeNull();
    expect(validateField("ci", "12")).toBe("El CI debe tener 7 u 8 dígitos.");
    expect(validateField("whatsapp", "71234567")).toBeNull();
  });
});
