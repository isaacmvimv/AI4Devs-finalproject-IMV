# Tasks — T-12-02 · Endpoint POST /api/weeks/:weekId/redemptions

**Ticket:** T-12-02 · **User Story:** US-12 · **Change:** `t-12-02-weekid-redemptions` · **Rama:** `feature/T-12-02-weekid-redemptions`

**Pasos aplicables:** unit=sí · curl=sí · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-12-02-weekid-redemptions"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-12-02-weekid-redemptions"`
- [x] 0.4 `git checkout -b feature/T-12-02-weekid-redemptions`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-12-02-weekid-redemptions`

## 1. Preparar entorno

- [x] 1.1 Revisar baseline T-12-01: `redeemReward`, `createPrismaRewardRedemptionRepository`, `RewardRedemptionRepository` ✅
- [x] 1.2 Confirmar ausencia de ruta `/api/weeks/:weekId/redemptions` en `backend/src/presentation/http/createApp.ts`
- [x] 1.3 Revisar `docs/api-spec.yml` — añadir `/api/weeks/{weekId}/redemptions` (objetivo IMPLEMENTADO); ruta legacy `/api/rewards/{id}/redeem` obsoleta
- [x] 1.4 Confirmar seed con semana activa, recompensas y puntos suficientes para usuario `id=1`

## 2. Schema de validación y helpers (DoD: body `{ rewardId }`)

- [x] 2.1 Crear `backend/src/application/validation/rewardRedemption.ts` con `redeemRewardSchema` (`rewardId` entero positivo)
- [x] 2.2 Añadir helper `parseWeekIdParam` en `createApp.ts` (id no numérico → `NotFoundError` `WEEK_NOT_FOUND`)

## 3. Wiring repositorio y ruta HTTP (DoD: POST 201 / 422 / 409 / 404)

- [x] 3.1 En `createApp.ts`, importar `createPrismaRewardRedemptionRepository`, `redeemReward`, `redeemRewardSchema`
- [x] 3.2 Instanciar `rewardRedemptionRepository = createPrismaRewardRedemptionRepository(prisma)`
- [x] 3.3 Registrar `POST /api/weeks/:weekId/redemptions` con `validateBody(redeemRewardSchema)` → `redeemReward(...)` → `201` JSON `{ id, weekId, rewardId, pointsSpent, redeemedAt }` (ISO)

## 4. Tests HTTP supertest (DoD: happy path + edge US-12 esc. 1–3)

- [x] 4.1 Ampliar `backend/src/presentation/http/createApp.test.ts` con `vi.mock` de `redeemReward`
- [x] 4.2 POST 201 happy path: mock devuelve redemption → `POST /api/weeks/1/redemptions` body `{ rewardId: 2 }` → `201` con campos DoD (US-12 S1)
- [x] 4.3 POST 422: mock lanza `UnprocessableError` `INSUFFICIENT_POINTS` con `details` → `422` (US-12 S2)
- [x] 4.4 POST 409: mock lanza `ConflictError` `WEEK_LOCKED` → `409` (US-12 S3)
- [x] 4.5 POST 404 semana: mock lanza `NotFoundError` `WEEK_NOT_FOUND` → `404`
- [x] 4.6 POST 404 recompensa: mock lanza `NotFoundError` `REWARD_NOT_FOUND` → `404`
- [x] 4.7 POST 400: body `{}` o `rewardId` inválido → `400` `VALIDATION_ERROR`, use case no invocado
- [x] 4.8 POST 404 weekId inválido (`abc`) → `404` sin invocar use case

## 5. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 5.1 `npm test -- backend/src/presentation/http/createApp.test.ts`
- [x] 5.2 Confirmar tests T-12-01 sin regresión: `npm test -- backend/src/application/redeemReward.test.ts`
- [x] 5.3 Informe: `openspec/changes/t-12-02-weekid-redemptions/reports/YYYY-MM-DD-step-05-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 6. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 6.1 `npm test` — suite backend relevante PASS
- [x] 6.2 `npm run dev:api` — confirmar arranque sin errores TypeScript
- [x] 6.3 Informe: `openspec/changes/t-12-02-weekid-redemptions/reports/YYYY-MM-DD-step-06-verification.md`

## 7. curl → tasks-core §N+2 + templates/endpoint-testing.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 7.1 `npm run db:up` — PostgreSQL activo
- [x] 7.2 `npm run dev:api` — servidor en `http://localhost:3001`
- [x] 7.3 Obtener `weekId` de semana activa: `curl -s http://localhost:3001/api/weeks/current` — anotar `week.id`
- [x] 7.4 Obtener `rewardId` con coste ≤ saldo: `curl -s http://localhost:3001/api/rewards` — elegir recompensa activa
- [x] 7.5 `curl -s -X POST http://localhost:3001/api/weeks/{weekId}/redemptions -H "Content-Type: application/json" -d "{\"rewardId\":<id>}"` — validar `201` con `id`, `weekId`, `rewardId`, `pointsSpent`, `redeemedAt` (US-12 S1)
- [x] 7.6 Repetir canje hasta saldo insuficiente o usar recompensa de coste alto — validar `422` `INSUFFICIENT_POINTS` con `details.available`/`details.required` (US-12 S2)
- [x] 7.7 `curl -s -X POST http://localhost:3001/api/weeks/99999/redemptions -H "Content-Type: application/json" -d "{\"rewardId\":1}"` — validar `404` `WEEK_NOT_FOUND`
- [x] 7.8 `curl -s -X POST http://localhost:3001/api/weeks/{weekId}/redemptions -H "Content-Type: application/json" -d "{\"rewardId\":99999}"` — validar `404` `REWARD_NOT_FOUND`
- [x] 7.9 Restaurar BD: `npm run db:seed`
- [x] 7.10 Informe: `openspec/changes/t-12-02-weekid-redemptions/reports/YYYY-MM-DD-step-07-curl.md`

## 8. E2E → tasks-core §N+3 (N/A — documentado)

- [x] 8.1 **N/A:** ticket Backend Presentación HTTP sin cambios UI; E2E Playwright no aplica.

## 9. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 9.1 Actualizar `docs/api-spec.yml`: `/api/weeks/{weekId}/redemptions` POST implementado; respuestas 201/400/404/409/422; schemas `RedeemRewardRequest`, `RewardRedemptionResponse`; errores `INSUFFICIENT_POINTS`, `WEEK_LOCKED`, `WEEK_NOT_FOUND`, `REWARD_NOT_FOUND`
- [x] 9.2 Verificar snippet en `docs/backend-standards.md` (handler canje cableado; referencia T-12-02)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] C.1 Confirmar `tasks.md` completo e informes PASS
- [ ] C.2 Obtener aceptación del usuario
- [ ] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`
- [ ] C.4 `git push -u origin feature/T-12-02-weekid-redemptions`
- [ ] C.5 Merge a `develop`
- [ ] C.6 `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-12-02-weekid-redemptions/`
- [ ] C.7 `npm run openspec:mark-ticket -- --change t-12-02-weekid-redemptions`
