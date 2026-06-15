## Why

**Ticket:** T-16-02 · **User Story:** US-16 — UI: crear y gestionar hábitos desde el dashboard (Sprint 3)

`useHabitDashboard` (`frontend/src/application/useHabitDashboard.ts`) gestiona hoy `habits`/`rewards` solo con estado local (`INITIAL_HABITS`/`INITIAL_REWARDS` de `domain/fixtures.ts`): no carga datos del backend ni persiste cambios. T-16-01 ya creó los clientes HTTP `habitApi`/`habitEntryApi` (con `ApiError` tipado), pero el hook no los usa. Sin esta integración, US-16 (Scenarios 1-5: crear/marcar/eliminar hábitos con optimistic update + rollback, semana bloqueada) no funciona contra datos reales.

## What Changes

- Crear `frontend/src/infrastructure/weekApi.ts` con `fetchCurrentWeek()` (`GET /api/weeks/current`) y `fetchWeekByOffset(offset)` (`GET /api/weeks?offset=`), tipando `WeekResponseDto` según `WeekResponse` de `docs/api-spec.yml`.
- Reescribir `useHabitDashboard` para:
  - Cargar la semana activa al montar vía `weekApi.fetchCurrentWeek()`, mapeando `WeekResponseDto` a `Habit[]` (dominio) + `stats` (`WeekStats`), y exponer `loading`/`error`.
  - `handleToggleDay(habitId, dayIndex)`: optimistic update local → `habitEntryApi.updateHabitEntry(entryId, status)` → en error revierte estado y muestra toast.
  - `handleAddHabit(input)`: `habitApi.createHabit(input)` → recarga la semana activa.
  - `handleDeleteHabit(habitId)`: optimistic delete → `habitApi.deleteHabit(id)` → en error restaura el hábito eliminado.
  - `handleWeekNav(offset)`: actualiza `weekOffset` y carga la semana correspondiente vía `weekApi.fetchWeekByOffset(offset)`.
  - Exponer `isCurrentWeek`/`isWeekLocked` derivados de la respuesta del backend (`week.isLocked`), no solo del cálculo local de `domain/week.ts`.
- Mantener `handleAddReward`, `handleRedeemReward`, `handleDeleteReward` operando sobre estado local (`rewards`/`INITIAL_REWARDS`) sin cambios de comportamiento: no hay endpoint de recompensas en el alcance de este ticket (fuera del DoD de T-16-02).

## Capabilities

### New Capabilities
- `frontend-week-http-client`: cliente HTTP de infraestructura para semanas (`fetchCurrentWeek`, `fetchWeekByOffset`), con `WeekResponseDto` alineado a `WeekResponse` de `docs/api-spec.yml` y manejo de `ApiError`.
- `frontend-habit-dashboard-data`: orquestación en `useHabitDashboard` que carga la semana activa desde la API al montar, mapea la respuesta a hábitos/estadísticas de dominio, y conecta `handleToggleDay`/`handleAddHabit`/`handleDeleteHabit`/`handleWeekNav` con `weekApi`/`habitApi`/`habitEntryApi` (optimistic updates + rollback + `isWeekLocked`).

### Modified Capabilities
(ninguna — no se modifican contratos de capacidades existentes; `frontend-habit-http-client` de T-16-01 se consume sin cambios)

## Impact

- **Código afectado:** nuevo `frontend/src/infrastructure/weekApi.ts`; reescritura de `frontend/src/application/useHabitDashboard.ts`; posible helper de mapeo `WeekResponseDto` → `Habit[]`/`HabitStats` dentro de la capa de aplicación.
- **APIs consumidas:** `GET /api/weeks/current`, `GET /api/weeks?offset=`, `POST /api/habits`, `DELETE /api/habits/:id`, `PATCH /api/habit-entries/:id` (todas ya implementadas en backend, ver `docs/api-spec.yml`).
- **Dependencias:** ninguna nueva; reutiliza `apiRequest`/`ApiError` de `httpClient.ts` (T-16-01) y `sonner` (`toast`) ya integrado en `App.tsx` para los mensajes de error.
- **Tests:** nuevo `weekApi.test.ts` (mock `fetch`) y nuevo `useHabitDashboard.test.ts` (`renderHook`, mockeando `weekApi`/`habitApi`/`habitEntryApi`) siguiendo el patrón de `useUserProfile.test.ts`.

## Non-goals

- No se implementa `rewardApi.ts` ni persistencia de recompensas (`/api/rewards`, `/api/weeks/{weekId}/redemptions`): `handleAddReward`/`handleRedeemReward`/`handleDeleteReward` siguen sobre estado local — corresponde a un ticket posterior de US-16/US-17.
- No se modifican componentes de presentación (`WeeklyCalendar`, `AddHabitModal`, etc.); el contrato de retorno del hook se mantiene compatible con los consumidores actuales.
- No se implementa el endpoint `POST /api/habits/:id/toggle/:dayIndex` (marcado PLANIFICADO, no usado por este ticket).
- No se modifica el backend ni `docs/api-spec.yml`.
