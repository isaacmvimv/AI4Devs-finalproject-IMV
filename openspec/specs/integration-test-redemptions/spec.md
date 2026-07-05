## ADDED Requirements

### Requirement: POST /api/weeks/:weekId/redemptions crea canje con saldo suficiente

El sistema DEBE tener un test de integración que verifique que `POST /api/weeks/:weekId/redemptions` con saldo suficiente crea el canje y devuelve HTTP 201.

#### Scenario: Happy path — saldo suficiente

- **WHEN** existe una semana activa con puntos ganados suficientes y una recompensa activa
- **AND** se hace `POST /api/weeks/:weekId/redemptions` con `{ "rewardId": <id> }`
- **THEN** la respuesta es HTTP 201
- **AND** el body contiene `id`, `weekId`, `rewardId`, `pointsSpent`, `redeemedAt`

### Requirement: POST /api/weeks/:weekId/redemptions rechaza con 422 si saldo insuficiente

El sistema DEBE tener un test de integración que verifique que `POST /api/weeks/:weekId/redemptions` con saldo insuficiente devuelve HTTP 422.

#### Scenario: Edge — saldo insuficiente

- **WHEN** existe una semana activa con 0 puntos ganados y una recompensa con cost > 0
- **AND** se hace `POST /api/weeks/:weekId/redemptions` con `{ "rewardId": <id> }`
- **THEN** la respuesta es HTTP 422
- **AND** el body contiene `code: "INSUFFICIENT_POINTS"`
