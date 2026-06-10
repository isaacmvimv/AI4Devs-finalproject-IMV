# Proposal — T-08-01 · Endpoints PATCH y DELETE /api/habits/:id

**Ticket:** T-08-01  
**User Story:** US-08 — API: actualizar y desactivar hábitos  
**Sprint:** 1 · APIs Core y Dominio Frontend

## Why

T-07-01 dejó el puerto `HabitRepository` con `update` y `softDelete` implementados en Prisma, y T-07-02 expuso `GET`/`POST /api/habits`. Sin PATCH y DELETE, el usuario no puede editar ni dar de baja lógica un hábito desde la API, bloqueando US-08 y la futura integración frontend del catálogo de hábitos.

## What Changes

- Crear casos de uso `updateHabit(repo, userId, habitId, input)` y `deactivateHabit(repo, userId, habitId)` con validación Zod parcial (`parseUpdateHabitInput`) y verificación de pertenencia al usuario (`findById` + `userId`).
- Registrar `PATCH /api/habits/:id` → **200** con hábito actualizado; **404** si no existe o no pertenece al usuario (sin filtrar por `isActive` en la búsqueda previa).
- Registrar `DELETE /api/habits/:id` → **204**; baja lógica vía `softDelete` (`isActive=false`), sin borrado físico ni mutación de filas `WeekHabit`.
- Ampliar `createApp.test.ts` con supertest + mocks para PATCH/DELETE (happy path, 404 ajeno, validación PATCH).
- Añadir test de integración/caso de uso: DELETE de hábito con `WeekHabit` históricos → snapshots (`snapshotName`, `snapshotPoints`, `snapshotPenalty`) intactos.
- Actualizar `docs/api-spec.yml`: `/api/habits/{id}` PATCH (sustituir PUT planificado) y DELETE implementados; respuesta 404 con `HABIT_NOT_FOUND`.
- **Estado actual:** repositorio con `update`/`softDelete` ✅ (T-07-01); rutas HTTP solo GET/POST; casos de uso de edición/desactivación ausentes.

## Capabilities

### New Capabilities

_(Ninguna — la capacidad HTTP de hábitos ya existe como `habit-http`.)_

### Modified Capabilities

- `habit-http`: Extender con requisitos PATCH/DELETE, ownership 404, baja lógica, inmutabilidad de snapshots en semanas bloqueadas y tests HTTP/unitarios alineados a US-08 esc. 1–4.

## Impact

- **Backend / aplicación:** `updateHabit.ts`, `deactivateHabit.ts`, `validation/habit.ts` (`parseUpdateHabitInput`), tests unitarios asociados.
- **Backend / presentación:** `createApp.ts`, ampliar `createApp.test.ts`.
- **Documentación:** `docs/api-spec.yml` (PATCH en lugar de PUT planificado para `/api/habits/{id}`).
- **Dependencias previas:** T-07-01 ✅ (dominio + repositorio), T-07-02 ✅ (GET/POST HTTP), T-03-02/03 ✅ (modelo `Habit`/`WeekHabit` + seed).
- **Tickets posteriores:** integración frontend (`habitApi.updateHabit`, `deleteHabit`), semanas US-09, auth middleware para `userId` dinámico.

## Non-goals

- Middleware de autenticación ni `userId` dinámico (MVP mantiene `userId=1` hardcodeado).
- Modificar filas `WeekHabit` o `HabitEntry` al editar/desactivar (snapshots históricos inmutables por diseño de BD).
- Endpoints de semanas, entradas diarias o toggle (tickets US-09+).
- Cambios en schema Prisma o migraciones de BD.
- Integración frontend / E2E Playwright (sin cambios UI en este ticket).
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-08-01)

| Origen | Escenario | Aplicabilidad en T-08-01 |
|--------|-----------|---------------------------|
| US-08 | Scenario 1 — Editar hábito (happy path) | **Completo** — `PATCH /api/habits/:id` → 200; solo tabla `Habit` mutada |
| US-08 | Scenario 2 — Eliminar hábito (baja lógica) | **Completo** — `DELETE /api/habits/:id` → 204; `isActive=false` |
| US-08 | Scenario 3 — Edge: hábito de otro usuario | **Completo** — PATCH/DELETE → 404 sin revelar existencia ajena |
| US-08 | Scenario 4 — PATCH en semana bloqueada | **Completo** — `Habit` actualizado; `WeekHabit.snapshot*` sin cambios |
