import type { Ciudadano } from "@/features/ciudadanos/types/ciudadano";
import { STORAGE_KEY } from "./constants";

const EMPTY: Ciudadano[] = [];

function isCiudadano(value: unknown): value is Ciudadano {
  if (typeof value !== "object" || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.nombre === "string" &&
    typeof c.ci === "string" &&
    typeof c.whatsapp === "string" &&
    (c.createdAt === undefined || typeof c.createdAt === "string")
  );
}

function parse(raw: string | null): Ciudadano[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    const validos = parsed.filter(isCiudadano);
    return validos.length > 0 ? validos : EMPTY;
  } catch {
    return EMPTY;
  }
}

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

let listeners: Array<() => void> = [];
let cachedRaw: string | null = null;
let cachedValue: Ciudadano[] = EMPTY;

export function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  window.addEventListener("storage", listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
    window.removeEventListener("storage", listener);
  };
}

export function getSnapshot(): Ciudadano[] {
  const raw = readRaw();
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = parse(raw);
  return cachedValue;
}

export function getServerSnapshot(): Ciudadano[] {
  return EMPTY;
}

export function readCiudadanos(): Ciudadano[] {
  return getSnapshot();
}

export function writeCiudadanos(ciudadanos: Ciudadano[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ciudadanos));
  listeners.forEach((listener) => listener());
}
