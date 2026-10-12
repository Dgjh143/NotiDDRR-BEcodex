# Plan Maestro — Módulo `/ciudadanos`

> Documento definitivo que unifica los tres análisis de `INDICACIONES/`
> (`Analisis-Frontend-Ciudadanos.md`, `analisis_frontend_ciudadanos.md`,
> `gemini-code-1791811908827.txt`), elimina redundancias y sobre-ingeniería,
> incorpora criterio senior y entrega una hoja de ruta lista para implementar.
>
> Alcance: frontend Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4.
> **Sin backend.** Persistencia 100% cliente (`localStorage`).

---

## 1. Objetivo del módulo

Permitir registrar y listar ciudadanos (nombre, CI, WhatsApp) para asociarlos a
un trámite, con validación robusta, accesibilidad y una UI mantenible. El módulo
debe funcionar igual con o sin masa de datos y ser fácil de extender (buscar,
eliminar, editar) sin reescribirlo.

---

## 2. Análisis comparativo de los tres documentos

| Tema | Doc 1 (`Analisis-Frontend-Ciudadanos`) | Doc 2 (`analisis_frontend_ciudadanos`) | Doc 3 (`gemini-code`) |
|---|---|---|---|
| Nivel de detalle | Muy alto, con código extenso | Alto, riguroso y cauto | Bajo, resumido |
| Estructura propuesta | `src/features/ciudadanos/*` | `src/{components,hooks,lib,types}` | Deja la decisión a criterio |
| Estado tipado | Sí (union) | Sí (union, mejor modelado) | Parcial |
| Extraer validadores | Sí | Sí | Sí |
| React Hook Form | No lo usa | No lo usa | **Lo propone** |
| Memoización | La propone desde P1 | **Avisa: no premature** | No lo trata |
| Paginación | P2 | **Solo si se necesita** | No lo trata |
| Buscador | P2 | P2 (diferido) | No lo trata |
| A11y | Básica | Detallada (`aria-*`, foco) | Mencionada |
| Persistencia aislada | Dentro del hook | Sugiere separar capa `storage` | Dentro del hook |
| Criterios de aceptación | Débiles | **Explícitos** | Débiles |

### Contradicciones detectadas y resolución

1. **Estructura de carpetas** → Se adopta `src/features/ciudadanos/*` (Doc 1),
   porque escala por dominio y ya está en uso en el repo. La propuesta del Doc 2
   se cumple igual dentro de `features/ciudadanos/`.
2. **React Hook Form** → **Se descarta.** Un formulario de 3 campos controlados
   no justifica una dependencia. Mantener estado nativo reduce peso y evita
   migrar validación propia a `zod`/resolvers.
3. **Memoización prematura** → **Se pospone** (posición del Doc 2). Se mide antes
   de optimizar; con `useMemo`/`useDeferredValue` solo donde aporte.
4. **Paginación** → **Se descarta por ahora.** Con datos en `localStorage` y
   volúmenes de demo, la paginación es ruido. Se reevalúa si supera ~100 filas.

---

## 3. Qué se conserva y qué se descarta

### Se conserva (del consenso de los 3 docs)
- Extracción de **validadores puros** reutilizables.
- **Hook de dominio** `useCiudadanos` como única fuente de datos.
- **Separación de componentes** (form, campo, tabla).
- **Estado tipado** (`loading | ready | error`) en vez de booleanos sueltos.
- **Accesibilidad** (`label`/`htmlFor`, `aria-invalid`, `role="alert"`).
- **Un solo origen de estado del formulario** (nada de duplicar el hook).

### Se descarta (sobre-ingeniería)
- React Hook Form / Zod (Doc 3).
- Paginación temprana (Doc 1 P2 → diferida).
- `React.memo`/`useMemo`/`useCallback` indiscriminados.
- Context/Redux: con un solo consumidor, el prop drilling de 1 nivel es correcto.

