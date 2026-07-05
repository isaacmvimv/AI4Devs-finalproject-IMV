# Proposal — T-18-02 · Integrar historial: cargar semanas previas desde API en WeeklyCalendar

**Ticket:** T-18-02 · **User Story:** US-18 · **Sprint:** 4

## Why

El usuario necesita navegar a semanas anteriores y ver datos reales del historial (hábitos, estados, estadísticas) cargados desde la API, no solo la semana actual. Actualmente `useHabitDashboard` ya tiene `handleWeekNav` que llama a `weekApi.fetchWeekByOffset`, pero falta: estado de carga visual (skeleton) durante la transición, deshabilitación del botón "‹" cuando no hay más semanas (404), y que los stats del historial reflejen `totalPointsEarned` / `totalPenalties` de la semana bloqueada.

## What Changes

- Añadir estado `weekLoading` en `useHabitDashboard` que se active durante `handleWeekNav` para mostrar skeleton en el calendario.
- Manejar respuesta 404 de `GET /api/weeks?offset=n`: marcar que no hay semana anterior disponible y deshabilitar el botón "‹".
- Mostrar skeleton/placeholder en `CalendarSection` mientras `weekLoading` es `true`.
- Asegurar que `StatCard` y `ProgressBar` reflejan los stats de la semana histórica cargada.

## Capabilities

### New Capabilities
- `week-history-loading`: Estado de carga y skeleton al navegar entre semanas; manejo de 404 para deshabilitar navegación hacia atrás.

### Modified Capabilities

_(Sin modificaciones a capabilities existentes en openspec/specs/)_

## Impact

- **Archivos afectados:**
  - `frontend/src/application/useHabitDashboard.ts` — nuevo estado `weekLoading`, flag `canGoBack`, manejo 404
  - `frontend/src/presentation/components/WeeklyCalendar.tsx` — prop `loading`, deshabilitar "‹" con `canGoBack`
  - `frontend/src/presentation/components/layout/CalendarSection.tsx` — skeleton condicional
  - `frontend/src/presentation/App.tsx` — pasar nuevas props
- **API:** Consume `GET /api/weeks?offset=n` (ya existente); no modifica backend.
- **AC vinculados:** US-18 Scenarios 3, 4, 5 (navegación historial, edge case sin semana anterior, volver a semana actual).

## Non-goals

- No se implementa caché de semanas navegadas (fuera de DoD).
- No se modifica la lógica de toggle de celdas ni la API backend.
- No se implementa actualización en tiempo real de stats (T-18-01 ya cubierto).
- No se amplía el número máximo de semanas navegables.
