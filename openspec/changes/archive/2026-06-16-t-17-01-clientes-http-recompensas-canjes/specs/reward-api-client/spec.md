# Spec — reward-api-client

**Ticket:** T-17-01 · **User Story:** US-17 · **Change:** `t-17-01-clientes-http-recompensas-canjes`

## Descripción

Cliente HTTP tipado para las operaciones de recompensas y canjes en el frontend. Implementado en `frontend/src/infrastructure/rewardApi.ts`.

## Escenarios

### Scenario 1 — fetchRewards: happy path

```gherkin
Given el servidor responde 200 con una lista de recompensas
When se llama a fetchRewards()
Then retorna un array de RewardApiDto
```

### Scenario 2 — createReward: happy path

```gherkin
Given el servidor responde 201 con la recompensa creada
When se llama a createReward({ emoji, name, description, cost })
Then retorna el RewardApiDto de la recompensa nueva
And la petición es POST /api/rewards con el body correcto
```

### Scenario 3 — deleteReward: happy path

```gherkin
Given el servidor responde 204
When se llama a deleteReward(id)
Then retorna undefined sin lanzar error
And la petición es DELETE /api/rewards/:id
```

### Scenario 4 — redeemReward: happy path (alineado con US-17 Scenario 2)

```gherkin
Given el usuario tiene puntos suficientes y el servidor responde 201
When se llama a redeemReward(weekId, rewardId)
Then retorna el resultado del canje
And la petición es POST /api/weeks/:weekId/redemptions con { rewardId }
```

### Scenario 5 — redeemReward: error 422 INSUFFICIENT_POINTS (alineado con US-17 Scenario 5)

```gherkin
Given el servidor responde 422 con code="INSUFFICIENT_POINTS" y details={ available, required }
When se llama a redeemReward(weekId, rewardId)
Then lanza ApiError con status=422, code="INSUFFICIENT_POINTS"
And el ApiError.details contiene los campos available y required
```

### Scenario 6 — Error de red

```gherkin
Given el servidor no responde (fallo de red)
When se llama a cualquier función de rewardApi
Then lanza ApiError con status=0, code="NETWORK_ERROR"
```
