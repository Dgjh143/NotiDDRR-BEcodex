# Reporte de cambios — Módulo `/ciudadanos`

**Proyecto:** NotiDDRR-BEcodex (Next.js 16.4 · React 19.3 · TypeScript · Tailwind v4)
**Rama:** `feature/ciudadanos`
**Fecha:** 12/10/2026
**Alcance:** refactor completo del frontend del módulo de ciudadanos. **Sin backend**:
todo se persiste en el navegador (`localStorage`).

---

## 1. Resumen ejecutivo

Se reescribió el módulo `/ciudadanos` pasando de un único componente de ~212 líneas con
toda la lógica mezclada (estado, validación, persistencia y UI) a una arquitectura por
capas dentro de `src/features/ciudadanos/`: **tipos, utilidades puras, hooks de dominio y
componentes de presentación**.

Resultados:

- **Un bug crítico resuelto**: no se podía escribir en los inputs (faltaba el atributo
  `name` en los campos controlados).
- **Validación unificada** en un solo lugar (antes duplicada en 3 sitios).
- **Persistencia aislada** y validada en forma (antes confiaba en `JSON.parse` sin checks).
- **Accesibilidad** mejorada (labels asociados, `aria-invalid`, `role="alert"`, foco al
  primer campo inválido, regiones de estado).
- **Buscador** por nombre/CI con `useDeferredValue`.
- **20 pruebas unitarias** nuevas (Vitest), todas en verde.
- **`tsc --noEmit` limpio**; **ESLint limpio en el módulo** (quedan 3 errores
  pre-existentes en otros módulos, ajenos a este trabajo).

---

## 2. Arquitectura final

```
src/
├─ lib/
│  └─ cn.ts                                   # helper de clases condicionales
├─ components/
│  └─ ui/
│     ├─ Input.tsx                            # input base (variante invalid)
│     └─ Button.tsx                           # botón base (variantes primary/danger)
├─ app/
│  └─ ciudadanos/
│     └─ page.tsx                             # orquestador (~72 líneas, solo composición)
└─ features/
   └─ ciudadanos/
      ├─ types/
      │  └─ ciudadano.ts                      # Ciudadano, CiudadanoFormData
      ├─ lib/
      │  ├─ constants.ts                      # STORAGE_KEY, regex, LIMITS
      │  ├─ validators.ts                     # validación pura (fuente única)
      │  ├─ validators.test.ts                # 13 tests
      │  ├─ storage.ts                        # lectura/escritura + store externo
      │  └─ storage.test.ts                   # 5 tests
      ├─ hooks/
      │  ├─ useCiudadanos.ts                  # colección + persistencia (store externo)
      │  ├─ useCiudadanoForm.ts               # estado y validación del formulario
      │  └─ useCiudadanos.test.tsx            # 4 tests
      └─ components/
         ├─ CiudadanoForm.tsx                 # presentacional (usa useCiudadanoForm)
         ├─ FormField.tsx                     # label + input + error
         ├─ CiudadanosTable.tsx               # tabla de resultados
         ├─ CiudadanosEmptyState.tsx          # estado vacío / sin resultados
         ├─ CiudadanosSkeleton.tsx            # estado de carga
         ├─ StatusMessage.tsx                 # mensaje de éxito/error accesible
         └─ SearchBar.tsx                     # buscador
```

**Flujo de datos (unidireccional):** `useCiudadanos()` vive **solo** en `page.tsx`;
`agregarCiudadano` y `ciudadanos` se pasan por props. Ningún hijo vuelve a instanciar el
hook (evita doble fuente de verdad).

---

## 3. Cambios por fase

### P0 — Extracción del núcleo y correctitud

| Archivo | Qué se hizo | Por qué |
|---|---|---|
| `types/ciudadano.ts` | Tipo `Ciudadano` (y luego `CiudadanoFormData`) | Tipado compartido entre capas |
| `lib/validators.ts` | Funciones puras `validateCI/WhatsApp/Nombre/Form` | Sacar reglas del componente |
| `hooks/useCiudadanos.ts` | Hook con la colección + persistencia | Única fuente de datos |
| `components/FormField.tsx` | Campo base `label`+`input`+error con ARIA | Reutilización y accesibilidad |
| `components/CiudadanoForm.tsx` | Formulario controlado | Separar formulario de página |
| `app/ciudadanos/page.tsx` | De ~212 → orquestador | Quitar lógica de la vista |

### P1 — Deuda técnica y extracción de componentes

