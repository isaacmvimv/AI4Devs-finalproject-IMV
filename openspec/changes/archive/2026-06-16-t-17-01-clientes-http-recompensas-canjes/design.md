# Design — T-17-01 · Infraestructura frontend: clientes HTTP para recompensas y canjes

**Ticket:** T-17-01 · **User Story:** US-17 · **Change:** `t-17-01-clientes-http-recompensas-canjes`

## Estado actual

La capa de infraestructura HTTP del frontend (`frontend/src/infrastructure/`) contiene:

- `httpClient.ts`: utilidad base `apiRequest<T>()` y `ApiError` (lanza en respuestas no-2xx).
- `habitApi.ts`: cliente tipado para hábitos (`fetchHabits`, `createHabit`, `deleteHabit`).

No existe ningún fichero `rewardApi.ts`.

## Decisiones técnicas

### 1. Seguir exactamente el patrón de `habitApi.ts`

`rewardApi.ts` tendrá la misma estructura: importar `apiRequest` y `ApiError` de `httpClient.ts`, definir interfaces DTO de entrada/salida, y exportar funciones nombradas (no una clase). Esto garantiza coherencia en la capa de infraestructura.

### 2. Manejo tipado del error 422 `INSUFFICIENT_POINTS`

El DoD exige propagar el error 422 con los campos `available` y `required`. El backend ya devuelve estos datos en el campo `details` de `ApiErrorResponse`. La función `redeemReward` capturará el `ApiError` con `status === 422 && code === 'INSUFFICIENT_POINTS'` y lo relanzará enriquecido con una interfaz `InsufficientPointsError` para que la capa de aplicación pueda discriminar fácilmente.

Alternativa descartada: devolver un tipo union en lugar de lanzar. Se descarta para mantener consistencia con `habitApi.ts` y con el patrón de `apiRequest`.

### 3. Endpoints utilizados

| Función | Método | Ruta |
|---------|--------|------|
| `fetchRewards()` | GET | `/api/rewards` |
| `createReward(input)` | POST | `/api/rewards` |
| `deleteReward(id)` | DELETE | `/api/rewards/:id` |
| `redeemReward(weekId, rewardId)` | POST | `/api/weeks/:weekId/redemptions` |

Estos endpoints están definidos en `docs/api-spec.yml` (US-11 y US-12).

## Estructura de ficheros afectados

```
frontend/src/infrastructure/
  rewardApi.ts          ← NUEVO
  rewardApi.test.ts     ← NUEVO (tests unitarios con vi.fn / msw-lite)
  habitApi.ts           ← sin cambios (referencia de convenciones)
  httpClient.ts         ← sin cambios (dependencia)
```

## Interfaces y contratos

```typescript
// DTOs (alineados con backend RewardApi)
export interface RewardApiDto {
  id: number
  userId: number
  emoji: string
  name: string
  description: string
  cost: number
  createdAt: string
}

export interface CreateRewardInput {
  emoji: string
  name: string
  description: string
  cost: number
}

// Tipo de error tipado para 422
export interface InsufficientPointsDetails {
  available: number
  required: number
}
```

## Dependencias entre tickets

- **Requiere:** T-17-01 es independiente; solo necesita `httpClient.ts` (ya existe).
- **Desbloquea:** T-17-02 (hook `useRewards` que importa `rewardApi.ts`).
