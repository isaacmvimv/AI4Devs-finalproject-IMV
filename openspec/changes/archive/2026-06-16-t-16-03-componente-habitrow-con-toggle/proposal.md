## Ticket / US / Sprint

- **Ticket:** T-16-03 — Componente HabitRow con toggle de estados y modo lectura
- **User Story:** US-16 — UI: crear y gestionar hábitos desde el dashboard
- **Sprint:** Sprint 3 · UI Core — Perfil, Hábitos y Recompensas

## Why

`HabitRow.tsx` existe con una implementación inicial pero carece de tests unitarios, del indicador visual de "hoy" y de la firma de props alineada con el contrato que espera `useHabitDashboard`. Completar y probar este componente desbloquea los tickets de integración de la pantalla principal (T-16-04 en adelante).

## What Changes

- Ajustar props de `HabitRow.tsx` para aceptar `weekOffset` y exponer `onToggle(dayIndex)` / `onDelete()` (sin `habitId` en los callbacks — el padre ya lo conoce).
- Añadir indicador visual de "hoy" en la celda correspondiente cuando `weekOffset === 0`.
- Verificar que `isReadOnly=true` deshabilita botones de celda y oculta el botón ×.
- Crear `HabitRow.test.tsx` con RTL cubriendo happy path y edge cases del DoD.

## Capabilities

### New Capabilities

- `habit-row-ui`: Componente presentacional `HabitRow` con ciclo de estados pending/completed/failed, modo lectura y marcador de día actual.

### Modified Capabilities

_(ninguna — no cambia ningún spec de requisito existente)_

## Non-goals

- Lógica de optimistic update (pertenece al hook `useHabitDashboard`, T-16-02).
- Modal de creación de hábitos (T-16-04).
- Integración con la pantalla real (T-16-05).
- Eliminación con confirmación modal (scope de US-16 superior a este ticket).

## Impact

- **Archivo modificado:** `frontend/src/presentation/components/HabitRow.tsx`
- **Archivo nuevo:** `frontend/src/presentation/components/HabitRow.test.tsx`
- Sin cambios en API, backend ni modelos de datos.
- Depende de: US-10 (ciclo visual de estados), T-16-02 (hook `useHabitDashboard`).

## Criterios de aceptación referenciados (US-16)

- Scenario 2: Toggle de celda → `onToggle(dayIndex)` llamado.
- Scenario 5: Semana bloqueada → celdas no clicables, sin botón ×.
