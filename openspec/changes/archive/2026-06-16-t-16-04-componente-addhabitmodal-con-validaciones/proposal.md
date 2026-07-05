# Proposal — T-16-04 · Componente AddHabitModal con validaciones

**Ticket:** T-16-04 · **User Story:** US-16 · **Sprint:** Sprint 3 — UI Core (Perfil, Hábitos y Recompensas)

## Why

El componente `AddHabitModal.tsx` ya existe en el repositorio con una implementación básica que bloquea el submit solo si el nombre está vacío (atributo `required` nativo), pero carece de validaciones inline explícitas, manejo de errores de API, estado de carga durante la petición y uso del componente `Dialog` de shadcn/ui. Este ticket cierra la brecha entre el scaffold inicial y los requisitos funcionales de la US-16 (AC Scenario 1 y Scenario 6).

## What Changes

- Reescribir `AddHabitModal.tsx` usando `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle` de `ui/dialog.tsx` en lugar del overlay CSS manual actual.
- Añadir validaciones inline por campo: `nombre` no vacío, `puntos > 0`, `penalización >= 0`.
- Mostrar mensajes de error junto a cada campo inválido antes de llamar a la API.
- Deshabilitar el botón "Añadir hábito" y mostrar spinner mientras la petición está en vuelo (`isSubmitting`).
- Si la API falla, mantener el modal abierto con los datos intactos y notificar mediante `sonner` toast.
- Al confirmar con éxito: cerrar modal y resetear todos los campos.
- Crear `AddHabitModal.test.tsx` con tests unitarios (Vitest + Testing Library + jsdom) que cubran validación y comportamiento submit.

## Capabilities

### New Capabilities

- `add-habit-modal-validation`: Validaciones inline en el formulario de creación de hábito (nombre, puntos, penalización) con errores por campo, estado de carga y manejo de error de API.

### Modified Capabilities

*(ninguna — no hay specs previas de este componente en `openspec/specs/`)*

## Impact

- **Archivo modificado:** `frontend/src/presentation/components/AddHabitModal.tsx`
- **Archivo nuevo:** `frontend/src/presentation/components/AddHabitModal.test.tsx`
- **Dependencias UI:** `ui/dialog.tsx`, `ui/button.tsx`, `ui/input.tsx`, `ui/label.tsx`, `ui/sonner.tsx` (ya disponibles en shadcn)
- **No toca API ni backend:** el componente recibe `onAdd` como prop; la llamada HTTP y el manejo optimistic son responsabilidad del hook (`useHabitDashboard`) fuera del alcance de este ticket.
- **No-goals:**
  - Integrar con API real (responsabilidad de tickets de aplicación/hook).
  - Implementar toggle de celda o eliminación de hábito (cubiertos por otros tickets de US-16).
  - Modificar el selector de emoji más allá del grid actual.
  - Actualizar `api-spec.yml` (no se altera ningún contrato de API en este ticket).
