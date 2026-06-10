# Proposal — T-07-02 · Endpoints GET y POST /api/habits

**Ticket:** T-07-02  
**User Story:** US-07 — API y dominio: creación y listado de hábitos  
**Sprint:** 1 · APIs Core y Dominio Frontend

## Why

T-07-01 completó el vertical slice de dominio, aplicación e infraestructura (`createHabit`, `getActiveHabits`, `HabitRepository`, validación Zod), pero `createApp.ts` no expone rutas HTTP ni instancia `habitRepository`. Sin este ticket, el frontend y las pruebas curl no pueden crear ni listar hábitos contra PostgreSQL, y US-07 esc. 1–5 permanecen sin capa de presentación.

## What Changes

- Instanciar `createPrismaHabitRepository(prisma)` en `createApp.ts` junto a `userRepository`.
- Registrar `GET /api/habits` → delegación en `getActiveHabits(habitRepository, 1)` → **200** con array de hábitos activos (`id`, `emoji`, `name`, `pointsPerDay`, `penalty`, `isActive`, `createdAt`).
- Registrar `POST /api/habits` → delegación en `createHabit(habitRepository, 1, req.body)` → **201** con el hábito creado (incl. `userId`, `isActive: true`, `createdAt`).
- Propagar `ValidationError` de `parseCreateHabitInput` vía `asyncHandler` → `errorHandler` → **400** `{ code: "VALIDATION_ERROR", message, details }`.
- Ampliar `createApp.test.ts` con tests supertest para GET/POST (happy path + validación name/pointsPerDay/emoji).
- Actualizar `docs/api-spec.yml`: marcar `/api/habits` GET/POST como implementados; alinear schema `Habit` de respuesta API con campos de persistencia (sin `streak`/`completionStatus` en este contrato backend).
- **Estado actual:** casos de uso y validación Zod ✅ (T-07-01); rutas `/api/habits` ausentes; `supertest` ya instalado (T-06-02).

## Capabilities

### New Capabilities

- `habit-http`: Exposición HTTP de creación y listado de hábitos (`GET /api/habits`, `POST /api/habits`), contrato JSON 200/201/400 y tests supertest.

### Modified Capabilities

_(Ninguna — `habit-domain-repository` cubre dominio/aplicación en T-07-01; este change añade la capa presentación sin alterar requisitos ya archivados.)_

## Impact

- **Backend / presentación:** `backend/src/presentation/http/createApp.ts`.
- **Backend / tests:** ampliar `backend/src/presentation/http/createApp.test.ts`.
- **Documentación:** `docs/api-spec.yml` (y snippets en `docs/backend-standards.md` si aplica).
- **Dependencias previas:** T-07-01 ✅ (`createHabit`, `getActiveHabits`, `parseCreateHabitInput`), T-04-02 ✅ (`errorHandler`, `asyncHandler`), T-06-02 ✅ (`supertest`), T-03-02/03 ✅ (modelo + seed).
- **Tickets posteriores:** T-08-01 (`PATCH`/`DELETE /api/habits/:id`), integración frontend US-07, auth middleware para `userId` dinámico.

## Non-goals

- Endpoints `PATCH`, `DELETE` o rutas con `:id` (T-08-01).
- Middleware de autenticación ni resolución dinámica de `userId` (MVP mantiene `userId=1` hardcodeado).
- Modificar casos de uso, repositorio, entidad `Habit` o schema Zod (alcance T-07-01).
- Campos de UI en respuesta API (`streak`, `completionStatus`) — pertenecen al modelo frontend.
- Tests de integración E2E con navegador (sin cambios UI en este ticket).
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-07-02)

| Origen | Escenario | Aplicabilidad en T-07-02 |
|--------|-----------|---------------------------|
| US-07 | Scenario 1 — Crear hábito (happy path) | **Completo** — `POST /api/habits` → 201 con hábito persistido |
| US-07 | Scenario 2 — Listar hábitos | **Completo** — `GET /api/habits` → 200 solo activos |
| US-07 | Scenario 3 — Validación: nombre vacío | **Completo** — 400 `VALIDATION_ERROR` + `details` en `name` |
| US-07 | Scenario 4 — Validación: puntos no positivos | **Completo** — 400 con error en `pointsPerDay` |
| US-07 | Scenario 5 — Emoji no proporcionado | **Completo** — 400 con error en `emoji` |
