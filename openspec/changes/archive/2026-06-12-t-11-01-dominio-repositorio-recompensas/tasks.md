# Tasks — T-11-01 · Dominio, repositorio y casos de uso de recompensas

**Ticket:** T-11-01 · **User Story:** US-11 · **Change:** `t-11-01-dominio-repositorio-recompensas` · **Rama:** `feature/T-11-01-dominio-repositorio-recompensas`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-11-01-dominio-repositorio-recompensas"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-11-01-dominio-repositorio-recompensas"`
- [x] 0.4 `git checkout -b feature/T-11-01-dominio-repositorio-recompensas`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-11-01-dominio-repositorio-recompensas`

## 1. Preparar entorno

- [x] 1.1 Confirmar modelo `Reward` y relación `RewardRedemption` en `backend/prisma/schema.prisma` (T-03-02 ✅) — sin cambios de esquema
- [x] 1.2 Confirmar `ValidationError` y `NotFoundError` en `backend/src/domain/errors/appErrors.ts` (T-04-02 ✅)
- [x] 1.3 Revisar patrón de referencia: `createHabit.ts`, `prismaHabitRepository.ts`, `habitOwnership.ts`, `createHabit.test.ts`
- [x] 1.4 Confirmar `createRewardSchema` existente en `backend/src/application/validation/reward.ts` (T-19-01 ✅)
- [x] 1.5 Verificar que no existen `domain/reward.ts`, `RewardRepository` ni casos de uso de recompensas en `backend/src/`

## 2. Entidad Reward (DoD: tipo de dominio)

- [x] 2.1 Crear `backend/src/domain/reward.ts` con interface `Reward` (`id`, `userId`, `emoji`, `name`, `description`, `cost`, `isActive`, `createdAt`)
- [x] 2.2 Añadir tipo `CreateRewardData` según design.md

## 3. Puerto RewardRepository (DoD: create, findActiveByUserId, findById, softDelete)

- [x] 3.1 Crear `backend/src/application/ports/RewardRepository.ts` con las cuatro firmas del DoD
- [x] 3.2 Importar tipos desde `domain/reward.ts`

## 4. Repositorio Prisma (DoD: PrismaRewardRepository)

- [x] 4.1 Crear `backend/src/infrastructure/prismaRewardRepository.ts` con factory `createPrismaRewardRepository(prisma)`
- [x] 4.2 Implementar `create` — insert con `isActive: true` por defecto, mapeo a `Reward`
- [x] 4.3 Implementar `findActiveByUserId` — `where: { userId, isActive: true }`, orden por `createdAt`
- [x] 4.4 Implementar `findById` — retorno `null` si no existe
- [x] 4.5 Implementar `softDelete` — `isActive: false` sin borrado físico ni cascada sobre `RewardRedemption`

## 5. Validación Zod (DoD: createReward valida name, cost > 0, emoji)

- [x] 5.1 Ampliar `backend/src/application/validation/reward.ts` con `parseCreateRewardInput(input: unknown)`
- [x] 5.2 Mapear errores Zod a `ValidationError` con `details: [{ field, message }]` en español (US-11 esc. 4)

## 6. Ownership helper (DoD: softDelete reward ajeno → NotFound)

- [x] 6.1 Crear `backend/src/application/rewardOwnership.ts` con `assertRewardOwnedByUser(repo, rewardId, userId)`
- [x] 6.2 Lanzar `NotFoundError` con código `REWARD_NOT_FOUND` si no existe o `userId` no coincide (US-11 esc. 5)

## 7. Caso de uso createReward (DoD + US-11 esc. 1, 4)

- [x] 7.1 Crear `backend/src/application/createReward.ts` — firma `(repo, userId, input)`
- [x] 7.2 Validar con `parseCreateRewardInput`; construir `CreateRewardData` con `userId`
- [x] 7.3 Delegar a `repo.create` y retornar `Reward` creado con `isActive: true`

## 8. Caso de uso getActiveRewards (DoD + US-11 esc. 2)

- [x] 8.1 Crear `backend/src/application/getActiveRewards.ts` — firma `(repo, userId)`
- [x] 8.2 Delegar a `repo.findActiveByUserId(userId)` y retornar array (vacío si no hay activas)

