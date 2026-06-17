# Proposal — T-17-03 · Componente AddRewardModal con validaciones

**Ticket:** T-17-03 | **User Story:** US-17 — UI: sistema de recompensas en el dashboard | **Sprint:** 3

## Why

El sistema de recompensas de US-17 requiere un modal para que el usuario pueda crear nuevas recompensas personalizadas. Sin este componente, el catálogo de recompensas no puede poblarse desde la interfaz, bloqueando el cierre del ciclo motivacional del producto.

## What Changes

- Nuevo componente `AddRewardModal.tsx` en `frontend/src/presentation/components/` con campos: emoji, nombre, descripción y coste.
- Validaciones inline: nombre no vacío y coste > 0.
- Mismo patrón de UX que `AddHabitModal`: botón en vuelo (`isSubmitting`), toast en error de API, reset de campos en éxito y cierre del modal.
- Tests unitarios `AddRewardModal.test.tsx` cubriendo happy path y edge cases del DoD.

## Capabilities

### New Capabilities

- `add-reward-modal`: Modal de creación de recompensas con validaciones inline y gestión de errores de API, siguiendo el mismo patrón que `AddHabitModal`.

### Modified Capabilities

*(ninguna — el ticket no altera comportamientos existentes)*

## Impact

- **Nuevo archivo:** `frontend/src/presentation/components/AddRewardModal.tsx`
- **Nuevo archivo:** `frontend/src/presentation/components/AddRewardModal.test.tsx`
- **Sin cambios en API ni modelos:** el componente delega la llamada HTTP al prop `onAdd` inyectado desde el padre (mismo contrato que `AddHabitModal`).
- **Referencia AC:** US-17 Scenario 1 (crear recompensa happy path) y US-11 S4 (validación coste ≤ 0).
