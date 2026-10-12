# Análisis Frontend Senior — Módulo `/ciudadanos` | NotiDDRR-BEcodex

**Stack:** Next.js 16.4.0 App Router + React 19.3.0 + TypeScript + Tailwind CSS v4
**Ruta objetivo:** `http://localhost:3000/ciudadanos`
**Archivo analizado:** `src/app/ciudadanos/page.tsx` (212 líneas)
**Enfoque:** 100% Frontend (UI, componentes, hooks, estilos)

---

## 1. Diagnóstico del Frontend Actual

### Estructura actual
Todo el módulo vive en un único **Client Component** (`"use client"`) en `src/app/ciudadanos/page.tsx`. No hay separación por componentes ni hooks.

Layout visual en grid responsive:
- **Izquierda (col-span-1 lg):** Formulario "Nuevo Ciudadano" con 3 inputs controlados (nombre, ci, whatsapp) + botón `bg-blue-900` + área de mensaje `text-sm text-blue-800`
- **Derecha (col-span-2 lg):** Tabla "Ciudadanos Registrados" con header `Nombre | CI | WhatsApp`, count dinámico `ciudadanos.length`, estado vacío y tabla con `border-gray-200`

### Gestión de estado actual
6 `useState` planos en el mismo componente:
```ts
const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([])
const [nombre, setNombre] = useState("")
const [ci, setCi] = useState("")
const [whatsapp, setWhatsapp] = useState("")
const [mensaje, setMensaje] = useState("")
const [listo, setListo] = useState(false)
```
- `type Ciudadano` definido inline con `id: crypto.randomUUID()`
- `useEffect([router])` que hace doble trabajo: guard de auth con `sessionStorage.getItem("notiddrr_demo")` + `router.replace("/")` y carga inicial de `localStorage.getItem("notiddrr_ciudadanos")`
- Función `registrar(e: FormEvent)` que valida secuencialmente, verifica duplicados con `.some()`, escribe en localStorage y limpia inputs.
- Bandera `listo`: `false` → "Cargando ciudadanos..." / `true` → render real.

### Deuda técnica frontend detectada
1. **God Component:** 212 líneas con UI + validación + persistencia + guard.
2. **Validaciones inline:** regex `/^\d{7,8}$/` y `/^[67]\d{7}$/` hardcodeadas en el handler.
3. **Re-renders innecesarios:** cada keystroke en los inputs re-renderiza formulario + tabla.
4. **Sin separación de responsabilidades:** no hay `components/`, `hooks/`, `types/` ni `lib/`.
5. **Feedback visual pobre:** un solo string `mensaje` para éxito y error, sin `role="alert"`, sin `aria-describedby`.
6. **Sin paginación/filtro/búsqueda:** con 50+ registros la tabla colapsa.
7. **Loading minimalista:** texto plano, sin skeleton.

---

## 2. Propuestas de Mejora UI/UX y Código

### A) Modularización — Separación de responsabilidades

**Estructura de carpetas propuesta (solo frontend):**
```
src/
├── app/ciudadanos/page.tsx        -> Orquestador delgado (Server Wrapper + Client)
├── features/ciudadanos/
│   ├── components/
│   │   ├── CiudadanoForm.tsx      -> Solo formulario + validación UI
│   │   ├── CiudadanosTable.tsx    -> Tabla + empty state + count
│   │   ├── CiudadanoRow.tsx       -> Fila memoizada
│   │   ├── SearchBar.tsx          -> Filtro client-side
│   │   └── FormField.tsx          -> Input + Label + Error reutilizable
│   ├── hooks/
│   │   ├── useCiudadanos.ts       -> Lógica localStorage + CRUD
│   │   ├── useCiudadanoForm.ts    -> Estado del form + validaciones
│   │   └── useDebouncedSearch.ts  -> Búsqueda con debounce
│   ├── types/
│   │   └── ciudadano.ts           -> type Ciudadano + CiudadanoFormData
│   └── lib/
│       ├── validators.ts          -> validateCI, validateWhatsApp, validateNombre
│       └── constants.ts           -> REGEX_CI, REGEX_WHATSAPP, STORAGE_KEY
└── components/ui/
    ├── Button.tsx, Input.tsx, Badge.tsx, Skeleton.tsx
```

**Principio:** `page.tsx` no debe saber de `localStorage` ni de regex. Solo compone.

### B) Optimización de Renderizado y Gestión de Estado

