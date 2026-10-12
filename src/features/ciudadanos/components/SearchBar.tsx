"use client";

import { Input } from "@/components/ui/Input";

export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mb-4">
      <label htmlFor="buscar-ciudadano" className="sr-only">
        Buscar ciudadano
      </label>
      <Input
        id="buscar-ciudadano"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar por nombre o CI…"
        autoComplete="off"
      />
    </div>
  );
}
