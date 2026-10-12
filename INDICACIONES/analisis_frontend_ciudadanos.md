# Análisis Frontend Senior — Módulo Ciudadanos

**Proyecto:** NotiDDRR-BEcodex  
**Ruta objetivo:** `http://localhost:3000/ciudadanos`  
**Stack descrito en el informe:** Next.js 16.4.0 (App Router), React 19.3.0, TypeScript y Tailwind CSS v4.  
**Alcance:** exclusivamente interfaz de usuario, componentes, estado en React, validaciones del cliente, accesibilidad, estilos y pruebas del frontend.

> **Límite de este análisis:** se excluyen deliberadamente las recomendaciones sobre backend, base de datos, APIs, infraestructura y autenticación real. Se conserva `localStorage` como mecanismo de persistencia de la demo para proponer mejoras dentro del alcance solicitado.

---

## 1. Diagnóstico del frontend actual

### 1.1 Estructura de la interfaz

Según el informe, el módulo está concentrado en `src/app/ciudadanos/page.tsx`, un Client Component de aproximadamente 212 líneas.

La pantalla tiene dos áreas principales:

- **Formulario “Nuevo Ciudadano”** a la izquierda en pantallas grandes:
  - Nombre completo.
  - CI, validado para aceptar 7 u 8 dígitos.
  - WhatsApp, validado para aceptar 8 dígitos y comenzar por 6 o 7.
  - Botón para guardar y un área de mensajes.
- **Listado “Ciudadanos Registrados”** a la derecha:
  - Contador total.
  - Tabla con nombre, CI y WhatsApp.
  - Mensaje vacío cuando no hay registros.

La distribución usa columnas de Tailwind en escritorio. El informe indica que la tabla es responsive, pero no especifica cómo se comporta en anchos pequeños ni si tiene desplazamiento horizontal, por lo que esto debe verificarse en el navegador.

### 1.2 Estado y flujo de datos

El componente mantiene seis estados con `useState`:

| Estado | Responsabilidad |
|---|---|
| `ciudadanos` | Lista que se renderiza y se guarda en el navegador. |
| `nombre` | Valor controlado del campo nombre. |
| `ci` | Valor controlado del campo CI. |
| `whatsapp` | Valor controlado del campo WhatsApp. |
| `mensaje` | Mensajes de validación, error o éxito. |
| `listo` | Indica que terminó la carga inicial desde el navegador. |

Un `useEffect` comprueba el indicador de demo en `sessionStorage`, lee y parsea `notiddrr_ciudadanos` desde `localStorage`, actualiza la lista y marca la carga como finalizada. La función `registrar` valida los campos, detecta CI duplicados, crea un identificador UUID, persiste la lista y limpia el formulario.

### 1.3 Lo que ya funciona bien

- Los campos principales están claramente definidos.
- Se utilizan inputs controlados y validaciones del lado del cliente.
- El formulario contempla duplicados de CI.
- Hay feedback de éxito y errores de validación.
- La interfaz distingue entre carga inicial y lista vacía.
- El tipo `Ciudadano` define explícitamente los datos que consume la UI.
- El informe confirma que los imports `Link` y `useRouter` se utilizan; no deben eliminarse como “código muerto” sin revisar el archivo real.

### 1.4 Riesgos y oportunidades del frontend

1. **Demasiadas responsabilidades en `page.tsx`.** La página coordina acceso a la ruta, carga de datos, validación, persistencia, formulario, mensajes y tabla. Esto dificulta leer, probar y modificar la UI.
2. **Carga y error están mezclados.** El informe indica que el `catch` asigna una lista vacía y que `listo` termina en `true`. Una lectura fallida puede parecer una lista legítimamente vacía.
3. **Un único mensaje para distintos estados.** Un string puede representar éxito, validación o error de almacenamiento. La UI no puede dar estilos, semántica accesible o acciones distintas de manera robusta.
4. **Validaciones incrustadas en el manejador.** Las reglas de CI y WhatsApp y los mensajes pueden extraerse a funciones reutilizables.
5. **Persistencia y renderizado acoplados.** La página conoce la clave de `localStorage` y la serialización JSON.
6. **Accesibilidad incompleta según el informe.** Los `label` tienen `htmlFor`, pero faltan `aria-describedby` para relacionar los campos con sus errores y una región de anuncios consistente.
7. **No se documentan búsqueda, filtros, paginación, edición o eliminación implementadas.** No deben asumirse como funciones actuales. Si el volumen de registros lo justifica, pueden añadirse como mejoras de UI.
8. **La memoización no debe ser la primera optimización.** Para la lista descrita, separar responsabilidades y evitar estados redundantes es más importante que añadir `useMemo` o `React.memo` sin mediciones.

