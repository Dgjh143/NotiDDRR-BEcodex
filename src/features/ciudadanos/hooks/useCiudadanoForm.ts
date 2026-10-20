
"use client";

import { useCallback, useState } from "react";
import type { CiudadanoFormData } from "@/features/ciudadanos/types/ciudadano";
import type { AgregarResult } from "./useCiudadanos";

import {
  validateField,
  validateForm,
  type FormErrors,
} from "@/features/ciudadanos/lib/validators";

export type FormStatus =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const EMPTY_FORM: CiudadanoFormData = {
  nombre: "",
  ci: "",
  whatsapp: "",
};

const FIELD_ORDER: Array<keyof CiudadanoFormData> = [
  "nombre",
  "ci",
  "whatsapp",
];

export function useCiudadanoForm(
  agregarCiudadano: (
    datos: CiudadanoFormData
  ) => Promise<AgregarResult>,
  onInvalid?: (field: keyof CiudadanoFormData) => void
) {
  const [form, setForm] = useState<CiudadanoFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>({
    type: "idle",
  });
  const [guardando, setGuardando] = useState(false);

  const clearFieldError = useCallback(
    (field: keyof CiudadanoFormData) => {
      setErrors((prev) => {
        if (!prev[field]) return prev;

        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const field = e.target.name as keyof CiudadanoFormData;

      setForm((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      clearFieldError(field);
      setStatus({ type: "idle" });
    },
    [clearFieldError]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const field = e.target.name as keyof CiudadanoFormData;
      const fieldError = validateField(field, e.target.value);

      if (!fieldError) {
        clearFieldError(field);
        return;
      }

      setErrors((prev) => ({
        ...prev,
        [field]: fieldError,
      }));
    },
    [clearFieldError]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (guardando) return;

      const { errors: valErrors, isValid } = validateForm(
        form.nombre,
        form.ci,
        form.whatsapp
      );

      if (!isValid) {
        setErrors(valErrors);
        setStatus({
          type: "error",
          message: "Corrige los campos marcados.",
        });

        const first = FIELD_ORDER.find(
          (field) => valErrors[field]
        );

        if (first && onInvalid) {
          onInvalid(first);
        }

        return;
      }

      setGuardando(true);
      setStatus({ type: "idle" });

      try {
        const result = await agregarCiudadano(form);

        if (!result.ok) {
          setStatus({
            type: "error",
            message: result.error,
          });

          return;
        }

        setForm(EMPTY_FORM);
        setErrors({});
        setStatus({
          type: "success",
          message: "Ciudadano registrado correctamente en PostgreSQL.",
        });
      } catch {
        setStatus({
          type: "error",
          message: "No se pudo conectar con el servidor.",
        });
      } finally {
        setGuardando(false);
      }
    },
    [form, guardando, agregarCiudadano, onInvalid]
  );

  return {
    form,
    errors,
    status,
    guardando,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
