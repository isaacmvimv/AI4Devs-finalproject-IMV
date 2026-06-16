# Proposal — T-17-01 · Infraestructura frontend: clientes HTTP para recompensas y canjes

**Ticket:** T-17-01 · **User Story:** US-17 · **Sprint:** Sprint 3 — UI Core (Perfil, Hábitos y Recompensas)

## Why

El módulo de recompensas de US-17 necesita acceder a las APIs de recompensas y canjes del backend, pero actualmente no existe ningún cliente HTTP tipado en el frontend para estos endpoints. Sin esta capa de infraestructura, los tickets posteriores de UI (tarjetas, modal de creación, botón de canje) no tienen cómo comunicarse con el servidor.

## What Changes

- Crear `frontend/src/infrastructure/rewardApi.ts` con cuatro funciones: `fetchRewards()`, `createReward(input)`, `deleteReward(id)` y `redeemReward(weekId, rewardId)`.
- `redeemReward` propaga el error 422 `INSUFFICIENT_POINTS` con tipado específico (campos `available` y `required`), siguiendo la misma convención de `ApiError` que `habitApi.ts`.
- Crear `frontend/src/infrastructure/rewardApi.test.ts` con tests unitarios para el happy path y el edge case del error 422.

## Capabilities

### New Capabilities

- `reward-api-client`: Cliente HTTP para las operaciones CRUD de recompensas y el canje semanal de puntos. Incluye manejo tipado del error 422 `INSUFFICIENT_POINTS`.

### Modified Capabilities

_(ninguna — este ticket no modifica requisitos de capabilities existentes)_

## Impact

- **Nuevo fichero:** `frontend/src/infrastructure/rewardApi.ts`
- **Nuevo fichero de tests:** `frontend/src/infrastructure/rewardApi.test.ts`
- **Dependencias:** `httpClient.ts` (ya existente), `ApiError` (ya existente)
- **Tickets que desbloquea:** T-17-02 (hook de recompensas), T-17-03 (tarjetas UI), T-17-04 (modal de creación)
- **Non-goals:**
  - No crear hooks de React (`useRewards`, etc.) — eso es T-17-02.
  - No implementar componentes UI de recompensas.
  - No modificar endpoints del backend.
  - No cubrir todos los escenarios BDD de US-17 (solo la infraestructura HTTP de T-17-01).

## Criterios de aceptación vinculados

Los escenarios BDD de US-17 que guían los tests de este ticket son:

- **US-17 Scenario 2** — Canjear con saldo suficiente: `redeemReward` llama a `POST /api/weeks/:id/redemptions` y retorna el resultado.
- **US-17 Scenario 5** — Rollback de canje fallido: `redeemReward` lanza `ApiError` con `code: INSUFFICIENT_POINTS` cuando el backend responde 422.
