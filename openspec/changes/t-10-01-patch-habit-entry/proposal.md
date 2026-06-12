# Proposal — T-10-01 · Endpoint PATCH /api/habit-entries/:id

**Ticket:** T-10-01 · **User Story:** US-10 · **Sprint:** 2 · Ciclo Semanal y Recompensas API · **Change:** `t-10-01-patch-habit-entry` · **Rama:** `feature/T-10-01-patch-habit-entry`

## Why

T-09-01/02/03 ✅ ya persisten semanas, `WeekHabit` y las 7 `HabitEntry` por hábito, pero el backend no expone ninguna ruta para mutar el estado diario (`pending` / `completed` / `failed`). Sin `PATCH /api/habit-entries/:id`, el clic en una celda del calendario no puede persistirse y la interacción principal del producto queda bloqueada. Este ticket cierra US-10 en la capa HTTP + aplicación, con la validación crítica de semana bloqueada (`isLocked`).

## What Changes

- Crear puerto `HabitEntryRepository` con lectura contextual (`HabitEntry → WeekHabit → Week`) y actualización de `status`.
- Implementar `PrismaHabitEntryRepository` reutilizando mappers de `prismaWeekHabitRepository.ts`.
- Crear caso de uso `updateHabitEntry`: ownership por `Week.userId`, rechazo si `Week.isLocked`, persistencia de `status` y `updatedAt`.
- Añadir schema Zod `updateHabitEntrySchema` en `application/validation/habitEntry.ts`.
- Registrar `PATCH /api/habit-entries/:id` en `createApp.ts` con `validateBody` + `asyncHandler`.
- Tests unitarios del caso de uso y supertest con mocks (happy path, 409, 404, 400).
- Documentar endpoint en `docs/api-spec.yml`.

## Capabilities

### New Capabilities

- `habit-entry-http`: exposición HTTP de `PATCH /api/habit-entries/:id`, validación de `status`, verificación de semana no bloqueada, ownership y respuestas 200/400/404/409.

### Modified Capabilities

_(Ninguna — no altera requisitos de `week-get-current`, `week-lock-transition` ni `habit-http` ya archivados.)_

## Non-goals

- Cliente frontend (`habitEntryApi.ts`, `useHabitDashboard`) — T-16-01 / T-16-02.
- Endpoint legacy `POST /api/habits/:id/toggle/:dayIndex` — no implementar; el contrato oficial es PATCH por `HabitEntry.id`.
- Auth middleware / `userId` dinámico (MVP: `userId=1` hardcoded).
- Recalcular `Week.totalPointsEarned` / `totalPenalties` en tiempo real al cambiar estado — eso ocurre en `lockWeekAndTransition` (T-09-02).
- Restricción de días futuros en semana actual (negociable en US-10; fuera del DoD).
- Cambios de esquema Prisma o migraciones.
- Tests E2E Playwright.

## Acceptance Criteria (US-10)

| Escenario Gherkin | Cobertura T-10-01 |
|-------------------|-------------------|
| S1 — Happy path | PATCH con `status: completed` en semana activa → 200 `{ id, status, updatedAt }` y persistencia en BD |
| S2 — Semana bloqueada | `isLocked=true` → 409 `{ code: "WEEK_LOCKED", message: "No se puede modificar una semana bloqueada" }` |
| S3 — Ciclo de estados | `completed` → `failed` aceptado (todos los estados mutuamente accesibles) |
| S4 — Status inválido | `status: "done"` → 400 `VALIDATION_ERROR` con `details` en campo `status` |
| S5 — Entry de otro usuario | PATCH sobre entry ajena → 404 sin revelar existencia |

## Impact

- **Backend:** `application/ports/HabitEntryRepository.ts`, `infrastructure/prismaHabitEntryRepository.ts`, `application/updateHabitEntry.ts`, `application/validation/habitEntry.ts`, `presentation/http/createApp.ts`, tests asociados.
- **API:** nuevo endpoint documentado en `docs/api-spec.yml`.
- **Dependencias:** US-09 (entries creadas), `ConflictError`/`ValidationError`/`NotFoundError` (T-04-02), `validateBody` (T-19-01).
- **Sin impacto** en frontend, Prisma schema ni Docker.
