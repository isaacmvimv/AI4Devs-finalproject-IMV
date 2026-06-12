# Proposal — T-11-02 · Endpoints GET, POST, DELETE /api/rewards

**Ticket:** T-11-02  
**User Story:** US-11 — API: gestión de recompensas (CRUD)  
**Sprint:** 2 · Ciclo Semanal y Recompensas API

## Why

T-11-01 dejó el vertical slice de dominio y aplicación listo (`Reward`, `RewardRepository`, `createReward`, `getActiveRewards`, `softDeleteReward`), pero `createApp.ts` no expone rutas HTTP. Sin `GET/POST/DELETE /api/rewards`, el frontend y los flujos de canje (T-12-01) no pueden consumir recompensas desde la API; el contrato en `docs/api-spec.yml` sigue marcado como PLANIFICADO.

## What Changes

- Instanciar `createPrismaRewardRepository(prisma)` en `createApp.ts` y cablear casos de uso de recompensas.
- Registrar `GET /api/rewards` → **200** con array de recompensas activas del usuario (`getActiveRewards`, `userId=1` MVP).
- Registrar `POST /api/rewards` con `validateBody(createRewardSchema)` → **201** con recompensa creada (`createReward`).
- Registrar `DELETE /api/rewards/:id` → **204** baja lógica; **404** si no existe o no pertenece al usuario (`softDeleteReward`).
- Añadir helper `parseRewardIdParam` (id no numérico → `NotFoundError` `REWARD_NOT_FOUND`).
- Ampliar `createApp.test.ts` con supertest + mocks para GET/POST/DELETE según DoD (happy path, `cost: 0` → 400, 404 ajeno, lista vacía).
- Actualizar `docs/api-spec.yml`: rutas `/api/rewards` y `/api/rewards/{id}` de PLANIFICADO a IMPLEMENTADO; documentar 400/404.
- **Estado actual:** casos de uso y repositorio Prisma ✅ (T-11-01); `createRewardSchema` + `validateBody` ✅ (T-19-01); sin rutas `/api/rewards` en `createApp.ts` ❌.

## Capabilities

### New Capabilities

- `reward-http`: Exposición HTTP de recompensas — `GET`, `POST`, `DELETE /api/rewards` con validación Zod, ownership 404, baja lógica y tests supertest alineados a US-11 esc. 1–5.

### Modified Capabilities

_(Ninguna — `reward-domain-repository` ya archivada en T-11-01; este ticket añade capa HTTP sin alterar requisitos de dominio.)_

## Impact

- **Backend / presentación:** `backend/src/presentation/http/createApp.ts`, ampliar `createApp.test.ts`.
- **Backend / aplicación e infra:** sin cambios de lógica de negocio (reutilizar casos de uso T-11-01).
- **Documentación:** `docs/api-spec.yml` (estado IMPLEMENTADO para GET/POST/DELETE rewards); verificar snippets en `docs/backend-standards.md`.
- **Dependencias previas:** T-11-01 ✅ (dominio + repositorio + casos de uso), T-19-01 ✅ (`validateBody` + `createRewardSchema`), T-04-02 ✅ (`errorHandler`), T-07-02 ✅ (patrón HTTP hábitos).
- **Tickets posteriores:** T-12-01 (`POST /api/rewards/:id/redeem`), integración frontend US-13+.

## Non-goals

- Caso de uso `redeemReward` o ruta `POST /api/rewards/:id/redeem` (T-12-01).
- Edición de recompensa (`PATCH /api/rewards/:id`) — negociable en US-11, no en DoD.
- Middleware de autenticación ni `userId` dinámico (MVP mantiene `userId=1` hardcodeado).
- Cambios en schema Prisma, migraciones o casos de uso de aplicación (salvo wiring HTTP).
- Integración frontend / E2E Playwright (sin cambios UI en este ticket).
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-11-02)

| Origen | Escenario | Aplicabilidad en T-11-02 |
|--------|-----------|---------------------------|
| US-11 | Scenario 1 — Crear recompensa (happy path) | **Completo** — `POST /api/rewards` → 201 con `id`, `isActive:true`, `createdAt`; persistencia en BD |
| US-11 | Scenario 2 — Listar recompensas | **Completo** — `GET /api/rewards` → 200 con solo activas; `[]` si no hay |
| US-11 | Scenario 3 — Eliminar recompensa (baja lógica) | **Completo** — `DELETE /api/rewards/:id` → 204; `isActive=false`; redemptions intactas |
| US-11 | Scenario 4 — Validación: coste cero | **Completo** — `POST` con `cost: 0` → 400 `VALIDATION_ERROR` en campo `cost` |
| US-11 | Scenario 5 — Edge case: recompensa de otro usuario | **Completo** — `DELETE` sobre reward ajeno → 404 `REWARD_NOT_FOUND` |
