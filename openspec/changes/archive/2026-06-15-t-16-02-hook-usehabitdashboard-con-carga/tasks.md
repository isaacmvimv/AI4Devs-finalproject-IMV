# Tasks — T-16-02 · Hook useHabitDashboard con carga desde API

**Ticket:** T-16-02 · **User Story:** US-16 · **Change:** `t-16-02-hook-usehabitdashboard-con-carga` · **Rama:** `feature/T-16-02-hook-usehabitdashboard-con-carga`
**Pasos aplicables:** unit=sí · curl=N/A (endpoints ya implementados y probados en T-08-01/T-10-01/T-13-01; sin cambios backend) · e2e=sí · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)
- [x] 0.1 git checkout develop && git pull origin develop
- [x] 0.2 Validar rama no existe (local/remoto): `git branch --list "feature/T-16-02-hook-usehabitdashboard-con-carga"` y `git branch -r --list "origin/feature/T-16-02-hook-usehabitdashboard-con-carga"`
- [x] 0.3 git checkout -b feature/T-16-02-hook-usehabitdashboard-con-carga
- [x] 0.4 git branch --show-current

## 1. `weekApi.ts` — DTOs y funciones (DoD: carga de semana desde API)
- [x] 1.1 Crear `frontend/src/infrastructure/weekApi.ts` con tipos `WeekResponseDto` (`week`, `habits[].weekHabit`, `habits[].entries[]`, `stats`, `redemptions`), alineados con `WeekResponse`/`WeekStats` de `docs/api-spec.yml`
- [x] 1.2 Implementar `fetchCurrentWeek(): Promise<WeekResponseDto>` → `GET /api/weeks/current`
- [x] 1.3 Implementar `fetchWeekByOffset(offset: number): Promise<WeekResponseDto>` → `GET /api/weeks?offset=<offset>`

## 2. Mapeo `WeekResponseDto` → dominio (DoD: hábitos/stats/semana desde API)
- [x] 2.1 Crear `frontend/src/application/mapWeekResponseToDashboard.ts` con `mapWeekResponseToDashboard(dto: WeekResponseDto)` que devuelva `{ habits: Habit[]; stats: HabitStats; entryIdsByHabitId: Record<string, number[]>; isLocked: boolean }`
- [x] 2.2 Mapear cada `habits[].weekHabit` a `Habit` (`id = String(weekHabit.habitId)`, `emoji`/`name` desde fixtures actuales no aplica — usar `snapshotName`, `snapshotPoints` → `pointsPerDay`, `snapshotPenalty` → `penalty`; `completionStatus` desde `entries` ordenadas por `dayIndex`; `streak` con `computeStreakFromStatus` de `domain/habit.ts`)
- [x] 2.3 Mapear `stats` (`WeekStats`) a `HabitStats` del dominio (`thisWeekPoints`, `lastWeekPoints`, `penalties`, `maxStreak`)
- [x] 2.4 Construir `entryIdsByHabitId` (array de 7 `entry.id` indexado por `dayIndex`, por cada hábito)

## 3. `useHabitDashboard` — carga inicial y `handleWeekNav` (DoD: montar + navegación)
- [x] 3.1 Al montar, llamar a `weekApi.fetchCurrentWeek()`, mapear con `mapWeekResponseToDashboard` y poblar `habits`, `stats`, `entryIdsByHabitId`, `isWeekLocked` (desde `week.isLocked`); exponer `loading`/`error` (patrón `useUserProfile.ts`, con `cancelled` flag)
- [x] 3.2 Implementar `handleWeekNav(offset)`: actualizar `weekOffset` y llamar a `weekApi.fetchWeekByOffset(offset)`, remapeando `habits`/`stats`/`entryIdsByHabitId`/`isWeekLocked`; `isCurrentWeek = weekOffset === 0`
- [x] 3.3 Sustituir el uso de `INITIAL_HABITS`/`setWeekOffset` expuesto: ajustar `frontend/src/presentation/App.tsx` (`onPrevWeek`/`onNextWeek`) para usar `handleWeekNav(weekOffset - 1)`/`handleWeekNav(weekOffset + 1)` en vez de `setWeekOffset`

## 4. `handleToggleDay` — optimistic update + rollback (DoD; US-16 Scenarios 2-3-5)
- [x] 4.1 Si `isWeekLocked`, `handleToggleDay` no hace nada (return temprano)
- [x] 4.2 Aplicar `toggleHabitDayCompletion` de forma optimista sobre `habits`, calcular `status` resultante y `entryId` desde `entryIdsByHabitId[habitId][dayIndex]`
- [x] 4.3 Llamar a `habitEntryApi.updateHabitEntry(entryId, status)`; en error, revertir `habits` al estado previo y mostrar `toast.error(...)` (sonner)