---

## 2. Propuestas de mejora UI/UX y código

### 2.1 Modularización recomendada

La página debe actuar como coordinadora y no contener toda la implementación. Una estructura posible, sin cambiar la ruta pública, sería:

```text
src/
├── app/
│   └── ciudadanos/
│       └── page.tsx
├── components/
│   └── ciudadanos/
│       ├── CiudadanoForm.tsx
│       ├── CiudadanosTable.tsx
│       ├── CiudadanosToolbar.tsx       # opcional: búsqueda/filtros
│       ├── CiudadanosEmptyState.tsx
│       ├── CiudadanosLoading.tsx
│       └── StatusMessage.tsx
├── hooks/
│   └── useCiudadanos.ts
├── lib/
│   └── ciudadanos/
│       ├── storage.ts
│       └── validation.ts
└── types/
    └── ciudadanos.ts
```

**Responsabilidades propuestas:**

- `page.tsx`: compone el layout, conecta el hook y presenta los estados generales.
- `CiudadanoForm.tsx`: administra los campos y su feedback local; emite un ciudadano válido al guardar.
- `CiudadanosTable.tsx`: recibe `ciudadanos` por props y presenta únicamente la tabla.
- `CiudadanosToolbar.tsx`: búsqueda, ordenamiento o filtros, solo si se decide incluirlos.
- `CiudadanosEmptyState.tsx`: estado vacío con explicación y llamada a la acción.
- `CiudadanosLoading.tsx`: indicador de carga inicial.
- `StatusMessage.tsx`: presentación accesible de éxito y errores.
- `useCiudadanos.ts`: coordina carga, alta y estado de la colección.
- `storage.ts`: encapsula el acceso al almacenamiento del navegador y el parseo.
- `validation.ts`: contiene las reglas de validación reutilizables.
- `types/ciudadanos.ts`: centraliza el tipo compartido.

No es necesario crear todos los archivos desde el primer cambio. Primero se pueden extraer tipos y validaciones, después el hook, y finalmente los componentes visuales.

### 2.2 Estado de carga, error, éxito y vacío

En vez de depender únicamente de `listo: boolean`, conviene modelar la carga con estados explícitos:

```ts
type LoadStatus = "loading" | "ready" | "error";
```

Comportamiento visual sugerido:

- **`loading`:** mostrar un skeleton sencillo o el texto “Cargando ciudadanos…”. No mostrar durante ese momento un estado vacío que pueda interpretarse como definitivo.
- **`ready` con cero registros:** mostrar “Todavía no hay ciudadanos registrados” y una indicación para empezar desde el formulario.
- **`ready` con registros:** mostrar contador y tabla.
- **`error`:** mostrar un mensaje que explique que no fue posible leer los datos guardados y ofrecer una acción de reintento. No convertir silenciosamente el error en una lista vacía.

El estado de carga no necesita animaciones complejas. Un skeleton de 3–5 filas es suficiente si mantiene la geometría de la tabla; de lo contrario, un indicador simple es más claro.

### 2.3 Mensajes tipados

Reemplazar un string ambiguo por una estructura discriminada permite dar feedback coherente:

```ts
type FormMessage =
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | { type: "info"; text: string }
  | null;
```

Estilos recomendados:

- Éxito: texto y fondo suaves con icono opcional; no depender solo del color verde.
- Error: texto legible junto al campo correspondiente y un resumen si hay varios errores.
- Información: mensajes neutrales, por ejemplo cuando no hay resultados.
- Mantener los mensajes breves y accionables.

Para errores de validación por campo, es preferible un objeto como `errors: Partial<Record<"nombre" | "ci" | "whatsapp", string>>` en lugar de mostrar todos los errores en un único bloque.

### 2.4 Validación del formulario

Extraer las reglas a `lib/ciudadanos/validation.ts`. Ejemplo basado exclusivamente en las reglas del informe:

```ts
export const CI_REGEX = /^\d{7,8}$/;
export const WHATSAPP_REGEX = /^[67]\d{7}$/;

export function validateNombre(nombre: string): string | undefined {
  if (!nombre.trim()) return "Ingrese el nombre completo.";
}

export function validateCI(ci: string): string | undefined {
  if (!CI_REGEX.test(ci.trim())) {
    return "El CI debe tener 7 u 8 dígitos.";
  }
}

export function validateWhatsApp(whatsapp: string): string | undefined {
  if (!WHATSAPP_REGEX.test(whatsapp.trim())) {
    return "Ingrese un celular boliviano válido de 8 dígitos.";
  }
}
```

La verificación de CI duplicado debe seguir comparando valores normalizados con `trim()`. No debe tratarse el resultado del navegador como garantía de integridad fuera de esta demo.

**Experiencia al validar:**

- No mostrar errores antes de que el usuario haya interactuado con el campo, salvo al enviar el formulario.
- Después del primer envío, validar al corregir el campo para que el mensaje desaparezca cuando el valor sea válido.
- Usar `inputMode="numeric"` para CI y WhatsApp; `maxLength` puede ayudar a evitar entradas excesivas, pero la validación debe seguir existiendo.
- No convertir automáticamente el número de WhatsApp en un número JavaScript: conservarlo como string.
- Al fallar el envío, enfocar el primer campo inválido cuando sea práctico.

### 2.5 Accesibilidad

- Cada input debe tener un `label` visible, asociado mediante `htmlFor` e `id`.
- Si existe un error de campo, enlazarlo con `aria-describedby` y aplicar `aria-invalid={Boolean(error)}`.
- Los mensajes que cambian tras guardar deben usar una región `aria-live="polite"`; para errores urgentes de envío puede evaluarse `role="alert"`.
- El botón debe tener un texto que describa la acción. Durante el guardado, deshabilitarlo solo si hay una operación realmente en curso.
- La tabla debe usar `<table>`, `<thead>`, `<tbody>` y encabezados `<th scope="col">`.
- No usar solo color para comunicar éxito o error.
- Mantener foco visible, contraste adecuado y tamaños de interacción cómodos.
- El contador puede anunciarse de manera discreta si cambia como resultado de una acción.

### 2.6 Diseño responsivo

Propuesta de comportamiento:

- **Móvil:** una columna; formulario primero y listado después. Evitar comprimir la tabla hasta hacer ilegibles los datos.
- **Tablet:** conservar una columna o usar dos solo cuando el ancho lo permita.
- **Escritorio:** formulario de una fracción del ancho y listado más amplio, por ejemplo una proporción aproximada de 1:2.
- Para la tabla, usar un contenedor `overflow-x-auto` con un ancho mínimo razonable, o una presentación en tarjetas en móvil si las pruebas muestran que es más usable.
- Evitar alturas fijas que corten mensajes o filas.
- Verificar al menos 320, 375, 768, 1024 y 1440 px de ancho.

Ejemplo de layout Tailwind:

```tsx
<main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
  <header className="mb-6">
    <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
      Ciudadanos
    </h1>
    <p className="mt-1 text-sm text-slate-600">
      Registra y consulta los ciudadanos de la demostración.
    </p>
  </header>

  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <section className="min-w-0 lg:col-span-1">
      {/* Formulario */}
    </section>

    <section className="min-w-0 lg:col-span-2">
      {/* Tabla, carga, error o estado vacío */}
    </section>
  </div>
</main>
```

### 2.7 Búsqueda, ordenamiento y paginación: solo cuando aporten valor

El informe no confirma que estas funciones existan actualmente. Para terminar una primera versión, recomiendo este orden:

1. **Primero:** formulario y tabla estables, estados de carga/error/vacío, accesibilidad y responsive.
2. **Luego:** búsqueda por nombre o CI si el listado crece y encontrar registros empieza a ser lento.
3. **Después:** ordenamiento por nombre, si ayuda a la consulta cotidiana.
4. **Paginación:** incorporarla solo cuando el volumen medido afecte la navegación o el renderizado. En una demo pequeña puede bastar con búsqueda y una lista completa.

Para filtrar una colección local, usar un valor de búsqueda separado y derivar la lista visible sin duplicar datos en estado:

```tsx
const [busqueda, setBusqueda] = useState("");

const ciudadanosFiltrados = ciudadanos.filter((ciudadano) => {
  const termino = busqueda.trim().toLocaleLowerCase();

  return (
    ciudadano.nombre.toLocaleLowerCase().includes(termino) ||
    ciudadano.ci.includes(termino)
  );
});
```

Si se añade este filtro, mostrar un estado diferente cuando no hay ciudadanos registrados y cuando sí hay registros, pero ninguno coincide con la búsqueda. No introducir paginación solo por anticipación.

---

## 3. Refactorización prioritaria

### 3.1 Sección crítica

La sección más crítica descrita en el informe es `src/app/ciudadanos/page.tsx`, especialmente la combinación de:

- efecto de carga y control de acceso;
- lectura y parseo de `localStorage`;
- validaciones del formulario;
- detección de CI duplicado;
- persistencia y actualización del estado;
- presentación de mensajes y renderizado de la tabla.

El problema principal no es el número exacto de líneas, sino que la página tiene demasiadas razones para cambiar. El primer refactor recomendado es extraer el tipo y las validaciones; el siguiente, encapsular la colección en `useCiudadanos`.

### 3.2 Ejemplo de hook para gestionar la colección local

El siguiente ejemplo ilustra la separación de responsabilidades. Es una base de refactorización, no un reemplazo literal del archivo original: debe integrarse con el JSX y los nombres reales del proyecto.

**`src/types/ciudadanos.ts`**

```ts
export type Ciudadano = {
  id: string;
  nombre: string;
  ci: string;
  whatsapp: string;
};
```

**`src/hooks/useCiudadanos.ts`**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Ciudadano } from "@/types/ciudadanos";

const STORAGE_KEY = "notiddrr_ciudadanos";

type LoadStatus = "loading" | "ready" | "error";

function readCiudadanos(): Ciudadano[] {
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("El formato guardado no es una lista.");
  }

  // Validación mínima de forma para evitar renderizar registros mal formados.
  const validos = parsed.filter((item): item is Ciudadano => {
    if (!item || typeof item !== "object") return false;

    const value = item as Record<string, unknown>;

    return (
      typeof value.id === "string" &&
      typeof value.nombre === "string" &&
      typeof value.ci === "string" &&
      typeof value.whatsapp === "string"
    );
  });

  return validos;
}