### Aportes senior (nuevos respecto a los 3 docs)
1. **Checklist anti-bug de inputs controlados**: todo `<input>` debe llevar
   `name` que coincida con la clave del estado. *(Este fue el bug real que dejó
   la UI sin poder escribir.)*
2. **Una sola instancia del hook**: `useCiudadanos` se llama en `page.tsx` y se
   pasa `agregarCiudadano` por prop al form. Sin doble fuente de verdad.
3. **Capa `storage` aislada** (`lib/storage.ts`) que valida la *forma* de los
   datos al leer (no confiar en `parsed as Ciudadano[]`).
4. **Validación compartida**: el form debe consumir `validators.ts` en vez de
   reimplementar regex inline (hoy están duplicadas).
5. **Región de estado única** con `aria-live` en un solo nodo, no en cada input.
6. **`useDeferredValue`** (React 19) para el buscador futuro, en lugar de un
   debounce casero con `setTimeout`.
7. **`inputMode="numeric"`**, `autoComplete`, `maxLength` en CI/WhatsApp.
8. **Foco al primer campo inválido** tras un submit fallido.
9. **Tailwind v4 con tokens** (`@theme`) para colores de marca en vez de
   valores arbitrarios repetidos.
10. **Pruebas unitarias de validadores** (funciones puras) = mayor ROI de test.

---

## 4. Estado real actual del código (base ya construida)

| Archivo | Estado |
|---|---|
| `src/features/ciudadanos/types/ciudadano.ts` | ✅ Creado |
| `src/features/ciudadanos/lib/validators.ts` | ✅ Creado (pero **no consumido por el form**) |
| `src/features/ciudadanos/hooks/useCiudadanos.ts` | ✅ Creado (lee/escribe, deduplica CI) |
| `src/features/ciudadanos/components/FormField.tsx` | ✅ Creado (`name={id}`, `aria-*`) |
| `src/features/ciudadanos/components/CiudadanoForm.tsx` | ✅ Creado (valida **inline**, duplica regex) |
| `src/app/ciudadanos/page.tsx` | ⚠️ Tabla aún **inline** (no extraída) |
| `npx tsc --noEmit` | ✅ Sin errores |

### Hallazgos a corregir (deuda detectada)
- **D1 — Validación duplicada**: `CiudadanoForm` reimplementa `^\d{7,8}$` y
  `^[67]\d{7}$` en lugar de importar `validateForm` de `validators.ts`.
  Deben converger en un único lugar.
- **D2 — `aria-live` en el input** (`FormField.tsx:50`): genera ruido para el
  lector de pantalla. El `aria-live` va en la región de mensajes, no en el input.
- **D3 — `reload()` redundante en éxito**: `agregarCiudadano` ya actualiza el
  estado; llamar `onSuccess={() => reload()}` re-lee storage y vuelve a fijar
  estado. Inofensivo pero innecesario.
- **D4 — Botón "✓ Guardado"**: es un estado de éxito mal representado como
  botón. Debe ser un mensaje de estado, no un control.
- **D5 — `readCiudadanosFromStorage`** confía en `parsed as Ciudadano[]` sin
  validar cada elemento.
- **D6 — Estado `loading` casi invisible**: `localStorage` es sincrónico; el
  `setStatus("loading")` y su resolución ocurren en el mismo tick. Aceptable,
  pero conviene conservarlo por consistencia con el render.

---

## 5. Arquitectura objetivo

