# Design — T-12-01 · Caso de uso: canjear recompensa con validación transaccional de saldo

**Ticket:** T-12-01 · **User Story:** US-12 · **Change:** `t-12-01-canjear-recompensa-con-validacion-transaccional`

## Context

El backend tiene recompensas operativas (T-11-01 ✅, T-11-02 ✅), semanas con entradas de hábito (T-09-01/02 ✅, T-10-01 ✅) y errores tipados (`UnprocessableError`, `ConflictError` — T-04-02 ✅). El modelo Prisma incluye `RewardRedemption` con índice en `weekId`. No existe lógica de canje ni cálculo de saldo neto (puntos − penalizaciones − canjes).

| Componente | Estado actual | Objetivo T-12-01 |
|------------|---------------|------------------|
| `backend/prisma/schema.prisma` → `RewardRedemption` | Modelo completo ✅ | Sin cambios de esquema |
| `backend/src/domain/rewardRedemption.ts` | No existe | Tipo `RewardRedemption` |
| `backend/src/application/calculateWeekStats.ts` | Suma puntos/penalizaciones por entradas ✅ | Reutilizar lógica parcial para saldo bruto |
| `backend/src/application/mapWeekToApiResponse.ts` | `redemptions: []` hardcodeado | **Sin cambios** (T-12-02 / tickets posteriores) |
| `backend/src/application/redeemReward.ts` | No existe | Caso de uso principal |
| `backend/src/application/ports/RewardRedemptionRepository.ts` | No existe | Puerto con `redeem` transaccional |
| `backend/src/infrastructure/prismaRewardRedemptionRepository.ts` | No existe | `prisma.$transaction` + lock |
| `backend/src/presentation/http/createApp.ts` | Sin ruta de canjes | **Sin cambios** (T-12-02) |

Referencias: `docs/backend-standards.md`, `docs/data-model.md` (§7 RewardRedemption), patrón `updateHabitEntry.ts` para `WEEK_LOCKED`.

## Goals / Non-Goals

**Goals:**

- Implementar `redeemReward` con cálculo de saldo y persistencia atómicos según DoD del ticket.
- Errores tipados alineados a US-12 esc. 1–4 y mapeo HTTP futuro (422/409 vía T-04-02).
- Tests unitarios con mock + test de concurrencia contra Prisma real para el DoD de race condition.

**Non-Goals:**

- Endpoint `POST /api/weeks/:weekId/redemptions` — T-12-02.
- Wiring en `createApp.ts` — T-12-02.
- Actualizar `docs/api-spec.yml` — T-12-02.
- Poblar `redemptions` en respuestas de semana — tickets posteriores.
- Restricción de canjes múltiples de la misma recompensa — fuera del DoD.

## Decisions

### 1. Tipo `RewardRedemption` como interface de dominio

**Decisión:** `export interface RewardRedemption { id, weekId, rewardId, pointsSpent, redeemedAt }` en `domain/rewardRedemption.ts`.

### 2. Puerto `RewardRedemptionRepository` con método transaccional único

**Decisión:**

```typescript
export interface RewardRedemptionRepository {
  redeem(params: {
    userId: number
    weekId: number
    rewardId: number
    rewardCost: number
  }): Promise<RewardRedemption>
}
```

La implementación Prisma encapsula lectura de semana + entradas + suma de canjes + validaciones + insert en **una** `$transaction`. El caso de uso obtiene el `cost` vía `assertRewardOwnedByUser` antes de delegar.

**Alternativa descartada:** Dividir en `getBalance` + `create` en dos llamadas al repo — viola el DoD de snapshot consistente.

### 3. Fórmula de saldo en helper puro

**Decisión:** Crear `calculateWeekAvailableBalance(week: WeekWithDetails, redemptionsSpentTotal: number): number`:

```typescript
// earned = sum(completed × snapshotPoints)
// penalties = sum(failed × snapshotPenalty)
// available = earned - penalties - redemptionsSpentTotal
```

Reutiliza la misma regla que `calculateWeekStats` para earned/penalties (iterar `weekHabit.entries` con `snapshotPoints`/`snapshotPenalty`), sin incluir `lastWeekPoints` (saldo de canje es presupuesto de la semana actual, no arrastre).

### 4. Concurrencia: lock pessimista sobre `Week`

**Decisión:** Dentro de la transacción Prisma, ejecutar `SELECT ... FROM "Week" WHERE id = $1 FOR UPDATE` (vía `$queryRaw` o equivalente) antes de calcular saldo y crear el canje.

**Rationale:** Garantiza US-12 esc. 4 — dos peticiones concurrentes serializan sobre la fila `Week`; la segunda ve el canje de la primera al recalcular `sum(pointsSpent)`.

