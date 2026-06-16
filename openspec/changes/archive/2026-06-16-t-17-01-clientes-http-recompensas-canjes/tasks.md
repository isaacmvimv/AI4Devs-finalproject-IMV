# Tasks — T-17-01 · Infraestructura frontend: clientes HTTP para recompensas y canjes

**Ticket:** T-17-01 · **User Story:** US-17 · **Change:** `t-17-01-clientes-http-recompensas-canjes` · **Rama:** `feature/T-17-01-clientes-http-recompensas-canjes`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar que la rama no existe (local ni remoto): `git branch --list "feature/T-17-01-clientes-http-recompensas-canjes"` y `git branch -r --list "origin/feature/T-17-01-clientes-http-recompensas-canjes"`
- [x] 0.3 `git checkout -b feature/T-17-01-clientes-http-recompensas-canjes`
- [x] 0.4 `git branch --show-current` → debe mostrar `feature/T-17-01-clientes-http-recompensas-canjes`

## 1. Implementación — `rewardApi.ts`

- [x] 1.1 Crear `frontend/src/infrastructure/rewardApi.ts` con las interfaces `RewardApiDto` y `CreateRewardInput` (alineadas con el backend, siguiendo el patrón de `habitApi.ts`). *(DoD: mismas convenciones de errores que `habitApi.ts`)*
- [x] 1.2 Implementar `fetchRewards(): Promise<RewardApiDto[]>` → `GET /rewards`. *(DoD: función presente)*
- [x] 1.3 Implementar `createReward(input: CreateRewardInput): Promise<RewardApiDto>` → `POST /rewards`. *(DoD: función presente)*
- [x] 1.4 Implementar `deleteReward(id: number): Promise<void>` → `DELETE /rewards/:id`. *(DoD: función presente)*
- [x] 1.5 Implementar `redeemReward(weekId: number, rewardId: number): Promise<RedemptionApiDto>` → `POST /weeks/:weekId/redemptions`. *(DoD: función presente)*
- [x] 1.6 En `redeemReward`, capturar `ApiError` con `status === 422 && code === 'INSUFFICIENT_POINTS'` y relanzarlo con los campos `details.available` y `details.required` correctamente tipados. *(DoD: maneja específicamente el error 422 INSUFFICIENT_POINTS y lo propaga tipado)*

## 2. Tests unitarios — `rewardApi.test.ts`

- [x] 2.1 Crear `frontend/src/infrastructure/rewardApi.test.ts` con mock de `fetch` (usando `vi.fn()` o `vi.spyOn(globalThis, 'fetch')`).
- [x] 2.2 Test happy path de `redeemReward`: mock responde 201, verificar que se llama a `POST /api/weeks/:id/redemptions` y se retorna el resultado. *(Alineación AC: US-17 Scenario 2, US-12 S2)*
- [x] 2.3 Test edge case de `redeemReward`: mock responde 422 con `{ code: 'INSUFFICIENT_POINTS', message: '...', details: { available: 30, required: 80 } }`, verificar que lanza `ApiError` con `status=422`, `code='INSUFFICIENT_POINTS'` y `details` con `available`/`required`. *(Alineación AC: US-17 Scenario 5)*

## 3. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

EL AGENTE DEBE EJECUTAR:

- [x] 3.1 Ejecutar tests focalizados: `cd frontend && npx vitest run src/infrastructure/rewardApi.test.ts`
- [x] 3.2 Ejecutar typecheck: `cd frontend && npx tsc --noEmit`
- [x] 3.3 Ejecutar suite completa de tests: `cd frontend && npx vitest run` (N/A — change-only; suite completa omitida)
- [x] 3.4 Registrar resultado en `openspec/changes/t-17-01-clientes-http-recompensas-canjes/reports/YYYY-MM-DD-step-03-verification.md`

## 4. curl → N/A

Este ticket es de infraestructura frontend pura; no crea ni modifica endpoints del backend. No aplica paso de curl.

## 5. E2E → N/A

No hay componentes UI en este ticket. Las funciones de `rewardApi.ts` son infraestructura pura validada por tests unitarios. No aplica Playwright.

## 6. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 6.1 Revisar si `docs/frontend-standards.md` menciona patrones de `infrastructure/` que deban actualizarse con el nuevo fichero (probable que no requiera cambios).
- [x] 6.2 No actualizar `api-spec.yml` ni `data-model.md` (este ticket no modifica contratos del backend).

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [ ] Confirmar `tasks.md` completo e informes PASS.
- [ ] Obtener aceptación del usuario.
- [ ] Commit único en feature (viñetas).
- [ ] `git push -u origin feature/T-17-01-clientes-http-recompensas-canjes`
- [ ] Merge a `develop`.
- [ ] `mv openspec/changes/t-17-01-clientes-http-recompensas-canjes openspec/changes/archive/YYYY-MM-DD-t-17-01-clientes-http-recompensas-canjes`
- [ ] `npm run openspec:mark-ticket -- --change t-17-01-clientes-http-recompensas-canjes`