```
src/
├─ app/
│  └─ ciudadanos/
│     └─ page.tsx                    # Orquestador (datos + composición). Sin lógica de negocio.
└─ features/
   └─ ciudadanos/
      ├─ types/
      │   └─ ciudadano.ts            # Ciudadano, CiudadanoFormData, LoadStatus
      ├─ lib/
      │   ├─ constants.ts            # STORAGE_KEY, REGEX_*, límites (maxLength)
      │   ├─ validators.ts           # Funciones puras (única fuente de validación)
      │   └─ storage.ts              # read/write + validación de forma (D5)
      ├─ hooks/
      │   ├─ useCiudadanos.ts        # Colección + status + agregar/eliminar
      │   └─ useCiudadanoForm.ts     # Estado del form + errores + submit (P2)
      └─ components/
          ├─ CiudadanoForm.tsx       # Formulario (consume validators)
          ├─ FormField.tsx           # Campo base accesible
          ├─ CiudadanosTable.tsx     # Tabla (extraída de page.tsx)
          ├─ CiudadanoRow.tsx        # Fila (P2)
          ├─ CiudadanosEmptyState.tsx# Estado vacío
          ├─ CiudadanosSkeleton.tsx  # Carga (P1)
          └─ StatusMessage.tsx       # Mensaje de estado unificado (aria-live)
```

### Responsabilidades por capa
- **`app/ciudadanos/page.tsx`**: llama al hook, decide loading/error/ready,
  compone secciones. Cero validación, cero acceso a `localStorage`.
- **`features/…/hooks`**: lógica de datos y de formulario. Testeable sin UI.
- **`features/…/lib`**: utilidades puras (validación, storage, constantes).
- **`features/…/components`**: presentación + interacción local.

### Flujo de datos (unidireccional)
```
page.tsx
  └─ useCiudadanos()  ── ciudadanos, status, loadError, agregarCiudadano
        │
        ├─ <CiudadanoForm>   → recibe agregarCiudadano (prop) → devuelve resultado
        └─ <CiudadanosTable> → recibe ciudadanos (prop)
```
Regla de oro: **el hook vive solo en `page.tsx`**. Ningún componente hijo lo
vuelve a invocar.

---

## 6. Diseño de estado

### Estado global del módulo (hook `useCiudadanos`)
```ts
type LoadStatus = "loading" | "ready" | "error";

type UseCiudadanosResult = {
  ciudadanos: Ciudadano[];
  status: LoadStatus;          // ciclo de vida de la carga
  loadError: string | null;    // solo si status === "error"
  reload: () => void;
  agregarCiudadano: (datos: CiudadanoFormData) => AgregarResult;
  // Futuro: eliminarCiudadano, buscar (derivado, no almacenado)
};

type AgregarResult =
  | { ok: true; ciudadano: Ciudadano }
  | { ok: false; error: string };
```

### Estado local del formulario (dentro de `CiudadanoForm` o `useCiudadanoForm`)
```ts
type FormStatus =
  | { type: "idle" }
  | { type: "submitting" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

// values, errors: Record<CampoForm, string>, touched: Record<CampoForm, boolean>
```

### Reglas de estado
- `loading|ready|error` **no** se representan con tres booleanos.
- El **buscador** (P2) no se guarda en el hook: se deriva con `useMemo`/filtro
  sobre `ciudadanos` + un `query` local en la barra.
- El **estado del form** no vive en el hook de datos.
- Un solo `aria-live` en la UI (`StatusMessage`), no en cada input.

---

## 7. Checklist senior obligatorio

- [ ] Todo input controlado tiene `name` = clave del estado. *(evita el bug raíz)*
- [ ] El hook de datos se instancia una sola vez (en `page.tsx`).
- [ ] La validación vive **solo** en `lib/validators.ts`.
- [ ] `localStorage` se accede **solo** en `lib/storage.ts`, guardado por
      `typeof window === "undefined"`.
- [ ] Al leer storage se valida la forma de cada elemento (no `as`).
- [ ] Errores con `role="alert"`; mensajes de estado con `aria-live="polite"`.
- [ ] `label htmlFor` ↔ `input id` siempre emparejados.
- [ ] Tras submit inválido, foco al primer campo con error.
- [ ] CI/WhatsApp con `inputMode="numeric"`, `maxLength` y `autoComplete`.
- [ ] Sin `any`. Sin comentarios obvios. Sin lógica de negocio en la página.
- [ ] `npx tsc --noEmit` y `npm run lint` en verde antes de cerrar cada fase.

