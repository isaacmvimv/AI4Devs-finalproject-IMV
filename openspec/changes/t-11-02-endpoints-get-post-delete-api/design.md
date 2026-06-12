# Design — T-11-02 · Endpoints GET, POST, DELETE /api/rewards

**Ticket:** T-11-02 · **User Story:** US-11 · **Change:** `t-11-02-endpoints-get-post-delete-api`

## Context

Tras T-11-01, el vertical slice de recompensas cubre dominio, repositorio Prisma y casos de uso de aplicación. Falta la capa HTTP: cablear `RewardRepository` en `createApp.ts` y registrar las tres rutas del DoD, siguiendo el patrón ya establecido en T-07-02 (GET/POST hábitos) y T-08-01 (DELETE hábitos).

| Componente | Estado actual | Objetivo T-11-02 |
|------------|---------------|------------------|
| `domain/reward.ts` | ✅ T-11-01 | Sin cambios |
| `RewardRepository` + `prismaRewardRepository` | ✅ T-11-01 | Instanciar en `createApp.ts` |
| `createReward`, `getActiveRewards`, `softDeleteReward` | ✅ T-11-01 | Invocar desde handlers HTTP |
| `createRewardSchema` + `validateBody` | ✅ T-19-01 / T-11-01 | `validateBody(createRewardSchema)` en POST |
| `createApp.ts` | Sin rutas `/api/rewards` | Añadir GET/POST/DELETE |
| `createApp.test.ts` | Tests hábitos/semanas ✅ | Ampliar con mocks de recompensas |
| `docs/api-spec.yml` | `/api/rewards` PLANIFICADO | Marcar GET/POST/DELETE IMPLEMENTADO |

Referencias: `docs/backend-standards.md` (handlers delgados, supertest), `docs/api-spec.yml` (`Reward`, `CreateRewardRequest`), `openspec/specs/habit-http/spec.md` (patrón de referencia).

## Goals / Non-Goals

**Goals:**

- Exponer GET/POST/DELETE según DoD con `userId=1` hardcodeado (MVP).
- Handlers HTTP delgados: delegar en casos de uso T-11-01; validación POST en middleware `validateBody`.
- Errores uniformes: `ValidationError` → 400; `NotFoundError` con `REWARD_NOT_FOUND` → 404.
- Tests supertest con `vi.mock` de casos de uso (DoD del ticket).
- Actualizar OpenAPI en paso docs.

**Non-Goals:**

- Casos de uso nuevos o cambios en repositorio Prisma.
- `POST /api/rewards/:id/redeem` (T-12-01).
- PATCH de recompensas.
- Auth middleware / `userId` dinámico.
- Frontend / E2E.

## Decisions

### 1. Wiring del repositorio en `createApp.ts`

**Decisión:** Añadir junto a los demás repositorios:

```typescript
const rewardRepository = createPrismaRewardRepository(prisma)
```

Importar factory desde `../../infrastructure/prismaRewardRepository.js`.

**Rationale:** Misma convención que `habitRepository`, `weekRepository`, etc.

### 2. Handlers HTTP delgados

**Decisión:**

```typescript
app.get(
  '/api/rewards',
  asyncHandler(async (_req, res) => {
    const rewards = await getActiveRewards(rewardRepository, 1)
    return res.status(200).json(rewards)
  })
)

app.post(
  '/api/rewards',
  validateBody(createRewardSchema),
  asyncHandler(async (req, res) => {
    const reward = await createReward(rewardRepository, 1, req.body)
    return res.status(201).json(reward)
  })
)

app.delete(
  '/api/rewards/:id',
  asyncHandler(async (req, res) => {
    const rewardId = parseRewardIdParam(req.params.id)
    await softDeleteReward(rewardRepository, 1, rewardId)
    return res.status(204).send()
  })
)
```

**Rationale:** Consistente con hábitos; `validateBody` en POST evita duplicar validación (T-19-01 + backend-standards).

### 3. Helper `parseRewardIdParam`

**Decisión:** Análogo a `parseHabitIdParam`:

```typescript
function parseRewardIdParam(id: string): number {
  const rewardId = Number.parseInt(id, 10)
  if (Number.isNaN(rewardId)) {
    throw new NotFoundError('Recompensa no encontrada', 'REWARD_NOT_FOUND')
  }
  return rewardId
}
```

**Rationale:** Id no numérico → 404 sin invocar caso de uso; alineado a T-08-01.

### 4. Código de error `REWARD_NOT_FOUND`

**Decisión:** Reutilizar `NotFoundError('Recompensa no encontrada', 'REWARD_NOT_FOUND')` ya definido en `rewardOwnership.ts` (T-11-01).

**Alternativa descartada:** 403 Forbidden — el backlog exige 404 para no revelar existencia ajena (US-11 S5).

### 5. Serialización JSON de fechas

**Decisión:** Express serializa `Date` en `createdAt` como ISO string en JSON (mismo comportamiento que hábitos en GET/POST).

**Rationale:** Sin mapper DTO adicional en MVP; curl y tests validan formato ISO.

### 6. Tests HTTP con `vi.mock`

**Decisión:** Ampliar `createApp.test.ts`:

| Caso | Expectativa |
|------|-------------|
| GET happy path | 200 + array mock |
| GET vacío | 200 + `[]` |
| POST válido | 201 + cuerpo mock |
| POST `cost: 0` | 400 `VALIDATION_ERROR` (middleware real, sin mock) |
| DELETE happy | 204, body vacío |
| DELETE NotFoundError | 404 `REWARD_NOT_FOUND` |
| DELETE id inválido (`abc`) | 404 sin invocar use case |

Mocks: `createReward`, `getActiveRewards`, `softDeleteReward` — patrón idéntico a hábitos.

**Nota:** Para POST 400 con `cost: 0`, el test puede usar el schema real (no mockear validación) enviando body inválido; el middleware responde antes del use case.

### 7. Actualización `api-spec.yml`

**Decisión:** En paso docs (§N+4):

- Cambiar summaries de `(PLANIFICADO)` a implementado en `GET/POST /api/rewards` y `DELETE /api/rewards/{id}`.
- Documentar respuesta 400 en POST con `VALIDATION_ERROR`.
- Documentar 404 en DELETE con `REWARD_NOT_FOUND`.
- No modificar `/api/rewards/{id}/redeem` (sigue PLANIFICADO — T-12-01).

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Tests mockean casos de uso | DoD del ticket; curl valida persistencia real |
| `userId` hardcodeado | Consistente con hábitos/semanas; auth en ticket posterior |
| OpenAPI `Reward.id` como string vs number en BD | Mantener spec existente; respuesta JSON usa number (documentar en curl si hay discrepancia) |
| T-11-01 aún no archivado en repo | Código ya presente en `backend/src/`; verificar compilación en apply |

## Migration Plan

1. Importar casos de uso, schema, factory repo y registrar rutas en `createApp.ts`.
2. Añadir `parseRewardIdParam`.
3. Ampliar `createApp.test.ts` con mocks y casos DoD.
4. `npm test -- backend/src/presentation/http/createApp.test.ts`.
5. `npm run dev:api` + curl GET/POST/DELETE contra PostgreSQL seed.
6. Actualizar `docs/api-spec.yml`.
7. Sin migración de BD.

**Rollback:** Revertir rutas, imports y tests HTTP; dejar capa aplicación intacta.

## Open Questions

_(Ninguna bloqueante — alcance cerrado por DoD del ticket.)_
