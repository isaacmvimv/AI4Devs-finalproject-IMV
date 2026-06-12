# Proposal — T-12-02 · Endpoint POST /api/weeks/:weekId/redemptions

**Ticket:** T-12-02 · **User Story:** US-12 · **Sprint:** 2 — Ciclo Semanal y Recompensas API  
**Change:** `t-12-02-weekid-redemptions` · **Rama:** `feature/T-12-02-weekid-redemptions`

## Why

T-12-01 implementó el caso de uso `redeemReward`, el puerto `RewardRedemptionRepository` y la validación transaccional de saldo semanal, pero el ciclo motivacional de puntos (US-12) no es consumible desde el cliente hasta exponer el endpoint HTTP. Sin `POST /api/weeks/:weekId/redemptions`, el frontend y las pruebas de integración no pueden cerrar el flujo de canje.

## What Changes

- Registrar `POST /api/weeks/:weekId/redemptions` en `createApp.ts` con body `{ rewardId }`, delegando en `redeemReward` (T-12-01).
- Instanciar `createPrismaRewardRedemptionRepository(prisma)` y cablear junto a `rewardRepository`.
- Validar body con schema Zod (`redeemRewardSchema`) vía `validateBody`.
- Respuestas HTTP según DoD: `201` con canje creado; `422` `INSUFFICIENT_POINTS`; `409` `WEEK_LOCKED`; `404` semana/recompensa ajena o inexistente.
- Tests supertest en `createApp.test.ts` con mock de `redeemReward` (happy path + edge US-12 esc. 1–3).
- Actualizar `docs/api-spec.yml`: añadir `/api/weeks/{weekId}/redemptions` como IMPLEMENTADO (reemplaza ruta legacy planificada `/api/rewards/{id}/redeem`).

## Capabilities

### New Capabilities

- `reward-redemption-http`: Exposición HTTP del canje de recompensas vía `POST /api/weeks/:weekId/redemptions` — T-12-02 / US-12.

### Modified Capabilities

_(Ninguna — el caso de uso `reward-redeem-use-case` ya está especificado e implementado en T-12-01.)_

## Impact

| Área | Cambio |
|------|--------|
| `backend/src/presentation/http/createApp.ts` | Nueva ruta POST + wiring repos |
| `backend/src/application/validation/` | Nuevo `redeemRewardSchema` |
| `backend/src/presentation/http/createApp.test.ts` | Tests HTTP con `vi.mock('redeemReward')` |
| `docs/api-spec.yml` | Endpoint canje + schemas `RedeemRewardRequest`, `RewardRedemption` |
| `docs/backend-standards.md` | Snippet handler canje (verificación en paso docs) |

**Dependencias:** T-12-01 (`redeemReward`, `prismaRewardRedemptionRepository`) ✅; T-11-02 (`rewardRepository`) ✅; T-09 (`week` ownership vía repo) ✅.

## Non-goals

- Cambios en `redeemReward`, `prismaRewardRedemptionRepository` o lógica transaccional (T-12-01).
- Poblar `redemptions` en `GET /api/weeks/current` (tickets posteriores).
- Endpoint legacy `POST /api/rewards/:id/redeem`.
- Frontend, E2E Playwright, auth middleware.
- Tests de concurrencia HTTP (cubiertos en T-12-01 a nivel aplicación/infra).

## Acceptance Criteria (US-12)

| Escenario Gherkin | Cobertura en este ticket |
|-------------------|--------------------------|
| S1 — Happy path canje 201 | **Completo** — handler HTTP + supertest |
| S2 — Saldo insuficiente 422 | **Completo** — propagación `UnprocessableError` |
| S3 — Semana bloqueada 409 | **Completo** — propagación `ConflictError` |
| S4 — Race condition | **Fuera de alcance** — T-12-01 (`redeemReward.concurrency.test.ts`) |
| S5 — Múltiples canjes | **Fuera de alcance** — lógica de aplicación T-12-01; HTTP no añade restricción |
