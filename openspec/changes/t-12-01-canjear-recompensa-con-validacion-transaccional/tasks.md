# Tasks — T-12-01 · Caso de uso: canjear recompensa con validación transaccional de saldo

**Ticket:** T-12-01 · **User Story:** US-12 · **Change:** `t-12-01-canjear-recompensa-con-validacion-transaccional` · **Rama:** `feature/T-12-01-canjear-recompensa-con-validacion-transaccional`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-12-01-canjear-recompensa-con-validacion-transaccional"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-12-01-canjear-recompensa-con-validacion-transaccional"`
- [x] 0.4 `git checkout -b feature/T-12-01-canjear-recompensa-con-validacion-transaccional`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-12-01-canjear-recompensa-con-validacion-transaccional`

## 1. Preparar entorno

- [x] 1.1 Confirmar modelo `RewardRedemption` en `backend/prisma/schema.prisma` (T-03-02 ✅) — sin cambios de esquema
- [x] 1.2 Confirmar `UnprocessableError`, `ConflictError` y `NotFoundError` en `backend/src/domain/errors/appErrors.ts` (T-04-02 ✅)
- [x] 1.3 Revisar patrón de referencia: `updateHabitEntry.ts` (`WEEK_LOCKED`), `rewardOwnership.ts`, `calculateWeekStats.ts`
- [x] 1.4 Confirmar `RewardRepository` y `assertRewardOwnedByUser` existentes (T-11-01 ✅)
- [x] 1.5 Verificar que no existen `redeemReward.ts`, `RewardRedemptionRepository` ni `domain/rewardRedemption.ts`

## 2. Entidad RewardRedemption (DoD: tipo de dominio)

- [x] 2.1 Crear `backend/src/domain/rewardRedemption.ts` con interface `RewardRedemption` (`id`, `weekId`, `rewardId`, `pointsSpent`, `redeemedAt`)

## 3. Helper calculateWeekAvailableBalance (DoD: fórmula de saldo)

- [x] 3.1 Crear `backend/src/application/calculateWeekAvailableBalance.ts`
- [x] 3.2 Implementar fórmula: `sum(completed × snapshotPoints) - sum(failed × snapshotPenalty) - redemptionsSpentTotal`
- [x] 3.3 Añadir `calculateWeekAvailableBalance.test.ts` — casos con entradas completed/failed y canjes previos

## 4. Puerto RewardRedemptionRepository (DoD: operación transaccional)

- [x] 4.1 Crear `backend/src/application/ports/RewardRedemptionRepository.ts` con método `redeem({ userId, weekId, rewardId, rewardCost })`
- [x] 4.2 Documentar en firma que la implementación MUST calcular saldo y crear canje en la misma transacción

## 5. Repositorio Prisma (DoD: snapshot de saldo consistente + concurrencia)

- [x] 5.1 Crear `backend/src/infrastructure/prismaRewardRedemptionRepository.ts` con factory `createPrismaRewardRedemptionRepository(prisma)`
- [x] 5.2 Implementar `redeem` con `prisma.$transaction`: lock pessimista `SELECT ... FOR UPDATE` sobre `Week`
- [x] 5.3 Cargar semana con `weekHabits`, `entries` y agregado `sum(pointsSpent)` de `RewardRedemption` para `weekId`
- [x] 5.4 Validar ownership de semana → `NotFoundError` `WEEK_NOT_FOUND` si no existe o `userId` no coincide
- [x] 5.5 Si `isLocked` → `ConflictError` `WEEK_LOCKED` (mensaje alineado a `updateHabitEntry`)
- [x] 5.6 Calcular `available` con `calculateWeekAvailableBalance`; si `available < rewardCost` → `UnprocessableError` `INSUFFICIENT_POINTS` con `{ available, required: rewardCost }`
- [x] 5.7 Crear `RewardRedemption` con `pointsSpent = rewardCost` y mapear a tipo de dominio

## 6. Caso de uso redeemReward (DoD principal)