**Alternativa descartada:** Confiar solo en aislamiento `Read Committed` sin lock — insuficiente para el test de concurrencia del DoD.

### 5. Orden de validaciones en la transacción

**Decisión (dentro de `redeem` en infra):**

1. Lock + cargar `Week` con `weekHabits` + `entries` + agregado de `RewardRedemption.pointsSpent` para `weekId`.
2. Si semana no existe o `userId` ≠ → `NotFoundError('Semana no encontrada', 'WEEK_NOT_FOUND')`.
3. Si `isLocked` → `ConflictError('No se puede modificar una semana bloqueada', 'WEEK_LOCKED')` (mismo mensaje que `updateHabitEntry`).
4. Calcular `available` con `calculateWeekAvailableBalance`.
5. Si `available < rewardCost` → `UnprocessableError('Puntos insuficientes', 'INSUFFICIENT_POINTS', { available, required: rewardCost })`.
6. `prisma.rewardRedemption.create({ data: { weekId, rewardId, pointsSpent: rewardCost } })`.

**Decisión (en caso de uso, fuera de tx):**

- `assertRewardOwnedByUser(rewardRepo, rewardId, userId)` — reutiliza T-11-01; lanza `REWARD_NOT_FOUND` si no existe o no pertenece.

### 6. Firma del caso de uso

**Decisión:**

```typescript
export async function redeemReward(
  redemptionRepo: RewardRedemptionRepository,
  rewardRepo: RewardRepository,
  userId: number,
  weekId: number,
  rewardId: number
): Promise<RewardRedemption>
```

Consistente con `createReward(repo, userId, input)` y `updateHabitEntry(repo, userId, ...)`.

### 7. Factory `createPrismaRewardRedemptionRepository(prisma: PrismaClient)`

**Decisión:** Misma convención que `createPrismaRewardRepository`; recibe `PrismaClient` y retorna implementación del puerto.

### 8. Tests

**redeemReward.test.ts (mock del puerto):**

1. Happy path — repo devuelve redemption → mismo objeto (US-12 S1).
2. Repo lanza `INSUFFICIENT_POINTS` → propaga error con `available`/`required` (US-12 S2).
3. Repo lanza `WEEK_LOCKED` → propaga `ConflictError` (US-12 S3).
4. Reward ajeno → `NotFoundError` antes de llamar al repo.

**redeemReward.concurrency.test.ts o bloque en test de integración (Prisma + PostgreSQL):**

1. Seed semana desbloqueada con entradas que sumen exactamente 50 pts netos, reward cost=50.
2. `Promise.all([redeemReward(...), redeemReward(...)])`.
3. Assert: una resolución exitosa, una rechazo `INSUFFICIENT_POINTS`, exactamente 1 fila en `RewardRedemption`, saldo final 0.

**Alternativa:** Si Vitest no permite fácilmente concurrencia real, usar test de integración con `prisma.$transaction` simulando dos callbacks secuenciales que demuestren el lock — preferir test real contra BD de test si Docker está disponible.

### 9. Sin cambios en `createApp.ts`

**Decisión:** No cablear `rewardRedemptionRepository` en presentation en este ticket; T-12-02 lo hará al registrar el endpoint.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Duplicación de lógica earned/penalties vs `calculateWeekStats` | Extraer helper compartido o documentar que ambos deben mantener la misma fórmula; considerar refactor mínimo en apply |
| Test de concurrencia flaky en CI | Usar PostgreSQL real (docker compose); repetir assertion sobre conteo de filas |
| `$queryRaw` FOR UPDATE acopla a PostgreSQL | Aceptable — proyecto ya usa PostgreSQL exclusivamente |
| Recompensa `isActive=false` canjeable | `assertRewardOwnedByUser` no filtra activas; T-12-02 puede añadir regla HTTP; opcional rechazar en apply con `ValidationError` |

## Migration Plan

1. Crear `domain/rewardRedemption.ts`.
2. Crear puerto `RewardRedemptionRepository`.
3. Implementar `calculateWeekAvailableBalance.ts`.
4. Implementar `prismaRewardRedemptionRepository.ts` con transacción + lock.
5. Crear `redeemReward.ts`.
6. Añadir tests; ejecutar `npm test -- backend/src/application/redeemReward.test.ts`.
7. Verificación: `npm test` + `npm run dev:api` (compilación).
8. Sin migración Prisma (tabla `RewardRedemption` ya existe).

**Rollback:** Eliminar archivos nuevos bajo `domain/`, `application/`, `infrastructure/` relacionados con canje.

## Open Questions

_(Ninguna bloqueante — alcance cerrado por DoD del ticket.)_
