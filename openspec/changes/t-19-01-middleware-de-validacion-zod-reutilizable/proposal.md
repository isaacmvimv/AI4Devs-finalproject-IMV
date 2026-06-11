# Proposal — T-19-01 · Middleware de validación Zod reutilizable

**Ticket:** T-19-01  
**User Story:** US-19 — Validaciones y manejo de errores  
**Sprint:** 1 · APIs Core y Dominio Frontend

## Why

La validación Zod de cuerpos HTTP está duplicada implícitamente en los casos de uso (`parseCreateHabitInput`, `parseUpdateHabitInput`) sin un punto único reutilizable en la capa de presentación. T-04-02 dejó preparado el `errorHandler` para convertir `ValidationError` en **400** con `details`, pero US-19 Scenario 2 y los escenarios de validación de US-07/US-10 requieren un middleware Express estándar que cualquier ruta POST/PATCH pueda reutilizar antes de ejecutar lógica de negocio.

## What Changes

- Crear `backend/src/presentation/http/middleware/validateBody.ts`: factory `validateBody(schema)` que valida `req.body` con Zod y delega errores al `errorHandler` vía `ValidationError`.
- Mapear issues de Zod a `[{ field: string, message: string }]` (mismo formato que `application/validation/habit.ts` hoy).
- Exportar schemas Zod reutilizables desde `application/validation/` (`createHabitSchema`, `updateHabitSchema`; añadir `createRewardSchema` para recompensas).
- Cablear `validateBody` en `POST /api/habits` y `PATCH /api/habits/:id` en `createApp.ts`.
- Preparar integración para `POST /api/rewards` (schema + patrón documentado); cableado HTTP cuando la ruta exista (T-11-02).
- Añadir `validateBody.test.ts` con happy path, error Zod simple y varios campos inválidos.
- Actualizar `docs/backend-standards.md` (patrón de validación en middleware) y referencias en `docs/api-spec.yml` si aplica.

**Estado actual:** `ValidationError` + `errorHandler` ✅ (T-04-02); schemas Zod de hábitos en `application/validation/habit.ts` ✅ (T-07-01); rutas hábitos POST/PATCH ✅ (T-07-02, T-08-01); middleware `validateBody` ❌; endpoints `/api/rewards` ❌ (T-11-02 pendiente).

## Capabilities

### New Capabilities

- `validate-body-middleware`: Factory Express `validateBody(schema)` que valida JSON body, normaliza `details` y propaga `ValidationError` → 400 vía `errorHandler`.

### Modified Capabilities

- `habit-http`: La validación de body en POST/PATCH SHALL ejecutarse en middleware `validateBody` antes del handler, manteniendo el contrato 400 `VALIDATION_ERROR` + `details` (US-07 Scenarios 3–5, US-19 Scenario 2).

## Impact

- **Backend / presentación:** `middleware/validateBody.ts`, `createApp.ts`.
- **Backend / aplicación:** exportar schemas desde `application/validation/habit.ts`; nuevo `application/validation/reward.ts` (schema POST recompensa).
- **Backend / tests:** `validateBody.test.ts`; posible ajuste mínimo de `createApp.test.ts` si los mocks asumen validación solo en use case.
- **Documentación:** `docs/backend-standards.md`, posiblemente `docs/api-spec.yml`.
- **Dependencias previas:** T-04-02 ✅ (`ValidationError`, `errorHandler`), T-07-01 ✅ (schemas hábitos), T-07-02/T-08-01 ✅ (rutas hábitos).
- **Tickets relacionados:** T-11-02 (`POST /api/rewards` usará el mismo middleware); validación frontend US-19 fuera de alcance.

## Non-goals

- Validación en formularios React (US-19 Scenario 1) — tickets frontend posteriores.
- Toasts ni manejo de errores de red en frontend (US-19 Scenarios 3–4).
- Middleware de autenticación, query params o path params.
- Endpoints de recompensas completos (dominio, repositorio, rutas) — alcance T-11-01/T-11-02.
- Cambiar códigos HTTP o formato JSON del `errorHandler` (T-04-02).
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-19-01)

| Origen | Escenario | Aplicabilidad en T-19-01 |
|--------|-----------|---------------------------|
| US-19 | Scenario 2 — Validación backend: body inválido | **Completo** — `POST /api/habits` sin `name`/`pointsPerDay` → 400 `VALIDATION_ERROR` + `details[]` |
| US-07 | Scenario 3 — Validación: nombre vacío | **Completo** — vía middleware en POST hábitos |
| US-07 | Scenario 4 — Validación: puntos no positivos | **Completo** — vía middleware en POST hábitos |
| US-10 | Scenario 4 — (validación PATCH hábito) | **Completo** — vía middleware en PATCH hábitos |
| US-19 | Scenarios 1, 3, 4 | **Fuera de alcance** — frontend / otros códigos HTTP |
