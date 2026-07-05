# Design — T-12-02 · Endpoint POST /api/weeks/:weekId/redemptions

**Ticket:** T-12-02 · **User Story:** US-12 · **Change:** `t-12-02-weekid-redemptions`

## Context

Tras T-12-01, el vertical slice de canje cubre dominio, repositorio transaccional Prisma y caso de uso `redeemReward`. Falta la capa HTTP: cablear `RewardRedemptionRepository` en `createApp.ts` y registrar la ruta del DoD, siguiendo el patrón de T-11-02 (recompensas) y T-10-01 (entradas de hábito con `WEEK_LOCKED`).

| Componente | Estado actual | Objetivo T-12-02 |
|------------|---------------|------------------|
| `domain/rewardRedemption.ts` | ✅ T-12-01 | Sin cambios |
| `RewardRedemptionRepository` + `prismaRewardRedemptionRepository` | ✅ T-12-01 | Instanciar en `createApp.ts` |
| `redeemReward` | ✅ T-12-01 | Invocar desde handler HTTP |
| `rewardRepository` | ✅ T-11-02 (ya cableado) | Reutilizar instancia existente |
| `createApp.ts` | Sin ruta de canjes | Añadir `POST /api/weeks/:weekId/redemptions` |
| `createApp.test.ts` | Tests hábitos/semanas/recompensas ✅ | Ampliar con mocks de `redeemReward` |
| `docs/api-spec.yml` | `/api/rewards/{id}/redeem` PLANIFICADO (ruta legacy) | Añadir `/api/weeks/{weekId}/redemptions` IMPLEMENTADO |

Referencias: `docs/backend-standards.md` (§ Canje T-12-01), `openspec/specs/habit-entry-http/spec.md` (patrón `WEEK_LOCKED` → 409), `openspec/specs/reward-http/spec.md` (patrón wiring + supertest).

## Goals / Non-Goals

**Goals:**

- Exponer `POST /api/weeks/:weekId/redemptions` según DoD con `userId=1` hardcodeado (MVP).
- Handler HTTP delgado: delegar en `redeemReward`; validación body en middleware `validateBody`.
- Errores uniformes vía `errorHandler`: `ValidationError` → 400; `NotFoundError` → 404; `ConflictError` → 409; `UnprocessableError` → 422 con `details`.
- Serializar `redeemedAt` como ISO string en respuesta 201.
- Tests supertest con `vi.mock` de `redeemReward` (DoD del ticket).
- Actualizar OpenAPI en paso docs.

**Non-Goals:**

- Cambios en caso de uso, repositorio Prisma o tests de concurrencia (T-12-01).
- Poblar `redemptions` en respuestas de semana (`mapWeekToApiResponse` sigue con `[]`).
- Endpoint `POST /api/rewards/:id/redeem` (legacy en api-spec).
- Auth middleware / `userId` dinámico.
- Frontend / E2E.

## Decisions

### 1. Wiring de repositorios en `createApp.ts`

**Decisión:** Añadir junto a `rewardRepository`:

```typescript
const rewardRedemptionRepository = createPrismaRewardRedemptionRepository(prisma)
```

Importar factory desde `../../infrastructure/prismaRewardRedemptionRepository.js`.

**Rationale:** Misma convención que demás repositorios; `rewardRepository` ya existe para ownership en `redeemReward`.

### 2. Handler HTTP delgado

**Decisión:**

```typescript
app.post(
  '/api/weeks/:weekId/redemptions',
  validateBody(redeemRewardSchema),
  asyncHandler(async (req, res) => {
    const weekId = parseWeekIdParam(req.params.weekId)
    const redemption = await redeemReward(
      rewardRedemptionRepository,
      rewardRepository,
      1,
      weekId,
      req.body.rewardId
    )
    return res.status(201).json({
      id: redemption.id,
      weekId: redemption.weekId,
      rewardId: redemption.rewardId,
      pointsSpent: redemption.pointsSpent,
      redeemedAt: redemption.redeemedAt.toISOString(),
    })
  })
)
```