**1. Extraer hook `useCiudadanos`:**
- Centraliza `localStorage`, parseo seguro con try/catch, `isLoading`, `error`.
- Expone `ciudadanos`, `addCiudadano`, `removeCiudadano` memoizados con `useCallback`.
- Evita leer `localStorage` en cada render.

**2. Memoización:**
- `CiudadanosTable` envuelto en `React.memo`
- Filtrado y count con `useMemo(() => ciudadanos.filter(...), [ciudadanos, query])`
- Handlers del form con `useCallback` para que `FormField` no re-renderice.

**3. Paginación y Filtrado client-side:**
- El informe dice que no hay paginación. Implementar:
  - `SearchBar` con debounce 300ms (evita filtrar en cada tecla)
  - Paginación: 10 items por página, con `useMemo` para slice.
  - Ordenamiento por nombre/CI.

**4. Manejo de carga, error y vacío:**
- `listo=false` → `<CiudadanosSkeleton />` (3 filas con `animate-pulse` Tailwind)
- `error` de parseo → `<Alert variant="error" role="alert">No se pudieron cargar los datos</Alert>`
- Vacío → ilustración + CTA, no solo texto.

**5. Formularios controlados optimizados:**
- Un solo `useState<FormData>` en lugar de 3 states separados.
- Validación en `onBlur` + `onSubmit`, no en cada `onChange` para reducir re-renders.

### C) Experiencia de Usuario, Accesibilidad y Diseño Responsivo

**Accesibilidad (a11y):**
- Todos los `Input` con `id`, `label htmlFor`, `aria-describedby="ci-error"` y `aria-invalid`
- Mensajes de error con `role="alert"` y `aria-live="polite"` para el mensaje de éxito.
- Botón con `aria-busy` cuando `isSubmitting`
- Contraste: `bg-blue-900` sobre blanco está bien, pero el `text-blue-800` para feedback falla contraste → usar `bg-blue-50 border-blue-200` + icono.

**Feedback visual:**
- Success: toast verde con check + animación `animate-in slide-in`
- Error de campo: borde `border-red-500` + mensaje rojo debajo, shake sutil con Tailwind.
- Duplicado CI: marcar input CI directamente, no solo mensaje genérico.
- Focus states visibles: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`

**Responsive:**
- Actual: `col-span-1` / `col-span-2` en lg. Bien, pero en mobile el form queda arriba sin sticky.
- Mejora: En `xl` → sidebar sticky form (`sticky top-6`), tabla scroll horizontal con `overflow-x-auto` y `min-w-[640px]`.
- Inputs: `text-base` en mobile evita zoom de iOS, `h-11` para touch target 44px.

**Micro-interacciones Tailwind v4:**
- Botón: `transition-all hover:bg-blue-800 active:scale-[0.98] disabled:opacity-50`
- Filas: `hover:bg-gray-50 transition-colors`
- Empty state: icono + texto + botón fantasma.

---

## 3. Refactorización — Componente Crítico

**Componente crítico:** `src/app/ciudadanos/page.tsx` completo. Es un God Component que mezcla 4 responsabilidades.

### Antes (problema):
```tsx
// page.tsx - 212 líneas, todo inline
"use client"
export default function CiudadanosPage() {
  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([])
  const [nombre, setNombre] = useState("")
  const [ci, setCi] = useState("")
  // ... 3 states más + useEffect con router + localStorage + validaciones regex inline
  const registrar = (e) => {
    if(!/^\d{7,8}$/.test(ci)) { setMensaje("CI inválido") }
    // ...
  }
  return (
    <div className="grid lg:grid-cols-3">
      <form>...</form> {/* 80 líneas */}
      <table>...</table> {/* 90 líneas */}
    </div>
  )
}
```

### Después (propuesta limpia y mantenible):

**`features/ciudadanos/lib/validators.ts`**
```ts
export const REGEX_CI = /^\d{7,8}$/;
export const REGEX_WHATSAPP = /^[67]\d{7}$/;
export const STORAGE_KEY = "notiddrr_ciudadanos";

