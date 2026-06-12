# Design — T-11-01 · Dominio, repositorio y casos de uso de recompensas

**Ticket:** T-11-01 · **User Story:** US-11 · **Change:** `t-11-01-dominio-repositorio-recompensas`

## Context

El monorepo tiene infraestructura backend lista (T-04-01 ✅) y modelo Prisma `Reward` migrado (T-03-02 ✅) con seed demo (T-03-03 ✅). Patrón de referencia directo: T-07-01 (`Habit`, `HabitRepository`, `createHabit`, `getActiveHabits`, `deactivateHabit`).

| Componente | Estado actual | Objetivo T-11-01 |
|------------|---------------|------------------|
| `backend/prisma/schema.prisma` → `Reward` | Modelo completo ✅; FK `RewardRedemption` con `onDelete: Restrict` | Sin cambios de esquema |
| `backend/src/domain/reward.ts` | No existe | Tipo `Reward` + `CreateRewardData` |
| `backend/src/application/ports/RewardRepository.ts` | No existe | Puerto con 4 métodos (DoD) |
| `backend/src/infrastructure/prismaRewardRepository.ts` | No existe | Implementación Prisma |
| `backend/src/application/validation/reward.ts` | `createRewardSchema` ✅ (T-19-01); sin `parseCreateRewardInput` | Completar parser + `ValidationError` |
| `backend/src/application/createReward.ts` | No existe | Validación + `repo.create` |
| `backend/src/application/getActiveRewards.ts` | No existe | Delegación a `findActiveByUserId` |
| `backend/src/application/softDeleteReward.ts` | No existe | Ownership + `repo.softDelete` |
| `backend/src/application/rewardOwnership.ts` | No existe | Patrón `habitOwnership.ts` |
| `backend/src/presentation/http/createApp.ts` | Sin rutas `/api/rewards` | **Sin cambios** (T-11-02) |
| `frontend/src/domain/reward.ts` | Estado React local | **Sin cambios** (frontend posterior) |

Referencias: `docs/backend-standards.md`, `docs/data-model.md` (entidad Reward), `docs/api-spec.yml` (contrato futuro — no implementar aquí).

## Goals / Non-Goals

**Goals:**

- Implementar vertical slice dominio + aplicación + infraestructura para crear, listar activas y desactivar recompensas según DoD del ticket.
- Validación Zod con mensajes en español alineados a US-11 esc. 1 y 4.
- Baja lógica sin eliminar `RewardRedemption` (solo `update isActive` en `Reward`).
- Tests unitarios con mock de repositorio (patrón `createHabit.test.ts`).

**Non-Goals:**

- Rutas Express `GET/POST/DELETE /api/rewards` — T-11-02.
- Wiring de `rewardRepository` en `createApp.ts` — T-11-02 al registrar endpoints.
- Caso de uso `redeemReward` — T-12-01.
- Migración frontend desde fixtures.

## Decisions

### 1. Tipo `Reward` como interface de dominio

**Decisión:** `export interface Reward { ... }` en `domain/reward.ts`, igual que `Habit` y `UserProfile`.

### 2. Tipo de datos del puerto separado del input HTTP

**Decisión:**

```typescript
// domain/reward.ts
export interface CreateRewardData {
  userId: number
  emoji: string
  name: string
  description: string
  cost: number
}
```

El caso de uso `createReward` recibe `input: unknown`, valida con Zod, y construye `CreateRewardData` con `userId` inyectado.

### 3. Reutilizar `createRewardSchema` y añadir `parseCreateRewardInput`

**Decisión:** Ampliar `application/validation/reward.ts` existente:

```typescript
export function parseCreateRewardInput(input: unknown): CreateRewardInput {
  const result = createRewardSchema.safeParse(input)
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'input',
      message: issue.message,
    }))
    throw new ValidationError('Datos inválidos', details)
  }
  return result.data
}
```

**Rationale:** El schema ya existe (T-19-01, usado en `validateBody.test.ts`); evita duplicación y prepara T-11-02 (`validateBody(createRewardSchema)`).

