# Proposal — T-12-01 · Caso de uso: canjear recompensa con validación transaccional de saldo

**Ticket:** T-12-01  
**User Story:** US-12 — API: canjear recompensa con validación de saldo  
**Sprint:** 2 · Ciclo Semanal y Recompensas API

## Why

T-11-01/T-11-02 dejaron el CRUD de recompensas operativo (`Reward`, `RewardRepository`, endpoints `GET/POST/DELETE /api/rewards`), pero no existe la lógica de canje: el modelo Prisma `RewardRedemption` está migrado y el seed puede contener datos demo, sin embargo no hay caso de uso `redeemReward`, puerto de persistencia de canjes ni cálculo transaccional de saldo semanal. Sin esta capa, T-12-02 no puede exponer `POST /api/weeks/:weekId/redemptions` y el ciclo motivacional de puntos (US-12) queda incompleto.

## What Changes

- Crear entidad/tipo `RewardRedemption` en `backend/src/domain/rewardRedemption.ts` alineada con `schema.prisma` y `docs/data-model.md`.
- Definir puerto `RewardRedemptionRepository` con operación transaccional `redeem(userId, weekId, rewardId)` que calcula saldo y persiste el canje en la misma transacción Prisma.
- Implementar `createPrismaRewardRedemptionRepository` en `backend/src/infrastructure/prismaRewardRedemptionRepository.ts`.
- Extraer helper reutilizable `calculateWeekAvailableBalance(weekWithDetails, redemptionsSum)` (o equivalente) basado en la fórmula del ticket: `sum(completados × snapshotPoints) - sum(fallados × snapshotPenalty) - sum(pointsSpent)`.
- Caso de uso `redeemReward(rewardRedemptionRepo, rewardRepo, userId, weekId, rewardId)`:
  - Verifica ownership de semana y recompensa.
  - Rechaza semana bloqueada → `ConflictError { code: "WEEK_LOCKED" }`.
  - Rechaza saldo insuficiente → `UnprocessableError { code: "INSUFFICIENT_POINTS", available, required }`.
  - Éxito → retorna `RewardRedemption` con `pointsSpent = reward.cost`.
- Tests unitarios Vitest `redeemReward.test.ts`: happy path, saldo exacto al límite, insuficiente, semana bloqueada, concurrencia (dos llamadas simultáneas con saldo=50 y cost=50 → una éxito, otra `INSUFFICIENT_POINTS`).
- **Estado actual:** `RewardRedemption` en Prisma ✅; `calculateWeekStats` calcula puntos/penalizaciones por entradas ✅ pero no resta canjes; `mapWeekToApiResponse` devuelve `redemptions: []` hardcodeado; sin `redeemReward` ni repositorio de canjes; endpoint HTTP planificado en backlog (T-12-02), no en `createApp.ts`.

## Capabilities

### New Capabilities

- `reward-redeem-use-case`: Caso de uso `redeemReward`, puerto `RewardRedemptionRepository`, cálculo transaccional de saldo semanal, errores `INSUFFICIENT_POINTS` y `WEEK_LOCKED`, tests de concurrencia.

### Modified Capabilities

_(Ninguna — no se alteran specs archivadas de dominio HTTP de recompensas; el contrato REST se cubre en T-12-02.)_

## Impact

- **Backend / dominio:** `backend/src/domain/rewardRedemption.ts` (nuevo).
- **Backend / aplicación:** `backend/src/application/redeemReward.ts`, `backend/src/application/calculateWeekAvailableBalance.ts` (nuevo), `backend/src/application/ports/RewardRedemptionRepository.ts`, reutiliza `assertRewardOwnedByUser` (`rewardOwnership.ts`).
- **Backend / infraestructura:** `backend/src/infrastructure/prismaRewardRedemptionRepository.ts` (nuevo) con `prisma.$transaction`.
- **Backend / errores:** reutiliza `UnprocessableError` y `ConflictError` de `appErrors.ts` (T-04-02 ✅).
- **Tests:** `redeemReward.test.ts` (+ test de integración/concurrencia contra Prisma si el mock no basta para el DoD de race condition).
- **Documentación:** snippets en `docs/backend-standards.md`; verificar `docs/data-model.md` (entidad ya documentada).
- **Dependencias previas:** T-03-02 (`RewardRedemption`), T-04-02 (errores), T-09-01/02 (semana activa/bloqueada), T-11-01 (`Reward`, ownership).
- **Tickets posteriores:** T-12-02 (`POST /api/weeks/:weekId/redemptions`), T-09-03+ (poblar `redemptions` en respuesta de semana).

## Non-goals

- Registrar ruta `POST /api/weeks/:weekId/redemptions` en `createApp.ts` (T-12-02).
- Actualizar `docs/api-spec.yml` de PLANIFICADO a IMPLEMENTADO para canjes (T-12-02).
- Integración frontend (`rewardApi.redeemReward`, toasts US-19) — tickets US-13+.
- Tests curl/E2E de endpoints HTTP (T-12-02).
- Poblar array `redemptions` en `GET /api/weeks/current` (fuera del DoD de T-12-01).
- Impedir canjes múltiples de la misma recompensa en la misma semana (US-12 esc. 5 es negociable; no está en DoD de T-12-01).
- Rechazar canje de recompensa `isActive=false` — comportamiento razonable vía `NotFoundError`, pero validación HTTP en T-12-02.
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-12-01)

| Origen | Escenario | Aplicabilidad en T-12-01 |
|--------|-----------|---------------------------|
| US-12 | Scenario 1 — Happy path (canje con saldo suficiente) | **Completo** — `redeemReward` crea `RewardRedemption` con `pointsSpent = cost` |
| US-12 | Scenario 2 — Saldo insuficiente | **Completo** — `UnprocessableError` `INSUFFICIENT_POINTS` con `available`/`required` |
| US-12 | Scenario 3 — Semana bloqueada | **Completo** — `ConflictError` `WEEK_LOCKED` |
| US-12 | Scenario 4 — Race condition (doble clic) | **Completo** — test de concurrencia; solo un canje con saldo exacto |
| US-12 | Scenario 5 — Canjear múltiples veces | **Fuera de alcance** — negociable en US; no en DoD del ticket |
