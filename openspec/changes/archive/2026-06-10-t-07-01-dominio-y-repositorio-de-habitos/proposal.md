# Proposal — T-07-01 · Dominio y repositorio de hábitos (crear, listar, desactivar)

**Ticket:** T-07-01  
**User Story:** US-07 — API y dominio: creación y listado de hábitos  
**Sprint:** 1 · APIs Core y Dominio Frontend

## Why

El modelo Prisma `Habit` y el seed demo (T-03-02/T-03-03) ya persisten hábitos en PostgreSQL, pero el backend no tiene entidad de dominio, puerto `HabitRepository`, repositorio Prisma ni casos de uso de aplicación. Sin esta capa, T-07-02 no puede exponer `POST /api/habits` ni `GET /api/habits` con validación Zod y filtrado por `isActive` (US-07 esc. 1–5). La UI sigue usando estado React local (`frontend/src/domain/habit.ts`); el vertical slice backend debe cerrarse antes de conectar HTTP.

## What Changes

- Crear entidad/tipo `Habit` en `backend/src/domain/habit.ts` alineada con `schema.prisma` y `docs/data-model.md`.
- Definir puerto `HabitRepository` en `backend/src/application/ports/HabitRepository.ts` con `create`, `findActiveByUserId`, `findById`, `update`, `softDelete`.
- Implementar `createPrismaHabitRepository` en `backend/src/infrastructure/prismaHabitRepository.ts`.
- Añadir validación Zod en `backend/src/application/validation/habit.ts` (o equivalente) y casos de uso:
  - `createHabit(userId, input)` — valida input, persiste con `isActive: true`.
  - `getActiveHabits(userId)` — devuelve solo hábitos activos del usuario.
- Tests unitarios Vitest con repositorio mock:
  - `createHabit.test.ts` — happy path + validaciones (`name` vacío, `pointsPerDay <= 0`, sin `emoji`, `penalty < 0`).
  - `getActiveHabits.test.ts` — solo activos; `[]` si no hay activos.
- **Estado actual:** no existen archivos `*habit*` en `backend/src/`; Prisma `Habit` ✅; endpoints `/api/habits` planificados en `api-spec.yml` pero sin implementar (T-07-02).

## Capabilities

### New Capabilities

- `habit-domain-repository`: Entidad `Habit`, puerto `HabitRepository`, repositorio Prisma, validación Zod, casos de uso `createHabit` y `getActiveHabits` con `ValidationError`.

### Modified Capabilities

_(Ninguna — no se alteran specs archivadas; contrato REST HTTP se cubre en T-07-02.)_

## Impact

- **Backend / dominio:** `backend/src/domain/habit.ts` (nuevo).
- **Backend / aplicación:** `backend/src/application/ports/HabitRepository.ts`, `createHabit.ts`, `getActiveHabits.ts`, `validation/habit.ts` (nuevos).
- **Backend / infraestructura:** `backend/src/infrastructure/prismaHabitRepository.ts` (nuevo).
- **Backend / errores:** reutiliza `ValidationError` de `backend/src/domain/errors/appErrors.ts` (T-04-02 ✅).
- **Tests:** `createHabit.test.ts`, `getActiveHabits.test.ts`.
- **Documentación:** alinear snippets en `docs/backend-standards.md` si faltan tipos/puertos de hábito; `docs/data-model.md` ya describe la entidad (verificación, no cambio estructural salvo reglas de validación).
- **Dependencias previas:** T-03-02 (modelo Habit), T-04-01 (capas), T-04-02 (`ValidationError`), T-04-03 (Zod en config).
- **Tickets posteriores:** T-07-02 (`GET`/`POST /api/habits`, contrato 400/201), desactivar vía `softDelete` en tickets de edición/eliminación.

## Non-goals

- Registrar rutas `GET /api/habits` o `POST /api/habits` en `createApp.ts` (T-07-02).
- Actualizar `docs/api-spec.yml` de PLANIFICADO a IMPLEMENTADO (T-07-02).
- Casos de uso `updateHabit`, `deactivateHabit` expuestos a HTTP (solo puerto `update`/`softDelete` preparados para tickets futuros).
- Integración frontend (`useHabits`, migración desde `frontend/src/domain/habit.ts`) — tickets US-07 frontend.
- Tests curl/E2E de endpoints (T-07-02 / US-19).
- Límite máximo de hábitos por usuario (negociable en US-07, no en DoD de T-07-01).
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-07-01)

| Origen | Escenario | Aplicabilidad en T-07-01 |
|--------|-----------|---------------------------|
| US-07 | Scenario 1 — Crear hábito (happy path) | **Parcial** — `createHabit` + `repo.create` con `isActive: true` (HTTP 201 en T-07-02) |
| US-07 | Scenario 2 — Listar hábitos | **Parcial** — `getActiveHabits` filtra `isActive=true` (HTTP GET en T-07-02) |
| US-07 | Scenario 3 — Validación: nombre vacío | **Completo** — Zod/`ValidationError` en `createHabit` |
| US-07 | Scenario 4 — Validación: puntos no positivos | **Completo** — `pointsPerDay > 0` → `ValidationError` |
| US-07 | Scenario 5 — Edge case: emoji no proporcionado | **Completo** — `emoji` obligatorio → `ValidationError` |