**Rationale:** DTO explícito en handler (como `PATCH /api/habit-entries/:id`) para controlar serialización de fechas; caso de uso devuelve `Date`.

### 3. Schema Zod `redeemRewardSchema`

**Decisión:** Crear `backend/src/application/validation/rewardRedemption.ts`:

```typescript
export const redeemRewardSchema = z.object({
  rewardId: z.number().int().positive({ message: 'Debe ser un entero positivo' }),
})
```

**Alternativa descartada:** Validar `rewardId` solo en handler — inconsistente con `createRewardSchema` (T-11-02).

### 4. Helper `parseWeekIdParam`

**Decisión:** Análogo a `parseRewardIdParam`:

```typescript
function parseWeekIdParam(id: string): number {
  const weekId = Number.parseInt(id, 10)
  if (Number.isNaN(weekId)) {
    throw new NotFoundError('Semana no encontrada', 'WEEK_NOT_FOUND')
  }
  return weekId
}
```

**Rationale:** `:weekId` no numérico → 404 sin invocar caso de uso; alineado a parsers existentes.

### 5. Formato de error `INSUFFICIENT_POINTS`

**Decisión:** Mantener convención `errorHandler` existente: `available` y `required` en propiedad `details`, no en raíz del JSON.

```json
{
  "code": "INSUFFICIENT_POINTS",
  "message": "Puntos insuficientes",
  "details": { "available": 30, "required": 50 }
}
```

**Rationale:** T-12-01 ya implementa `UnprocessableError` con `details`; `errorHandler` no aplana campos. Tests HTTP deben assertar `details`, coherente con `redeemReward.test.ts` y `redeemReward.concurrency.test.ts`.

**Nota:** El Gherkin del backlog muestra `available`/`required` en raíz; la implementación real del proyecto usa `details` (documentar en `api-spec.yml`).

### 6. Tests HTTP con `vi.mock`

**Decisión:** Ampliar `createApp.test.ts`:

| Caso | Expectativa |
|------|-------------|
| POST 201 happy path | Mock devuelve `RewardRedemption` → `201` con campos DoD (US-12 S1) |
| POST 422 insuficiente | Mock lanza `UnprocessableError` `INSUFFICIENT_POINTS` → `422` + `details` (US-12 S2) |
| POST 409 bloqueada | Mock lanza `ConflictError` `WEEK_LOCKED` → `409` (US-12 S3) |
| POST 404 semana | Mock lanza `NotFoundError` `WEEK_NOT_FOUND` → `404` |
| POST 404 recompensa | Mock lanza `NotFoundError` `REWARD_NOT_FOUND` → `404` |
| POST 400 body inválido | `{}` o `rewardId` inválido → `400` `VALIDATION_ERROR` |
| POST 404 weekId inválido | `abc` en path → `404` sin invocar use case |

**Rationale:** Mismo patrón que T-11-02; lógica transaccional ya cubierta en T-12-01.

### 7. OpenAPI

**Decisión:** Añadir path `/api/weeks/{weekId}/redemptions` POST con schemas `RedeemRewardRequest` (`rewardId`) y `RewardRedemptionResponse`. Marcar `/api/rewards/{id}/redeem` como obsoleto o eliminarlo del spec (ruta nunca implementada; backlog usa `/api/weeks/:weekId/redemptions`).

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Discrepancia Gherkin vs `details` en 422 | Documentar en api-spec; tests assertan forma real del `errorHandler` |
| Canje sobre recompensa `isActive=false` | `assertRewardOwnedByUser` no filtra activas; devuelve 404 `REWARD_NOT_FOUND` si soft-deleted — comportamiento aceptable en MVP |
| Mutaciones curl alteran seed | Restaurar con `npm run db:seed` tras pruebas (tasks §curl) |

## Migration Plan

1. Implementar ruta en `createApp.ts` (sin cambios de schema Prisma).
2. Desplegar backend; clientes nuevos usan `POST /api/weeks/:weekId/redemptions`.
3. No hay rollback de datos; canjes creados persisten en `RewardRedemption`.

## Open Questions

_(Ninguna bloqueante — dependencias T-12-01 y T-11-02 verificadas en código.)_
