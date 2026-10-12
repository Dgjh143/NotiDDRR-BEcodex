"use client";

import { useCallback, useRef } from "react";
import { FormField } from "./FormField";
import { StatusMessage } from "./StatusMessage";
import { Button } from "@/components/ui/Button";
import { LIMITS } from "@/features/ciudadanos/lib/constants";
import type { CiudadanoFormData } from "@/features/ciudadanos/types/ciudadano";
import type { AgregarResult } from "@/features/ciudadanos/hooks/useCiudadanos";
import { useCiudadanoForm } from "@/features/ciudadanos/hooks/useCiudadanoForm";

export function CiudadanoForm({
  agregarCiudadano,
}: {
  agregarCiudadano: (datos: CiudadanoFormData) => AgregarResult;
}) {
  const nombreRef = useRef<HTMLInputElement>(null);
  const ciRef = useRef<HTMLInputElement>(null);
  const whatsappRef = useRef<HTMLInputElement>(null);

  const handleInvalid = useCallback((field: keyof CiudadanoFormData) => {
    const refs = {
      nombre: nombreRef,
      ci: ciRef,
      whatsapp: whatsappRef,
    };
    refs[field].current?.focus();
  }, []);

  const { form, errors, status, handleChange, handleBlur, handleSubmit } =
    useCiudadanoForm(agregarCiudadano, handleInvalid);

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <FormField
        ref={nombreRef}
        label="Nombre completo"
        id="nombre"
        placeholder="Ej. Juan Pérez"
        value={form.nombre}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.nombre}
        maxLength={LIMITS.nombre}
        autoComplete="name"
      />

      <FormField
        ref={ciRef}
        label="Cédula de identidad"
        id="ci"
        placeholder="Ej. 12345678"
        value={form.ci}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.ci}
        maxLength={LIMITS.ci}
        inputMode="numeric"
        autoComplete="off"
      />

      <FormField
        ref={whatsappRef}
        label="Número de WhatsApp"
        id="whatsapp"
        placeholder="Ej. 71234567"
        value={form.whatsapp}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.whatsapp}
        maxLength={LIMITS.whatsapp}
        inputMode="numeric"
        autoComplete="off"
      />

      <Button type="submit" className="w-full">
        Guardar ciudadano
      </Button>

      {status.type === "error" && (
        <StatusMessage tone="error" message={status.message} />
      )}

      {status.type === "success" && (
        <StatusMessage tone="success" message={status.message} />
      )}
    </form>
  );
}
