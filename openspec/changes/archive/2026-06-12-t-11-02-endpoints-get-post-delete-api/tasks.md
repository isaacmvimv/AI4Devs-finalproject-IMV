# Tasks — T-11-02 · Endpoints GET, POST, DELETE /api/rewards

**Ticket:** T-11-02 · **User Story:** US-11 · **Change:** `t-11-02-endpoints-get-post-delete-api` · **Rama:** `feature/T-11-02-endpoints-get-post-delete-api`

**Pasos aplicables:** unit=sí · curl=sí · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-11-02-endpoints-get-post-delete-api"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-11-02-endpoints-get-post-delete-api"`
- [x] 0.4 `git checkout -b feature/T-11-02-endpoints-get-post-delete-api`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-11-02-endpoints-get-post-delete-api`

## 1. Preparar entorno

- [x] 1.1 Revisar baseline T-11-01: `createReward`, `getActiveRewards`, `softDeleteReward`, `createPrismaRewardRepository`, `createRewardSchema` ✅
- [x] 1.2 Confirmar ausencia de rutas `/api/rewards` en `backend/src/presentation/http/createApp.ts`
- [x] 1.3 Revisar `docs/api-spec.yml` secciones `/api/rewards` y `/api/rewards/{id}` (PLANIFICADO → objetivo IMPLEMENTADO)
- [x] 1.4 Confirmar seed con recompensas demo para usuario `id=1` en `backend/prisma/seed.ts`

## 2. Wiring repositorio y rutas HTTP (DoD: GET 200, POST 201, DELETE 204/404)

- [x] 2.1 En `createApp.ts`, importar `createPrismaRewardRepository`, `createReward`, `getActiveRewards`, `softDeleteReward`, `createRewardSchema`
- [x] 2.2 Instanciar `rewardRepository = createPrismaRewardRepository(prisma)`
- [x] 2.3 Añadir helper `parseRewardIdParam` (id no numérico → `NotFoundError` `REWARD_NOT_FOUND`)
- [x] 2.4 Registrar `GET /api/rewards` → `getActiveRewards(rewardRepository, 1)` → `200` JSON array
- [x] 2.5 Registrar `POST /api/rewards` con `validateBody(createRewardSchema)` → `createReward(rewardRepository, 1, req.body)` → `201` JSON
- [x] 2.6 Registrar `DELETE /api/rewards/:id` → `softDeleteReward(rewardRepository, 1, rewardId)` → `204` sin body

## 3. Tests HTTP supertest (DoD: happy path + edge US-11 esc. 1–5)

- [x] 3.1 Ampliar `backend/src/presentation/http/createApp.test.ts` con `vi.mock` de `createReward`, `getActiveRewards`, `softDeleteReward`
- [x] 3.2 GET happy path: mock devuelve 3 rewards activos → `GET /api/rewards` → `200`, length 3, todos `isActive: true`
- [x] 3.3 GET vacío: mock devuelve `[]` → `200` con `[]`
- [x] 3.4 POST happy path: mock devuelve reward creado → `POST /api/rewards` con body válido → `201`
- [x] 3.5 POST 400: enviar `{ emoji, name, description, cost: 0 }` → `400` `VALIDATION_ERROR`, detail `field: "cost"`
- [x] 3.6 DELETE happy path: mock resuelve → `DELETE /api/rewards/3` → `204`, body vacío
- [x] 3.7 DELETE 404: mock lanza `NotFoundError('Recompensa no encontrada', 'REWARD_NOT_FOUND')` → `404` `REWARD_NOT_FOUND`
- [x] 3.8 DELETE id inválido (`abc`) → `404` sin invocar use case

## 4. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 4.1 `npm test -- backend/src/presentation/http/createApp.test.ts`
- [x] 4.2 Confirmar tests T-11-01 sin regresión: `npm test -- backend/src/application/createReward.test.ts backend/src/application/getActiveRewards.test.ts backend/src/application/softDeleteReward.test.ts` (N/A — change-only; suite completa omitida)
- [x] 4.3 Informe: `openspec/changes/t-11-02-endpoints-get-post-delete-api/reports/YYYY-MM-DD-step-04-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 5. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 5.1 `npm test` — suite backend relevante PASS (N/A — change-only; sustituido por `npm run typecheck` + tests focalizados PASS)
- [x] 5.2 `npm run dev:api` — confirmar arranque sin errores TypeScript
- [x] 5.3 Informe: `openspec/changes/t-11-02-endpoints-get-post-delete-api/reports/YYYY-MM-DD-step-05-verification.md`

## 6. curl → tasks-core §N+2 + templates/endpoint-testing.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 6.1 `npm run db:up` — PostgreSQL activo
- [x] 6.2 `npm run dev:api` — servidor en `http://localhost:3001`
- [x] 6.3 `curl -s http://localhost:3001/api/rewards` — validar `200` con recompensas activas del seed (US-11 S2)
- [x] 6.4 `curl -s -X POST http://localhost:3001/api/rewards -H "Content-Type: application/json" -d "{\"emoji\":\"🎬\",\"name\":\"Ir al cine\",\"description\":\"Tarde de peli\",\"cost\":50}"` — validar `201` con `isActive:true` (US-11 S1)
- [x] 6.5 `curl -s -X POST http://localhost:3001/api/rewards -H "Content-Type: application/json" -d "{\"emoji\":\"🎬\",\"name\":\"Test\",\"description\":\"Test\",\"cost\":0}"` — validar `400` `VALIDATION_ERROR` en `cost` (US-11 S4)
- [x] 6.6 Anotar `id` de recompensa creada en 6.4; `curl -s -X DELETE http://localhost:3001/api/rewards/{id}` — validar `204`; GET list ya no la incluye (US-11 S3)
- [x] 6.7 `curl -s -X DELETE http://localhost:3001/api/rewards/99999` — validar `404` `REWARD_NOT_FOUND`
- [x] 6.8 Restaurar BD: `npm run db:seed`
- [x] 6.9 Informe: `openspec/changes/t-11-02-endpoints-get-post-delete-api/reports/YYYY-MM-DD-step-06-curl.md`

## 7. E2E → tasks-core §N+3 (N/A — documentado)

- [x] 7.1 **N/A:** ticket Backend Presentación HTTP sin cambios UI; E2E Playwright no aplica.

## 8. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 8.1 Actualizar `docs/api-spec.yml`: `/api/rewards` GET/POST y `/api/rewards/{id}` DELETE implementados; respuestas 200/201/204/400/404; `REWARD_NOT_FOUND`; schemas `Reward` y `CreateRewardRequest`
- [x] 8.2 Verificar snippets en `docs/backend-standards.md` (handlers `/api/rewards` cableados con `validateBody(createRewardSchema)`)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] C.1 Confirmar `tasks.md` completo e informes PASS
- [x] C.2 Obtener aceptación del usuario
- [x] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`
- [x] C.4 `git push -u origin feature/T-11-02-endpoints-get-post-delete-api`
- [x] C.5 Merge a `develop`
- [x] C.6 `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-11-02-endpoints-get-post-delete-api/`
- [x] C.7 `npm run openspec:mark-ticket -- --change t-11-02-endpoints-get-post-delete-api`