- [x] 6.1 Crear `backend/src/application/redeemReward.ts` — firma `(redemptionRepo, rewardRepo, userId, weekId, rewardId)`
- [x] 6.2 Verificar ownership de recompensa con `assertRewardOwnedByUser` antes de delegar
- [x] 6.3 Delegar a `redemptionRepo.redeem` pasando `reward.cost` como `rewardCost`
- [x] 6.4 Retornar `RewardRedemption` creado

## 7. Tests unitarios redeemReward.test.ts (DoD + US-12 esc. 1–3)

- [x] 7.1 Crear `backend/src/application/redeemReward.test.ts` con mocks de `RewardRedemptionRepository` y `RewardRepository`
- [x] 7.2 Caso happy path: saldo ≥ cost → `redemptionRepo.redeem` invocado → retorna `RewardRedemption` (US-12 S1)
- [x] 7.3 Caso edge: saldo exacto al límite — mismo flujo exitoso
- [x] 7.4 Caso insuficiente: repo lanza `UnprocessableError` `INSUFFICIENT_POINTS` con `available`/`required` (US-12 S2)
- [x] 7.5 Caso semana bloqueada: repo lanza `ConflictError` `WEEK_LOCKED` (US-12 S3)
- [x] 7.6 Caso reward ajeno: `NotFoundError` `REWARD_NOT_FOUND`, `redeem` no invocado

## 8. Test de concurrencia (DoD + US-12 esc. 4)

- [x] 8.1 Crear test de integración (Prisma + PostgreSQL) con semana desbloqueada, saldo neto exactamente 50 pts, reward cost=50
- [x] 8.2 Ejecutar dos `redeemReward` concurrentes (`Promise.all`) — exactamente una éxito, otra `INSUFFICIENT_POINTS`
- [x] 8.3 Assert: 1 fila en `RewardRedemption`, saldo final 0 (no negativo)

## 9. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 9.1 `npm test -- backend/src/application/redeemReward.test.ts backend/src/application/calculateWeekAvailableBalance.test.ts`
- [x] 9.2 Ejecutar test de concurrencia si está en archivo separado (p. ej. `redeemReward.concurrency.test.ts`)
- [x] 9.3 Informe: `openspec/changes/t-12-01-canjear-recompensa-con-validacion-transaccional/reports/YYYY-MM-DD-step-09-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 10. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 10.1 `npm test` — confirmar tests PASS del módulo afectado (N/A — change-only; sustituido por tests focalizados + typecheck en archivos nuevos)
- [x] 10.2 `npm run dev:api` — confirmar compilación/arranque sin errores TypeScript
- [x] 10.3 Informe: `openspec/changes/t-12-01-canjear-recompensa-con-validacion-transaccional/reports/YYYY-MM-DD-step-10-verification.md`

## 11. curl → tasks-core §N+2 (N/A — documentado)

- [x] 11.1 **N/A:** ticket Backend — Aplicación sin cambios HTTP; `POST /api/weeks/:weekId/redemptions` se valida en T-12-02. No ejecutar curl en este change.

## 12. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 12.1 Actualizar snippets en `docs/backend-standards.md` con `RewardRedemptionRepository`, `redeemReward`, `calculateWeekAvailableBalance` y errores `INSUFFICIENT_POINTS`/`WEEK_LOCKED`
- [x] 12.2 Verificar `docs/data-model.md` — entidad RewardRedemption ya documentada; anotar en informe si no requiere cambios
- [x] 12.3 Verificar que no se modifica `docs/api-spec.yml` (contrato HTTP = T-12-02)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] C.1 Confirmar `tasks.md` completo e informes PASS
- [x] C.2 Obtener aceptación del usuario
- [x] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`
- [ ] C.4 `git push -u origin feature/T-12-01-canjear-recompensa-con-validacion-transaccional`
- [ ] C.5 Merge a `develop`
- [ ] C.6 `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-12-01-canjear-recompensa-con-validacion-transaccional/`
- [ ] C.7 `npm run openspec:mark-ticket -- --change t-12-01-canjear-recompensa-con-validacion-transaccional`