export const validateCI = (ci: string) => {
  if (!ci.trim()) return "El CI es requerido.";
  if (!REGEX_CI.test(ci.trim())) return "El CI debe tener 7 u 8 dígitos.";
  return null;
};
export const validateWhatsApp = (wsp: string) => {
  if (!wsp.trim()) return "WhatsApp es requerido.";
  if (!REGEX_WHATSAPP.test(wsp.trim())) return "Celular boliviano válido (empieza en 6 o 7).";
  return null;
};
```

**`features/ciudadanos/types/ciudadano.ts`**
```ts
export type Ciudadano = {
  id: string;
  nombre: string;
  ci: string;
  whatsapp: string;
  createdAt: string;
};
export type CiudadanoFormData = Omit<Ciudadano, "id" | "createdAt">;
```

**`features/ciudadanos/hooks/useCiudadanos.ts`**
```ts
"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { STORAGE_KEY } from "../lib/constants";
import type { Ciudadano, CiudadanoFormData } from "../types/ciudadano";

export function useCiudadanos() {
  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setCiudadanos(raw ? JSON.parse(raw) : []);
    } catch {
      setError("No se pudo leer el almacenamiento local.");
      setCiudadanos([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persist = useCallback((next: Ciudadano[]) => {
    setCiudadanos(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addCiudadano = useCallback((data: CiudadanoFormData) => {
    if (ciudadanos.some(c => c.ci === data.ci.trim())) {
      return { ok: false, error: "Ya existe un ciudadano con ese CI." } as const;
    }
    const nuevo: Ciudadano = {
      id: crypto.randomUUID(),
      ...data,
      nombre: data.nombre.trim(),
      ci: data.ci.trim(),
      whatsapp: data.whatsapp.trim(),
      createdAt: new Date().toISOString(),
    };
    persist([nuevo, ...ciudadanos]);
    return { ok: true } as const;
  }, [ciudadanos, persist]);

  return { ciudadanos, isLoading, error, addCiudadano };
}
```

**`features/ciudadanos/components/CiudadanoForm.tsx`**
```tsx
"use client";
import { useState, useCallback } from "react";
import { validateCI, validateWhatsApp } from "../lib/validators";
import { FormField } from "./FormField";

export function CiudadanoForm({ onSubmit }: { onSubmit: (d: any) => {ok:boolean, error?:string} }) {
  const [form, setForm] = useState({ nombre: "", ci: "", whatsapp: "" });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [status, setStatus] = useState<{type:"success"|"error", msg:string}|null>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const ciErr = validateCI(form.ci);
    const wspErr = validateWhatsApp(form.whatsapp);
    const nombreErr = !form.nombre.trim() ? "Nombre requerido." : null;

    const newErrors: any = {};
    if (nombreErr) newErrors.nombre = nombreErr;
    if (ciErr) newErrors.ci = ciErr;
    if (wspErr) newErrors.whatsapp = wspErr;

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      setStatus({ type: "error", msg: "Corrige los campos marcados." });
      return;
    }

    const res = onSubmit(form);
    if (!res.ok) {
      setErrors({ ci: res.error! });
      setStatus({ type: "error", msg: res.error! });
      return;
    }
    setForm({ nombre: "", ci: "", whatsapp: "" });
    setErrors({});
    setStatus({ type: "success", msg: "Ciudadano registrado correctamente." });
  }, [form, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 space-y-5 sticky top-6" noValidate>
      <h2 className="text-lg font-semibold text-gray-900">Nuevo Ciudadano</h2>
      
      <FormField label="Nombre completo" id="nombre" error={errors.nombre}>
        <input id="nombre" value={form.nombre} onChange={e=>setForm({...form, nombre:e.target.value})}
          className="w-full h-11 px-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          aria-describedby={errors.nombre ? "nombre-error" : undefined}
          aria-invalid={!!errors.nombre}
        />
      </FormField>

      {/* Repite para CI y WhatsApp con mismo patrón */}

      {status && (
        <div role="alert" aria-live="polite" 
          className={`text-sm p-3 rounded-lg ${status.type==="success" ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {status.msg}
        </div>
      )}

      <button type="submit" 
        className="w-full h-11 bg-blue-900 text-white rounded-lg font-medium hover:bg-blue-800 active:scale-[0.98] transition-all focus:ring-2 focus:ring-offset-2 focus:ring-blue-900 disabled:opacity-50">
        Guardar ciudadano
      </button>
    </form>
  );
}
```

**`app/ciudadanos/page.tsx` refactorizado (orquestador de 40 líneas):**
```tsx
"use client";
import { useCiudadanos } from "@/features/ciudadanos/hooks/useCiudadanos";
import { CiudadanoForm } from "@/features/ciudadanos/components/CiudadanoForm";
import { CiudadanosTable } from "@/features/ciudadanos/components/CiudadanosTable";
import { CiudadanosSkeleton } from "@/components/ui/Skeleton";

export default function CiudadanosPage() {
  const { ciudadanos, isLoading, error, addCiudadano } = useCiudadanos();

  if (isLoading) return <CiudadanosSkeleton />;
  if (error) return <div role="alert" className="p-6 bg-red-50 border border-red-200 rounded-xl">{error}</div>;

  return (
    <main className="max-w-7xl mx-auto p-4 lg:p-6 grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <CiudadanoForm onSubmit={addCiudadano} />
      </div>
      <div className="lg:col-span-2">
        <CiudadanosTable ciudadanos={ciudadanos} />
      </div>
    </main>
  );
}
```

Beneficio: -80% de líneas en page.tsx, testeable, memoizable, reutilizable y accesible.

---

## 4. Plan de Acción Frontend — Solo `/ciudadanos`

Ordenado por impacto/esfuerzo y dependencias.

### P0 — Crítico (Hoy)

- [ ] **1. Crear estructura base:** `features/ciudadanos/{types,lib,hooks,components}` y `components/ui`
- [ ] **2. Extraer constantes y validadores:** mover regex a `lib/constants.ts` y `lib/validators.ts` con funciones puras `validateCI()`, `validateWhatsApp()`, `validateNombre()`
- [ ] **3. Crear hook `useCiudadanos`:** encapsular todo el `localStorage` + `isLoading` + `error` + `addCiudadano` con `useCallback`. Eliminar lógica de storage de `page.tsx`
- [ ] **4. Componente `FormField` reutilizable:** Label + Input + Error + `aria-describedby` + `aria-invalid`. Base para accesibilidad.

### P1 — Alto (Mañana)

- [ ] **5. Refactorizar Formulario a `CiudadanoForm`:** usar single `formData` state, validación en `onBlur`, mensajes por campo, `role="alert"` y `aria-live`. Reset controlado.
- [ ] **6. Refactorizar Tabla a `CiudadanosTable` + `CiudadanoRow` con `React.memo`:** props tipadas, empty state con ilustración, count con badge Tailwind.
- [ ] **7. Estados de carga/error profesionales:** Skeleton con `animate-pulse` para `isLoading`, Alert component para error de parseo, no texto plano "Cargando..."
- [ ] **8. Accesibilidad completa:** `aria-describedby` en cada input, focus ring visible, contraste corregido, botón con `focus-visible`, navegación por teclado en tabla.

### P2 — Medio (Esta semana)

- [ ] **9. Búsqueda y filtrado client-side:** `SearchBar` + `useDebouncedSearch(300ms)` + `useMemo` para filtrar por nombre/CI. Resaltar coincidencias.
- [ ] **10. Paginación client-side:** 10 por página, componente `Pagination` con `useMemo` slice, URL sync opcional con `?page=` usando `useSearchParams`
- [ ] **11. Optimización de render:** `useCallback` en handlers, `React.memo` en Row, evitar re-render de tabla al escribir en form.
- [ ] **12. Feedback visual mejorado:** Toasts para éxito (sonner o custom), shake en error, icono en inputs válidos/inválidos, `disabled` + spinner en botón durante submit.

### P3 — Pulido (Antes de demo)

- [ ] **13. Responsive avanzado:** Form sticky en xl, tabla con `overflow-x-auto`, touch targets `h-11`, `text-base` para evitar zoom iOS.
- [ ] **14. Componentes UI base con Tailwind v4:** `Button`, `Input`, `Badge`, `Card` con variantes `cva` (class-variance-authority) para consistencia.
- [ ] **15. Micro-interacciones:** `transition-all`, `hover:bg-gray-50` en rows, `active:scale-[0.98]` en botón, `animate-in` en mensajes.
- [ ] **16. Limpieza final:** eliminar imports no usados, tipar todo `strict`, `eslint --fix`, test manual de flujo completo en `localhost:3000/ciudadanos`.

### Definición de terminado para `/ciudadanos`:
- `page.tsx` < 60 líneas, sin regex ni localStorage directo
- 100% componentes con props tipadas
- Lighthouse a11y > 95, sin errores de contraste
- Búsqueda + paginación funcionando sin lag hasta 500 registros mock
- Feedback visual claro para cada estado: loading, empty, error, success, duplicate

---
Generado como análisis frontend senior — ignora backend/DB/infra por requerimiento.
