## Why

**Ticket:** T-16-01 · **User Story:** US-16 — UI: crear y gestionar hábitos desde el dashboard (Sprint 3)

US-16 necesita crear, marcar y eliminar hábitos desde la UI con *optimistic updates* y rollback ante errores (incluido `WEEK_LOCKED` en semanas bloqueadas). Hoy la capa `infrastructure` solo expone `apiGet` (formato legacy `{error}`) y `profileApi.ts` (GET). No existe ningún cliente HTTP para `/api/habits` ni `/api/habit-entries`, ni un tipo `ApiError` que exponga `code`/`details` del formato real `ApiErrorResponse` del backend (`{code, message, details?}`). Sin esta infraestructura, US-16 no puede implementarse.

## What Changes

- Crear `frontend/src/infrastructure/habitApi.ts` con `fetchHabits()`, `createHabit(input)`, `deleteHabit(id)`.
- Crear `frontend/src/infrastructure/habitEntryApi.ts` con `updateHabitEntry(entryId, status)`.
- Extender `frontend/src/infrastructure/httpClient.ts` (o crear helpers compartidos) con un tipo `ApiError { status, code, message, details? }` y soporte para verbos `GET/POST/PATCH/DELETE` que parseen el formato real `ApiErrorResponse` (`code`, `message`, `details`) del backend, en lugar del formato legacy `{error}`.
- Todas las funciones lanzan (`throw`) `ApiError` tipados en caso de respuesta no-2xx, distinguiendo casos como `WEEK_LOCKED` (409) y `VALIDATION_ERROR` (400 con `details`).

## Capabilities

### New Capabilities
- `frontend-habit-http-client`: clientes HTTP de infraestructura para hábitos (`fetchHabits`, `createHabit`, `deleteHabit`) y entradas de hábito (`updateHabitEntry`), incluyendo el tipo `ApiError` y el manejo de errores HTTP alineado con `ApiErrorResponse`.

### Modified Capabilities
(ninguna — no se modifican requisitos de capacidades existentes; `httpClient.ts` se extiende a nivel de implementación sin alterar contratos publicados)

## Impact

- **Código afectado:** `frontend/src/infrastructure/httpClient.ts` (nuevos helpers/tipos), nuevos ficheros `habitApi.ts` y `habitEntryApi.ts`.
- **APIs consumidas:** `GET /api/habits`, `POST /api/habits`, `DELETE /api/habits/:id`, `PATCH /api/habit-entries/:id` (ya implementadas en backend, ver `docs/api-spec.yml`).
- **Dependencias:** ninguna nueva (fetch nativo). Habilita US-16 (modal de creación, toggle de celdas, eliminación de hábitos).
- **Tests:** nuevos `habitApi.test.ts` y `habitEntryApi.test.ts` con mocking de `fetch` (patrón Vitest existente en `useUserProfile.test.ts`).

## Non-goals

- No se implementan componentes de UI, hooks de aplicación (`useHabitDashboard`) ni el modal de creación de hábitos — eso es US-16 (tickets posteriores).
- No se modifica el backend ni `docs/api-spec.yml` (los endpoints ya existen y están documentados).
- No se migra `profileApi.ts`/`apiGet` existente al nuevo formato `ApiError` salvo que sea necesario para no duplicar el cliente base (se evaluará en `design.md`, sin romper el contrato actual de `ProfileApiResult`).
- No se implementa `toggle/{dayIndex}` (endpoint marcado PLANIFICADO, no usado por este ticket).
