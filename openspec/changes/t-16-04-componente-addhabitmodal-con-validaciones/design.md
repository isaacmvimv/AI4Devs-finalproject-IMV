# Design — T-16-04 · Componente AddHabitModal con validaciones

## Context

`AddHabitModal.tsx` ya existe en `frontend/src/presentation/components/` con un scaffold inicial: overlay CSS manual, estado local con `useState`, selector de emojis, inputs HTML nativos y un único guard `if (name.trim())` antes de llamar a `onAdd`. No usa el componente `Dialog` de shadcn/ui, no muestra errores inline por campo, no gestiona el estado de envío en vuelo ni maneja errores de API.

Este ticket completa la implementación según los AC de US-16 (Scenario 1 y Scenario 6) y el DoD del ticket T-16-04. La capa de llamada a la API (POST /api/habits) es responsabilidad del hook `useHabitDashboard`, no de este componente.

## Goals / Non-Goals

**Goals:**
- Reemplazar el overlay CSS manual por `Dialog` de shadcn/ui (`ui/dialog.tsx`).
- Validaciones inline síncronas antes de invocar `onAdd`: `nombre` no vacío, `puntos > 0`, `penalización >= 0`.
- Estado `isSubmitting`: botón deshabilitado + spinner mientras la promesa de `onAdd` está pendiente.
- Si `onAdd` lanza error: modal permanece abierto, datos intactos, toast de error vía `sonner`.
- Al éxito: cerrar modal y resetear campos.
- Tests unitarios en `AddHabitModal.test.tsx` (Vitest + Testing Library + jsdom).

**Non-Goals:**
- Llamada directa a la API desde el componente (responsabilidad del hook).
- Cambio en la interfaz de props `onAdd` (sigue recibiendo `{ emoji, name, pointsPerDay, penalty }`).
- Rediseño visual más allá del cambio de contenedor (Dialog vs overlay).
- Soporte de react-hook-form (formulario simple; useState es suficiente).

## Decisions

### 1. Usar `Dialog` de shadcn/ui en lugar del overlay CSS manual

`ui/dialog.tsx` ya está disponible e implementa accesibilidad (foco atrapado, `aria-modal`, cierre con Escape) mediante Radix UI. El overlay CSS manual del scaffold actual no incluye ninguna de estas características. Cambiar al componente `Dialog` elimina código de gestión de foco y alinea el componente con el patrón shadcn/ui ya adoptado en `AddRewardModal` y otros modales del proyecto.

### 2. Validación síncrona con `useState` (sin react-hook-form)

El formulario tiene 4 campos simples. react-hook-form añadiría complejidad innecesaria para este alcance. Se mantendrá un objeto de errores `{ name?: string; pointsPerDay?: string; penalty?: string }` en estado local, calculado en `handleSubmit` antes de llamar a `onAdd`.

### 3. `onAdd` como promesa (`Promise<void>`)

Para gestionar `isSubmitting` y errores de API, la prop `onAdd` debe retornar una promesa. El cambio es compatible: el padre puede envolver una función sync en `async () => fn()`. Alternativa descartada: callback con argumento de resultado — más verbose y rompe la convención actual del proyecto.

### 4. Toast de error vía `sonner`

`sonner` ya está instalado (`sonner 2.0.3`) y hay un wrapper `ui/sonner.tsx`. Se usará `toast.error(message)` en el catch del submit. El modal permanece abierto con los datos intactos (AC Scenario 6 edge case de API).

## Risks / Trade-offs

- **Cambio de firma de `onAdd`** (`void` → `Promise<void>`): puede requerir ajustar `App.tsx` o el hook que pasa la prop. Bajo riesgo porque la función asíncrona devuelve `Promise<void>` compatible con el tipado `void` en la mayoría de contextos TypeScript, pero se debe verificar.
- **`Toaster` global:** `sonner` requiere `<Toaster />` en el árbol de la app. Si no está montado, los toasts no se muestran. Verificar que `App.tsx` ya lo incluye; si no, añadirlo.