| Archivo | Qué se hizo | Por qué |
|---|---|---|
| `lib/constants.ts` | Centraliza `STORAGE_KEY`, regex y `LIMITS` (longitudes) | Evitar literales dispersos |
| `lib/storage.ts` | `readCiudadanos`/`writeCiudadanos` + validación de forma | **D5**: no confiar en `as Ciudadano[]` |
| `lib/validators.ts` | Reexporta `FormErrors`, consume constantes | Una sola definición de reglas |
| `hooks/useCiudadanos.ts` | Reescrito con `useSyncExternalStore` | Elimina `setState` en efecto + sync entre pestañas |
| `components/FormField.tsx` | Quitado `aria-live` del input; `aria-invalid` derivado del error | **D2**: ruido para lectores de pantalla |
| `components/CiudadanoForm.tsx` | Usa `validateForm`; éxito/error como mensaje | **D1/D4**: sin regex duplicadas ni "botón ✓" |
| `components/CiudadanosTable.tsx` | Tabla extraída de la página | Composición |
| `components/CiudadanosEmptyState.tsx` | Estado vacío reutilizable | Composición |
| `components/CiudadanosSkeleton.tsx` | Esqueleto de carga accesible | Mejor UX en el primer render |
| `components/StatusMessage.tsx` | Mensaje accesible (`role`/`aria-live`) | Feedback unificado |
| `app/ciudadanos/page.tsx` | Compone los componentes, sin lógica | Vista delgada |

### P2 — UX y accesibilidad

| Archivo | Qué se hizo | Por qué |
|---|---|---|
| `lib/validators.ts` | `validatorsByField` + `validateField` | Validar por campo |
| `components/FormField.tsx` | Props `ref` y `onBlur` (ref-como-prop de React 19) | Validación al salir y foco |
| `hooks/useCiudadanoForm.ts` | **Nuevo**: estado, `handleChange`, `handleBlur`, `handleSubmit` | Sacar lógica del componente |
| `components/CiudadanoForm.tsx` | Usa el hook; **enfoca el primer campo inválido** | Mejor experiencia al enviar |
| `components/SearchBar.tsx` | **Nuevo**: buscador | Filtrar por nombre/CI |
| `components/CiudadanosEmptyState.tsx` | Acepta `message` | Reusar para "sin resultados" |
| `app/ciudadanos/page.tsx` | Filtrado con `useDeferredValue` + `useMemo`; contador filtrado | Búsqueda fluida |

### P3 — Pulido visual (paleta estándar `blue-*`)

| Archivo | Qué se hizo | Por qué |
|---|---|---|
| `lib/cn.ts` | **Nuevo**: helper `cn(...)` | Combinar clases sin dependencias |
| `components/ui/Input.tsx` | **Nuevo**: input base con variante `invalid` | Reutilización |
| `components/ui/Button.tsx` | **Nuevo**: botón con variantes | Reutilización |
| `components/FormField.tsx` | Usa `Input`; texto de error `red-600` → `red-700` | Reutilización + contraste AA |
| `components/SearchBar.tsx` | Usa `Input` | Reutilización |
| `components/CiudadanoForm.tsx` | Submit con `Button` | Reutilización |
| `app/ciudadanos/page.tsx`, `CiudadanosTable.tsx` | Encabezados/tabla en `blue-*` | Consistencia visual |
| `app/globals.css` | (Se añadieron tokens de marca y luego se revirtieron — ver §6) | — |

### P4 — Calidad (Vitest)

| Archivo | Qué se hizo |
|---|---|
| `package.json` | Scripts `test` (`vitest run`) y `test:watch`; devDeps de pruebas |
| `vitest.config.mts` | Alias `@`→`src`, entorno `jsdom`, patrón de tests |
| `lib/validators.test.ts` | 13 tests (CI, WhatsApp, nombre, form, field) |
| `lib/storage.test.ts` | 5 tests (vacío, round-trip, forma inválida, JSON roto, no-array) |
| `hooks/useCiudadanos.test.tsx` | 4 tests (inicio, alta+persistencia, CI duplicado, CI inválido) |

---

## 4. Corrección de bug crítico (el que rompía el formulario)

**Síntoma:** el usuario no podía escribir en los campos del formulario.

**Causa raíz:** los `<input>` eran controlados (`value` + `onChange`), pero **les faltaba
el atributo `name`**. El handler hacía `setForm(prev => ({ ...prev, [e.target.name]: value }))`
con `e.target.name === ""`, escribiendo una clave vacía y descartando lo tecleado → el
`value` seguía vacío.

**Solución:** `FormField` ahora renderiza el input con `name={id}` (el `id` coincide con la
clave del estado: `nombre`, `ci`, `whatsapp`).

**Lección incorporada al checklist:** *todo input controlado debe tener `name` que coincida
con la clave del estado*.

---

## 5. Deuda técnica corregida (detectada en el análisis)