## 9. Caso de uso softDeleteReward (DoD + US-11 esc. 3, 5)

- [x] 9.1 Crear `backend/src/application/softDeleteReward.ts` — firma `(repo, userId, rewardId)`
- [x] 9.2 Verificar ownership con `assertRewardOwnedByUser`
- [x] 9.3 Delegar a `repo.softDelete(rewardId)` y retornar `Reward` con `isActive: false`

## 10. Tests unitarios createReward.test.ts (DoD + US-11 esc. 1, 4)

- [x] 10.1 Crear `backend/src/application/createReward.test.ts` con mock de `RewardRepository`
- [x] 10.2 Caso happy path: input válido → `repo.create` llamado con `userId` y campos → retorna recompensa (US-11 S1)
- [x] 10.3 Caso edge: `cost: 0` → `ValidationError`, `create` no invocado (US-11 S4)
- [x] 10.4 Caso edge: `name` vacío/ausente → `ValidationError`
- [x] 10.5 Caso edge: sin `emoji` → `ValidationError`

## 11. Tests unitarios getActiveRewards.test.ts (DoD + US-11 esc. 2)

- [x] 11.1 Crear `backend/src/application/getActiveRewards.test.ts` con mock de `RewardRepository`
- [x] 11.2 Caso happy path: repo devuelve recompensas activas → mismo array al caller
- [x] 11.3 Caso edge: repo devuelve `[]` → use case retorna `[]`

## 12. Tests unitarios softDeleteReward.test.ts (DoD + US-11 esc. 3, 5)

- [x] 12.1 Crear `backend/src/application/softDeleteReward.test.ts` con mock de `RewardRepository`
- [x] 12.2 Caso happy path: reward propio → `repo.softDelete` llamado → retorna con `isActive: false` (US-11 S3)
- [x] 12.3 Caso edge: reward de otro usuario → `NotFoundError`, `softDelete` no invocado (US-11 S5)
- [x] 12.4 Caso edge: reward inexistente → `NotFoundError`

## 13. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 13.1 `npm test -- backend/src/application/createReward.test.ts backend/src/application/getActiveRewards.test.ts backend/src/application/softDeleteReward.test.ts`
- [x] 13.2 Ejecutar suite backend relevante si existe agrupación en `package.json` (N/A — change-only; suite completa omitida)
- [x] 13.3 Informe: `openspec/changes/t-11-01-dominio-repositorio-recompensas/reports/2026-06-12-step-13-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 14. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 14.1 `npm test` — confirmar tests PASS del módulo afectado (N/A — change-only; sustituido por tests focalizados PASS + sin errores TS en archivos reward)
- [x] 14.2 `npm run dev:api` — confirmar compilación/arranque sin errores TypeScript
- [x] 14.3 Informe: `openspec/changes/t-11-01-dominio-repositorio-recompensas/reports/2026-06-12-step-14-verification.md`

## 15. curl → tasks-core §N+2 (N/A — documentado)

- [x] 15.1 **N/A:** ticket Backend Dominio + Aplicación + Infraestructura sin cambios HTTP; `GET/POST/DELETE /api/rewards` se validan en T-11-02. No ejecutar curl en este change.

## 16. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 16.1 Actualizar snippets en `docs/backend-standards.md` donde falten `RewardRepository`, `createReward`, `getActiveRewards`, `softDeleteReward` o validación Zod de recompensas
- [x] 16.2 Verificar `docs/data-model.md` — entidad Reward ya documentada; anotar en informe si no requiere cambios
- [x] 16.3 Verificar que no se modifica `docs/api-spec.yml` (contrato HTTP = T-11-02)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] C.1 Confirmar `tasks.md` completo e informes PASS
- [x] C.2 Obtener aceptación del usuario
- [x] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`
- [x] C.4 `git push -u origin feature/T-11-01-dominio-repositorio-recompensas`
- [x] C.5 Merge a `develop`
- [x] C.6 `mv` change → `openspec/changes/archive/2026-06-12-t-11-01-dominio-repositorio-recompensas/`
- [x] C.7 `npm run openspec:mark-ticket -- --change t-11-01-dominio-repositorio-recompensas`