---

## 8. Plan de acción por prioridad

### P0 — Núcleo y correctitud ✅ (mayormente hecho)
1. ✅ `types/ciudadano.ts`.
2. ✅ `lib/validators.ts`.
3. ✅ `hooks/useCiudadanos.ts`.
4. ✅ `FormField.tsx` con `name` y `aria-*`.
5. ✅ `CiudadanoForm.tsx` (aún con validación inline → ver P1).
6. ✅ `page.tsx` como orquestador.
7. ⏳ **Verificar en el navegador** que ya se puede escribir en los inputs.

### P1 — Corrección de deuda y extracción (siguiente)
1. **D1**: que `CiudadanoForm` importe y use `validateForm` de `validators.ts`;
   borrar regex inline duplicadas.
2. **D5**: mover lectura/escritura a `lib/storage.ts` con validación de forma.
3. **D2/D3/D4**: corregir `aria-live`, quitar `reload()` redundante y convertir
   el "✓ Guardado" en mensaje de estado (no botón).
4. Extraer `CiudadanosTable.tsx` y `CiudadanosEmptyState.tsx` desde `page.tsx`.
5. Añadir `CiudadanosSkeleton.tsx` para el estado de carga.
6. `constants.ts` con `STORAGE_KEY` y `maxLength`.

### P2 — UX y accesibilidad
1. `StatusMessage.tsx` con `aria-live` único; unificar feedback éxito/error.
2. Foco al primer campo inválido tras submit fallido.
3. Validar en `onBlur` + primer submit (no en cada tecla).
4. `inputMode`, `autoComplete`, `maxLength` en CI y WhatsApp.
5. Buscador por nombre/CI con `useDeferredValue` (React 19), filtrado derivado.
6. `useCiudadanoForm.ts` si el form crece (extraer lógica a test unitario).

### P3 — Pulido visual
1. Componentes base UI (`Button`, `Input`, `Badge`) con `cva` (si se repiten).
2. Tokens de marca en Tailwind v4 vía `@theme` (evitar valores arbitrarios).
3. Contraste AA (revisar `text-red-600` sobre fondo claro), estados hover/focus.
4. Micro-interacciones y transiciones sutiles.

### P4 — Calidad y verificación
1. **Tests unitarios de `validators.ts`** (puro, alto ROI).
2. Test de `useCiudadanos` (agregar, deduplicar CI, persistir) con storage mock.
3. `npm run lint` sin warnings; `npx tsc --noEmit` limpio.
4. QA manual: alta válida, alta inválida, duplicado, lista vacía, recarga de
   página (persistencia).

---

## 9. Criterios de aceptación

- [ ] Se puede **escribir** libremente en los tres campos (bug raíz resuelto).
- [ ] CI inválido, WhatsApp inválido o nombre vacío muestran error por campo.
- [ ] CI duplicado se rechaza con mensaje claro, sin duplicar la fila.
- [ ] Al guardar con éxito el form se limpia y la fila aparece en la tabla.
- [ ] Al recargar la página los ciudadanos persisten (`localStorage`).
- [ ] Estado vacío, de carga y de error son visualmente distintos y claros.
- [ ] Navegable por teclado; errores anunciados por lector de pantalla.
- [ ] `tsc --noEmit` y `lint` en verde.
- [ ] `page.tsx` sin lógica de negocio (solo composición).

---

## 10. Anti-patrones a evitar

- Duplicar el hook de datos en varios componentes (doble fuente de verdad).
- Reimplementar validaciones fuera de `validators.ts`.
- Meter `loading/ready/error` en tres booleanos.
- Optimizar con `memo/useMemo` sin medir.
- Añadir una librería de formularios para 3 campos.
- Acceder a `localStorage` desde componentes o desde la página.
- Usar `as` para confiar en datos persistidos sin validarlos.