| ID | Problema | Estado |
|---|---|---|
| **D1** | `CiudadanoForm` reimplementaba las regex en vez de usar `validators.ts` | Corregido: usa `validateForm` |
| **D2** | `aria-live` puesto en el input (ruido para lectores) | Corregido: `aria-live` solo en `StatusMessage` |
| **D3** | `onSuccess={() => reload()}` redundante tras guardar | Corregido: eliminado |
| **D4** | El éxito se mostraba como botón "✓ Guardado" | Corregido: es un `StatusMessage` |
| **D5** | `readCiudadanos` confiaba en `parsed as Ciudadano[]` | Corregido: `isCiudadano()` valida la forma |
| **D6** | Estado `loading` casi invisible (localStorage es síncrono) | Resuelto con `useSyncExternalStore` + flag de hidratación |

---

## 6. Incidente de la interfaz (todo blanco y negro)

**Síntoma reportado:** "no veo los botones, todo quedó blanco y negro".

**Diagnóstico:** durante P3 definí tokens de marca (`--color-brand-*`) en un bloque
`@theme` de Tailwind v4 y usé clases `bg-brand-*`/`text-brand-*`. El plugin
`@tailwindcss/turbopack` **no regeneró las utilidades `brand-*` por HMR**: el CSS servido
contenía clases actualizadas pero **0 utilidades `brand-*`**. Al no existir `bg-brand-900`,
el `Button` quedaba sin fondo (texto blanco sobre blanco = botón invisible), y encabezados
y tabla perdían color → apariencia blanco/negro.

**Verificación:** se inspeccionó el CSS compilado del dev server y se confirmó
`--color-brand-* = 0` y `.bg-brand-900 = 0`, mientras sí existían las clases estándar.

**Solución:** se **revirtió a la paleta estándar `blue-*`** (que Tailwind siempre genera) en
`Button`, `Input`, `page.tsx` y `CiudadanosTable`, y se eliminó el bloque `@theme` de marca.
Tras el cambio, el CSS pasó a incluir `.bg-blue-900`, `.text-blue-950`, `.hover\:bg-blue-800`,
`.bg-blue-100`, `.text-white`, `.border-gray-300`, `.focus\:ring-blue-500`, `.text-red-700`.

**Conclusión/Nota:** los cambios de `@theme` en Tailwind v4 con Turbopack requieren
**reiniciar el dev server** (no basta HMR). Se decidió **mantener `blue-*`** (sin tokens de
marca) por simplicidad.

---

## 7. Pruebas

```
Test Files  3 passed (3)
     Tests  20 passed (20)
```

Cobertura de lo probado:
- `validateCI`: 7-8 dígitos, vacío, longitud/caracteres inválidos.
- `validateWhatsApp`: prefijo 6/7, vacío, inválido.
- `validateNombre`, `validateForm` (acumulación de errores), `validateField`.
- `storage`: vacío, round-trip, filtrado de forma inválida, JSON roto, no-array.
- `useCiudadanos`: inicio vacío/`ready`, alta+persistencia, rechazo de CI duplicado, rechazo de CI inválido.

Comando: `npm test`.

---

## 8. Estado de verificación

| Comando | Resultado |
|---|---|
| `npm test` | 20/20 ✅ |
| `npx tsc --noEmit` | sin errores ✅ |
| `npm run lint` | 0 errores en `/ciudadanos`; **3 pre-existentes** en `dashboard`, `tramites`, `tramites/nuevo` (regla `react-hooks/set-state-in-effect`, ajenos a este trabajo) ⚠️ |

---

## 9. Dependencias agregadas (solo dev)

```
vitest, vite, jsdom, @testing-library/react, @testing-library/dom, @vitejs/plugin-react
```

- Se instalaron con `--legacy-peer-deps` por un conflicto de **peer opcional** en
  `@types/node` (tipos únicamente; sin impacto en runtime).
- npm reporta **5 vulnerabilidades** en dependencias de desarrollo.

---

## 10. Pendientes y recomendaciones

1. **Errores de lint pre-existentes** en `dashboard` y `tramites`: aplicar el mismo patrón
   `useSyncExternalStore` usado en `useCiudadanos` para eliminarlos.
2. **Build de producción**: validar `npm run build` (no se ejecutó para no interferir con el
   dev server en el puerto 3000).
3. **Robustez de `localStorage`**: evaluar manejo de cuota (ya se captura en la escritura) y
   de datos corruptos (ya se filtran).
4. **Posible unificación**: `src/app/tramites/nuevo/page.tsx` lee el mismo `STORAGE_KEY`
   con su propio tipo `Ciudadano`; convendría reutilizar `types/ciudadano.ts` y `storage.ts`.
5. **`.gitignore`**: confirmar que `.next/`, `node_modules/` y reportes generados no se
   commiteen (hay varios `informe_*` en la raíz).

---

## 11. Archivos del proyecto generados en esta iteración

- `PLAN_MAESTRO_CIUDADANOS.md` — plan unificado.
- `informe_proyecto_ciudadanos.txt` — análisis de arquitectura.
- `informe_actualizacion_ciudadanos.md` — reporte P0+P1 previo.
- `REPORTE_CAMBIOS_CIUDADANOS.md` — **este documento**.