## 5. `handleAddHabit` — crear y recargar semana (DoD; US-16 Scenarios 1 y 6)
- [x] 5.1 Llamar a `habitApi.createHabit(input)`; en éxito, recargar la semana activa con `weekApi.fetchCurrentWeek()` y remapear `habits`/`stats`/`entryIdsByHabitId`
- [x] 5.2 En error (p. ej. `VALIDATION_ERROR`), no modificar `habits` y mostrar `toast.error(...)` con el mensaje de la API

## 6. `handleDeleteHabit` — optimistic delete + rollback (DoD; US-16 Scenario 4)
- [x] 6.1 Eliminar el hábito de `habits` (y su entrada en `entryIdsByHabitId`) de forma optimista, conservando el hábito y su posición original para un posible rollback
- [x] 6.2 Llamar a `habitApi.deleteHabit(Number(habitId))`; en error, restaurar el hábito eliminado (y su entrada en `entryIdsByHabitId`) en su posición original y mostrar `toast.error(...)`

## 7. Tests unitarios (DoD: `weekApi.test.ts`, `useHabitDashboard.test.ts`)
- [x] 7.1 `weekApi.test.ts`: `fetchCurrentWeek` (200), `fetchWeekByOffset` happy path (200) y `404 WEEK_NOT_FOUND`, mockeando `fetch` (patrón `habitApi.test.ts`)
- [x] 7.2 `useHabitDashboard.test.ts` (`renderHook`, mockeando `weekApi`/`habitApi`/`habitEntryApi`):
  - Carga inicial: `fetchCurrentWeek` resuelve → `habits`/`stats` mapeados, `loading=false`
  - `handleToggleDay`: actualiza estado local y llama `updateHabitEntry`; error → revierte estado + `toast.error`
  - `handleDeleteHabit`: optimistic delete; error → restaura hábito
  - `isWeekLocked=true` → `handleToggleDay` no llama `updateHabitEntry`
  - `handleWeekNav`: llama `fetchWeekByOffset` y recarga `habits`/`isWeekLocked`/`isCurrentWeek`

## 8. Verificación → tasks-core §N+1 (OBLIGATORIO)
- [x] 8.1 `cd frontend && npm run test -- weekApi useHabitDashboard` (focalizado) y suite completa de frontend
- [x] 8.2 `cd frontend && npm run build` (typecheck) y `npm run dev:api` + `npm run dev`, comprobando `http://localhost:5173` (dashboard carga hábitos reales, toggle, alta/baja de hábito, navegación de semana)
- [x] 8.3 Informe en `openspec/changes/t-16-02-hook-usehabitdashboard-con-carga/reports/2026-06-15-step-08-verification.md`

## 9. curl → N/A
- [x] 9.1 Documentar en el informe de verificación que `curl` es N/A: este ticket consume `/api/weeks/current`, `/api/weeks?offset=`, `/api/habits`, `/api/habit-entries/:id` ya implementados y probados con curl en T-08-01/T-10-01/T-13-01, sin cambios en `backend/`

## 10. E2E → tasks-core §N+3 (OBLIGATORIO)
- [x] 10.1 Con `npm run dev:api` y `npm run dev` activos, usar Playwright MCP: cargar el dashboard (hábitos reales desde API), marcar/desmarcar una celda (verificar persistencia tras recargar), crear un hábito nuevo (modal), eliminar un hábito, navegar a la semana anterior (verificar badge "Semana bloqueada" y celdas no interactivas)
- [x] 10.2 Informe en `openspec/changes/t-16-02-hook-usehabitdashboard-con-carga/reports/2026-06-15-step-10-e2e.md`

## 11. Documentación → tasks-core §N+4 (OBLIGATORIO)
- [x] 11.1 Actualizar `frontend/src/infrastructure/README.md` describiendo `weekApi.ts` (`fetchCurrentWeek`, `fetchWeekByOffset`)
- [x] 11.2 Actualizar `frontend/src/application/README.md` describiendo la nueva orquestación de `useHabitDashboard` (carga API, `mapWeekResponseToDashboard.ts`, `loading`/`error`, `handleWeekNav`)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
- [x] Commit único, push de `feature/T-16-02-hook-usehabitdashboard-con-carga` y merge a `develop` (solo en `/opsx:archive`)
