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

const EMPTY_FORM: CiudadanoFormData = { nombre: "", ci: "", whatsapp: "" };
const FIELD_ORDER: Array<keyof CiudadanoFormData> = ["nombre", "ci", "whatsapp"];

export function useCiudadanoForm(
  agregarCiudadano: (datos: CiudadanoFormData) => AgregarResult,
  onInvalid?: (field: keyof CiudadanoFormData) => void
) {
  const [form, setForm] = useState<CiudadanoFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<FormStatus>({ type: "idle" });

  const clearFieldError = useCallback((field: keyof CiudadanoFormData) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const field = e.target.name as keyof CiudadanoFormData;
      const { value } = e.target;
      setForm((prev) => ({ ...prev, [field]: value }));
      clearFieldError(field);
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
      setErrors((prev) => ({ ...prev, [field]: fieldError }));
    },
    [clearFieldError]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const { errors: valErrors, isValid } = validateForm(
        form.nombre,
        form.ci,
        form.whatsapp
      );

      if (!isValid) {
        setErrors(valErrors);
        setStatus({ type: "error", message: "Corrige los campos marcados." });
        const first = FIELD_ORDER.find((field) => valErrors[field]);
        if (first && onInvalid) onInvalid(first);
        return;
      }

      const result = agregarCiudadano(form);

      if (!result.ok) {
        setErrors({ ci: result.error });
        setStatus({ type: "error", message: result.error });
        if (onInvalid) onInvalid("ci");
        return;
      }

      setForm(EMPTY_FORM);
      setErrors({});
      setStatus({
        type: "success",
        message: "Ciudadano registrado correctamente.",
      });
    },
    [form, agregarCiudadano, onInvalid]
  );

  return { form, errors, status, handleChange, handleBlur, handleSubmit };
}
