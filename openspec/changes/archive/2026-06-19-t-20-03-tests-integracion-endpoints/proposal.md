# Proposal — T-20-03 · Tests de integración de endpoints principales del backend

**Ticket:** T-20-03 · **User Story:** US-20 · **Sprint:** 5

## Why

El backend de ConRutina carece de tests de integración que validen el flujo completo HTTP → caso de uso → BD. Los tests unitarios existentes (con mocks) cubren lógica aislada pero no detectan regresiones en la interacción real entre capas. Este ticket implementa tests de integración con `supertest` y una BD PostgreSQL efímera (Docker) para los endpoints más críticos, cumpliendo el AC Scenario 3 de US-20.

## What Changes

- Configurar infraestructura de test de integración: `supertest`, `PrismaClient` de test contra PostgreSQL efímero, helpers `createTestApp()` y `resetDb()`.
- Tests de integración para `GET /api/profile` (200, 404).
- Tests de integración para `POST /api/habits` (201, 400 body inválido).
- Tests de integración para `PATCH /api/habit-entries/:id` (200 semana activa, 409 semana bloqueada).
- Tests de integración para `POST /api/weeks/:weekId/redemptions` (201 saldo suficiente, 422 saldo insuficiente).
- Limpieza de BD entre tests con `beforeEach` + `prisma.$transaction([deleteMany...])`.
- Seed de test creando exactamente los datos necesarios por test.

## Non-goals

- No se cubren todos los endpoints del backend; solo los 4 especificados en el DoD.
- No se implementan tests E2E de frontend ni tests unitarios adicionales (cubiertos por T-20-01 y T-20-02).
- No se configura CI/CD para ejecutar estos tests automáticamente.
- No se cambia lógica de negocio ni endpoints existentes.

## Capabilities

### New Capabilities

- `integration-test-profile`: Tests de integración para GET /api/profile (happy path 200, edge 404).
- `integration-test-habits`: Tests de integración para POST /api/habits (happy path 201, edge 400).
- `integration-test-habit-entries`: Tests de integración para PATCH /api/habit-entries/:id (happy path 200, edge 409 semana bloqueada).
- `integration-test-redemptions`: Tests de integración para POST /api/weeks/:weekId/redemptions (happy path 201, edge 422 saldo insuficiente).

### Modified Capabilities

_(ninguna — no se modifican requisitos de capacidades existentes)_

## Impact

- **Código:** nuevo directorio `backend/src/__tests__/integration/` con archivos de test y helpers.
- **Dependencias:** `supertest` y `@types/supertest` como devDependencies.
- **Infraestructura:** requiere PostgreSQL efímero (Docker) para ejecutar; `DATABASE_URL` de test apuntando a BD de test.
- **Scripts:** posible script `npm run test:integration` para ejecutar solo tests de integración.

## Acceptance Criteria (Gherkin — US-20 Scenario 3)

```gherkin
Given el backend corre contra BD de test (Docker PostgreSQL efímero)
When se ejecutan los tests de integración
Then GET /api/profile → 200 con datos correctos
And POST /api/habits → 201 con hábito creado; 400 si body inválido
And PATCH /api/habit-entries/:id → 409 si semana bloqueada
And POST /api/weeks/:id/redemptions → 422 si saldo insuficiente
```
