# Proposal — T-11-01 · Dominio, repositorio y casos de uso de recompensas

**Ticket:** T-11-01  
**User Story:** US-11 — API: gestión de recompensas (CRUD)  
**Sprint:** 2 · Ciclo Semanal y Recompensas API

## Why

El modelo Prisma `Reward` y el seed demo (T-03-02/T-03-03) ya persisten recompensas en PostgreSQL, pero el backend no tiene entidad de dominio, puerto `RewardRepository`, repositorio Prisma ni casos de uso de aplicación. Sin esta capa, T-11-02 no puede exponer `GET/POST/DELETE /api/rewards` con validación Zod y baja lógica (US-11 esc. 1–5). El frontend sigue usando estado React local (`frontend/src/domain/reward.ts`); el vertical slice backend debe cerrarse antes de conectar HTTP y antes de T-12-01 (`redeemReward`).

## What Changes

- Crear entidad/tipo `Reward` en `backend/src/domain/reward.ts` alineada con `schema.prisma` y `docs/data-model.md`.
- Definir puerto `RewardRepository` en `backend/src/application/ports/RewardRepository.ts` con `create`, `findActiveByUserId`, `findById`, `softDelete`.
- Implementar `createPrismaRewardRepository` en `backend/src/infrastructure/prismaRewardRepository.ts`.
- Completar validación Zod en `backend/src/application/validation/reward.ts` (schema ya existe desde T-19-01) con `parseCreateRewardInput` y casos de uso:
  - `createReward(userId, input)` — valida `name` no vacío, `cost > 0`, `emoji` presente.
  - `getActiveRewards(userId)` — devuelve solo recompensas activas del usuario.
  - `softDeleteReward(userId, rewardId)` — baja lógica con verificación de ownership; no elimina `RewardRedemption`.
- Tests unitarios Vitest con repositorio mock:
  - `createReward.test.ts` — happy path + `cost: 0` → `ValidationError` (US-11 S4).
  - `getActiveRewards.test.ts` — solo activas; `[]` si no hay activas (US-11 S2).
  - `softDeleteReward.test.ts` — `isActive=false`; reward ajeno → `NotFoundError` (US-11 S3, S5).
- **Estado actual:** modelo Prisma `Reward` ✅; `createRewardSchema` en `validation/reward.ts` ✅ (sin `parseCreateRewardInput`); sin `domain/reward.ts`, puerto ni casos de uso; endpoints `/api/rewards` planificados en `api-spec.yml` pero sin implementar (T-11-02).

## Capabilities

### New Capabilities

- `reward-domain-repository`: Entidad `Reward`, puerto `RewardRepository`, repositorio Prisma, validación Zod, casos de uso `createReward`, `getActiveRewards` y `softDeleteReward` con `ValidationError` y `NotFoundError`.

### Modified Capabilities

_(Ninguna — no se alteran specs archivadas; contrato REST HTTP se cubre en T-11-02.)_

## Impact

- **Backend / dominio:** `backend/src/domain/reward.ts` (nuevo).
- **Backend / aplicación:** `backend/src/application/ports/RewardRepository.ts`, `createReward.ts`, `getActiveRewards.ts`, `softDeleteReward.ts`, `rewardOwnership.ts` (nuevo, patrón `habitOwnership.ts`), ampliación de `validation/reward.ts`.
- **Backend / infraestructura:** `backend/src/infrastructure/prismaRewardRepository.ts` (nuevo).
- **Backend / errores:** reutiliza `ValidationError` y `NotFoundError` de `backend/src/domain/errors/appErrors.ts` (T-04-02 ✅).
- **Tests:** `createReward.test.ts`, `getActiveRewards.test.ts`, `softDeleteReward.test.ts`.
- **Documentación:** alinear snippets en `docs/backend-standards.md` si faltan tipos/puertos de recompensa; `docs/data-model.md` ya describe la entidad (verificación).
- **Dependencias previas:** T-03-02 (modelo Reward), T-04-01 (capas), T-04-02 (errores), T-07-01 (patrón hábitos), T-19-01 (`createRewardSchema`).
- **Tickets posteriores:** T-11-02 (endpoints HTTP), T-12-01 (`redeemReward`).

## Non-goals

- Registrar rutas `GET/POST/DELETE /api/rewards` en `createApp.ts` (T-11-02).
- Actualizar `docs/api-spec.yml` de PLANIFICADO a IMPLEMENTADO (T-11-02).
- Caso de uso `redeemReward` o canje transaccional (T-12-01).
- Integración frontend (`useRewards`, migración desde `frontend/src/domain/reward.ts`) — tickets US-13+.
- Tests curl/E2E de endpoints (T-11-02).
- Edición de recompensa (PATCH) — negociable en US-11, no en DoD.
- Borrado físico de `Reward` o cascada sobre `RewardRedemption` (Prisma `onDelete: Restrict` en FK).
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-11-01)

| Origen | Escenario | Aplicabilidad en T-11-01 |
|--------|-----------|---------------------------|
| US-11 | Scenario 1 — Crear recompensa (happy path) | **Parcial** — `createReward` + `repo.create` con `isActive: true` (HTTP 201 en T-11-02) |
| US-11 | Scenario 2 — Listar recompensas | **Parcial** — `getActiveRewards` filtra `isActive=true` (HTTP GET en T-11-02) |
| US-11 | Scenario 3 — Eliminar recompensa (baja lógica) | **Completo** — `softDeleteReward` marca `isActive=false`; redemptions intactas |
| US-11 | Scenario 4 — Validación: coste cero | **Completo** — `cost > 0` → `ValidationError` en `createReward` |
| US-11 | Scenario 5 — Edge case: recompensa de otro usuario | **Completo** — `softDeleteReward` con reward ajeno → `NotFoundError` |