### 4. `softDelete` como `update` con `isActive: false`

**Decisión:** `softDelete(id)` ejecuta `prisma.reward.update({ where: { id }, data: { isActive: false } })`.

**Rationale:** Cumple DoD y US-11 esc. 3. No toca `RewardRedemption`; Prisma FK `onDelete: Restrict` impide borrado físico con canjes históricos.

### 5. `findActiveByUserId` con filtro Prisma explícito

**Decisión:**

```typescript
prisma.reward.findMany({
  where: { userId, isActive: true },
  orderBy: { createdAt: 'asc' },
})
```

### 6. Ownership helper `assertRewardOwnedByUser`

**Decisión:** Crear `rewardOwnership.ts` análogo a `habitOwnership.ts`:

```typescript
export async function assertRewardOwnedByUser(
  repo: RewardRepository,
  rewardId: number,
  userId: number
): Promise<Reward> {
  const reward = await repo.findById(rewardId)
  if (!reward || reward.userId !== userId) {
    throw new NotFoundError('Recompensa no encontrada', 'REWARD_NOT_FOUND')
  }
  return reward
}
```

`softDeleteReward` llama a `assertRewardOwnedByUser` antes de `repo.softDelete`.

### 7. Factory `createPrismaRewardRepository(prisma: PrismaClient)`

**Decisión:** Misma convención que `createPrismaHabitRepository`; función pura que retorna objeto que implementa el puerto.

### 8. Tests: mock manual del puerto (sin Prisma)

**createReward.test.ts:**
1. Input válido → `repo.create` llamado con `userId` + campos → retorna reward (US-11 S1).
2. `cost: 0` → `ValidationError`, `create` no llamado (US-11 S4).
3. `name` vacío → `ValidationError`.
4. Sin `emoji` → `ValidationError`.

**getActiveRewards.test.ts:**
1. Repo devuelve 3 rewards activos → mismo array al caller (US-11 S2).
2. Repo devuelve `[]` → `[]`.

**softDeleteReward.test.ts:**
1. Reward propio → `repo.softDelete` llamado → retorna con `isActive: false` (US-11 S3).
2. Reward de otro usuario → `NotFoundError`, `softDelete` no llamado (US-11 S5).
3. Reward inexistente → `NotFoundError`.

### 9. Firma de casos de uso

**Decisión:**
- `createReward(repo, userId, input)`
- `getActiveRewards(repo, userId)`
- `softDeleteReward(repo, userId, rewardId)`

Consistente con `createHabit` / `getActiveHabits` / `deactivateHabit`.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Duplicación de reglas entre Zod y `data-model.md` | Mensajes alineados a US-11; verificar en paso N+4 |
| `createApp` no cablea repo hasta T-11-02 | No importar repo en presentation en este ticket |
| Seed demo con rewards fijos | Tests unitarios no tocan BD |
| `description` obligatoria en schema vs opcional en UI | Mantener schema T-19-01 (`min(1)`); alineado a `api-spec.yml` |

## Migration Plan

1. Crear `domain/reward.ts` → compilar.
2. Crear puerto en `application/ports/RewardRepository.ts`.
3. Implementar `prismaRewardRepository.ts`.
4. Ampliar `validation/reward.ts` con `parseCreateRewardInput`.
5. Añadir `rewardOwnership.ts`, `createReward.ts`, `getActiveRewards.ts`, `softDeleteReward.ts`.
6. Añadir tests; ejecutar `npm test -- backend/src/application/createReward.test.ts backend/src/application/getActiveRewards.test.ts backend/src/application/softDeleteReward.test.ts`.
7. Verificación: `npm test` + `npm run dev:api` (compilación).
8. Sin migración Prisma (tabla `Reward` ya existe).

**Rollback:** Eliminar archivos nuevos bajo `domain/`, `application/`, `infrastructure/` relacionados con recompensas.

## Open Questions

_(Ninguna bloqueante — alcance cerrado por DoD del ticket.)_
