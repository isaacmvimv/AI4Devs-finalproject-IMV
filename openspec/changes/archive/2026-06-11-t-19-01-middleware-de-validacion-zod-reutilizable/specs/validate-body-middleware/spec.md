# Spec — validate-body-middleware (delta)

**Ticket:** T-19-01 · **User Story:** US-19, US-07, US-10

## ADDED Requirements

### Requirement: Factory validateBody(schema) exportada en capa presentación

The system SHALL provide `validateBody(schema: ZodSchema)` in `backend/src/presentation/http/middleware/validateBody.ts` that returns a synchronous Express middleware function.

#### Scenario: DoD T-19-01 — Middleware retorna función Express

- **WHEN** se importa `validateBody` y se invoca con un schema Zod válido
- **THEN** el valor retornado es una función `(req, res, next) => void` usable en `app.post(...)` o `app.patch(...)`

#### Scenario: Body válido — happy path

- **WHEN** el middleware recibe `req.body` que cumple el schema Zod
- **THEN** invoca `next()` sin error
- **AND** no responde directamente al cliente (delega al handler siguiente)

### Requirement: Errores Zod mapeados a ValidationError con details

When `schema.safeParse(req.body)` fails, the middleware SHALL call `next(err)` with a `ValidationError` whose `details` is an array `{ field: string, message: string }[]` derived from Zod issues (US-19 Scenario 2, US-07 Scenario 3).

#### Scenario: DoD T-19-01 — Formato details por campo

- **WHEN** `req.body` falla la validación Zod por un único campo (p. ej. `name` vacío)
- **THEN** el error propagado es instancia de `ValidationError`
- **AND** `details` contiene `{ field: "name", message: "..." }` con el mensaje definido en el schema
- **AND** el `errorHandler` responde HTTP `400` con `code: "VALIDATION_ERROR"`

#### Scenario: Edge — Varios campos inválidos a la vez

- **WHEN** `req.body` omite o invalida varios campos requeridos simultáneamente
- **THEN** `details` incluye una entrada por cada issue de Zod relevante
- **AND** cada entrada tiene `field` igual a `issue.path.join('.')` o `"input"` si el path está vacío

#### Scenario: US-19 Scenario 2 — POST hábito sin name ni pointsPerDay

- **WHEN** un cliente envía `POST /api/habits` con body `{ "emoji": "🏃" }` sin `name` ni `pointsPerDay`
- **THEN** la respuesta es HTTP `400`
- **AND** el cuerpo incluye `code: "VALIDATION_ERROR"`
- **AND** `details` incluye entradas para `name` y `pointsPerDay`

### Requirement: Tests unitarios validateBody.test.ts

The project SHALL include Vitest tests for `validateBody` covering happy path and Zod failure cases without PostgreSQL.

#### Scenario: DoD ticket — validateBody.test.ts

- **WHEN** se ejecuta `npm test -- backend/src/presentation/http/middleware/validateBody.test.ts`
- **THEN** existen casos para body válido (`next()` llamado)
- **AND** casos para body inválido (`next` recibe `ValidationError` con `details`)
- **AND** caso con múltiples campos inválidos
- **AND** todos los tests pasan

### Requirement: Schemas Zod exportados para reutilización en rutas

Validation schemas for habits and rewards SHALL be exported from `backend/src/application/validation/` for use with `validateBody` in route registration.

#### Scenario: Hábitos — schemas disponibles

- **WHEN** se inspecciona `application/validation/habit.ts`
- **THEN** existen exports `createHabitSchema` y `updateHabitSchema` (o equivalentes) consumibles por `validateBody`

#### Scenario: Recompensas — schema POST disponible

- **WHEN** se inspecciona `application/validation/reward.ts`
- **THEN** existe export `createRewardSchema` con campos `{ emoji, name, description, cost }` y `cost` entero positivo (US-11 S4)
- **AND** puede usarse con `validateBody` en `POST /api/rewards` cuando la ruta exista