export function useCiudadanos() {
  const [ciudadanos, setCiudadanos] = useState<Ciudadano[]>([]);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  const reload = useCallback(() => {
    setStatus("loading");
    setLoadError(null);

    try {
      const datos = readCiudadanos();
      setCiudadanos(datos);
      setStatus("ready");
    } catch {
      setLoadError(
        "No se pudieron leer los ciudadanos guardados en este navegador."
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const agregarCiudadano = useCallback(
    (datos: Omit<Ciudadano, "id">) => {
      const ciNormalizado = datos.ci.trim();

      if (
        ciudadanos.some((ciudadano) => ciudadano.ci.trim() === ciNormalizado)
      ) {
        return {
          ok: false as const,
          message: "Ya existe un ciudadano registrado con ese CI.",
        };
      }

      const nuevo: Ciudadano = {
        id: crypto.randomUUID(),
        nombre: datos.nombre.trim(),
        ci: ciNormalizado,
        whatsapp: datos.whatsapp.trim(),
      };

      const actualizados = [...ciudadanos, nuevo];

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(actualizados)
        );
        setCiudadanos(actualizados);

        return {
          ok: true as const,
          ciudadano: nuevo,
        };
      } catch {
        return {
          ok: false as const,
          message:
            "No se pudo guardar el ciudadano en este navegador. Inténtalo nuevamente.",
        };
      }
    },
    [ciudadanos]
  );

  return {
    ciudadanos,
    status,
    loadError,
    reload,
    agregarCiudadano,
  };
}
```

#### Decisiones importantes del ejemplo

- La lectura de `localStorage` ocurre dentro de `useEffect`, no durante el renderizado, evitando acceso a `window` en el render del servidor.
- `status` diferencia carga, éxito de carga y error de lectura.
- La función de persistencia captura errores, por ejemplo cuando el navegador no permite escribir en el almacenamiento.
- La función de alta devuelve un resultado explícito para que el formulario decida qué mensaje mostrar.
- La validación de duplicados permanece como una comprobación de la experiencia del usuario dentro de la demo.
- El hook no incluye navegación ni control de sesión: esas responsabilidades no pertenecen a la colección de ciudadanos.

**Nota de integración:** si el proyecto ya tiene un alias `@/` configurado, puede utilizarse como en el ejemplo. De lo contrario, ajustar la ruta del import. El hook usa una lista capturada por el callback; es suficiente para un flujo sencillo y secuencial. Si en el futuro se permiten escrituras concurrentes o cambios desde varias pestañas, habrá que replantear la sincronización de la colección. Eso no es necesario para el refactor inicial.

### 3.3 Cómo quedaría la página

La página deja de encargarse de la serialización y delega la colección al hook:

```tsx
"use client";

import { useState } from "react";
import { useCiudadanos } from "@/hooks/useCiudadanos";
import type { Ciudadano } from "@/types/ciudadanos";

export default function CiudadanosPage() {
  const {
    ciudadanos,
    status,
    loadError,
    reload,
    agregarCiudadano,
  } = useCiudadanos();

  const [mensaje, setMensaje] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleCrear(datos: Omit<Ciudadano, "id">) {
    const resultado = agregarCiudadano(datos);

    if (!resultado.ok) {
      setMensaje({ type: "error", text: resultado.message });
      return;
    }

    setMensaje({
      type: "success",
      text: "Ciudadano registrado correctamente.",
    });
  }

  if (status === "loading") {
    return <p role="status">Cargando ciudadanos…</p>;
  }

  if (status === "error") {
    return (
      <section aria-labelledby="error-title">
        <h1 id="error-title">No se pudieron cargar los ciudadanos</h1>
        <p role="alert">{loadError}</p>
        <button type="button" onClick={reload}>
          Reintentar
        </button>
      </section>
    );
  }

  return (
    <main>
      {/* Mantener aquí el encabezado y el layout Tailwind del módulo. */}

      {/* CiudadanoForm debe llamar a handleCrear con los datos del formulario. */}

      {mensaje && (
        <p
          role={mensaje.type === "error" ? "alert" : "status"}
          aria-live={mensaje.type === "error" ? "assertive" : "polite"}
        >
          {mensaje.text}
        </p>
      )}

      <section aria-labelledby="lista-ciudadanos-title">
        <h2 id="lista-ciudadanos-title">
          Ciudadanos registrados ({ciudadanos.length})
        </h2>

        {ciudadanos.length === 0 ? (
          <p>Todavía no hay ciudadanos registrados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">
                    Nombre
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    CI
                  </th>
                  <th scope="col" className="px-4 py-3 text-left">
                    WhatsApp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ciudadanos.map((ciudadano) => (
                  <tr key={ciudadano.id}>
                    <td className="px-4 py-3">{ciudadano.nombre}</td>
                    <td className="px-4 py-3">{ciudadano.ci}</td>
                    <td className="px-4 py-3">{ciudadano.whatsapp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
```

Este fragmento es ilustrativo: `CiudadanoForm` debe implementarse y conectarse al `handleCrear`, y la comprobación de acceso a la ruta que existe en la página actual debe conservarse por separado durante el refactor. No reemplazar el archivo completo sin integrar esa lógica ni revisar el JSX actual.

### 3.4 Precauciones al implementar

- `localStorage` es una API del navegador: no leerla en el cuerpo de render de un Client Component.
- El `catch` de carga no debe fingir que el error equivale a “cero ciudadanos”.
- Un filtro de datos mal formados puede evitar errores de render, pero no debe descartar silenciosamente registros sin informar si se detectan datos inválidos importantes. En una demo, como mínimo, registrar el estado de error y definir cómo recuperarse.
- No añadir `useMemo` a cada expresión por defecto. Medir primero; la separación de componentes ya mejora el mantenimiento.
- Conservar el flujo de registro actual y verificarlo antes de incorporar nuevas funciones.

---

## 4. Plan de acción frontend, ordenado por prioridad

### P0 — Estabilizar la experiencia actual

- [ ] Revisar el `page.tsx` real y establecer una referencia del comportamiento actual.
- [ ] Confirmar que el formulario funciona con datos válidos, campos vacíos, CI inválido, WhatsApp inválido y CI duplicado.
- [ ] Separar claramente los estados de carga, error de lectura, lista vacía y lista con datos.
- [ ] Evitar que un fallo de lectura de `localStorage` se presente como si no existieran ciudadanos.
- [ ] Mejorar los mensajes de éxito/error y asociar errores con sus campos mediante `aria-describedby`.
- [ ] Probar el diseño en móvil, tablet y escritorio; resolver desbordamientos de tabla.

### P1 — Refactorizar sin alterar el comportamiento

- [ ] Mover `Ciudadano` a `src/types/ciudadanos.ts`.
- [ ] Extraer los patrones de CI y WhatsApp y sus funciones de validación.
- [ ] Extraer la lectura/escritura de `localStorage` a un módulo pequeño.
- [ ] Crear `useCiudadanos()` para centralizar carga, alta y errores de almacenamiento.
- [ ] Separar `CiudadanoForm` y `CiudadanosTable`.
- [ ] Mantener en `page.tsx` solo la composición del layout y los estados generales de la pantalla.
- [ ] Verificar que los imports realmente utilizados —incluidos `Link` y `useRouter` según el informe— sigan presentes donde corresponda.

### P2 — Pulir interacción y accesibilidad

- [ ] Añadir `aria-invalid`, `aria-describedby` y regiones de anuncios para mensajes dinámicos.
- [ ] Revisar foco visible, orden de tabulación y navegación solo con teclado.
- [ ] Definir estados visuales para hover, focus, disabled y errores.
- [ ] Mejorar el estado vacío con texto claro y orientación para comenzar.
- [ ] Evitar que el botón de envío provoque dobles altas; si se introduce estado de envío, usarlo de forma coherente.
- [ ] Confirmar que los datos largos no rompan el layout.

### P3 — Añadir herramientas para consultar registros si hacen falta

- [ ] Incorporar búsqueda por nombre o CI si el volumen real de registros lo requiere.
- [ ] Diferenciar “no hay registros” de “no hay coincidencias”.
- [ ] Añadir ordenamiento solo si ayuda a la consulta.
- [ ] Evaluar paginación cuando el volumen justifique la complejidad; no introducirla anticipadamente.
- [ ] Si se añade búsqueda, comprobar que el contador distinga el total de ciudadanos del número de resultados filtrados.

### P4 — Pruebas y revisión final

- [ ] Probar las funciones de validación con entradas válidas e inválidas.
- [ ] Probar el flujo de alta: registro exitoso, duplicado, limpieza de campos y mensaje correcto.
- [ ] Probar carga con almacenamiento vacío, JSON inválido y fallo de escritura.
- [ ] Probar la UI con cero, uno y varios ciudadanos.
- [ ] Ejecutar ESLint y TypeScript y resolver los errores relacionados con este módulo.
- [ ] Hacer una revisión manual de accesibilidad y responsive antes de dar por terminada la ruta.

---

## 5. Criterios de aceptación

La ruta `/ciudadanos` puede considerarse pulida para esta etapa cuando:

1. La pantalla presenta carga, error, vacío y datos como estados distintos.
2. Un registro válido se guarda y aparece una sola vez en la tabla.
3. Las reglas actuales de nombre, CI, WhatsApp y CI duplicado producen mensajes comprensibles.
4. Los campos y sus errores son utilizables con teclado y tecnologías de asistencia.
5. La tabla no rompe el diseño en móvil y conserva encabezados semánticos.
6. `page.tsx` ya no contiene toda la lógica de validación y almacenamiento.
7. Las pruebas principales y los chequeos de TypeScript/ESLint pasan.
8. Las funciones nuevas —búsqueda, ordenamiento o paginación— solo se incluyen si existe una necesidad de uso clara.

## Recomendación final

El mejor siguiente paso es **refactorizar de forma incremental**: primero estados de carga/error y accesibilidad; luego tipos y validaciones; después el hook de ciudadanos; finalmente separar formulario y tabla. Mantén la funcionalidad actual durante cada paso y valida el comportamiento antes de añadir características nuevas. Esto reduce el riesgo de romper la demo y deja una base de frontend más fácil de mantener sin ampliar el alcance hacia backend, base de datos o infraestructura.
