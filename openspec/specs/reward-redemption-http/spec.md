# Spec — reward-redemption-http

**Ticket:** T-12-02 · **User Story:** US-12

Capacidad HTTP para canjear una recompensa contra el saldo de puntos de una semana vía `POST /api/weeks/:weekId/redemptions`.

## Requirements

### Requirement: POST /api/weeks/:weekId/redemptions route registered

The system SHALL register `POST /api/weeks/:weekId/redemptions` in `createApp.ts`, wrapped with `validateBody(redeemRewardSchema)` and `asyncHandler`, parsing `:weekId` as integer and invoking `redeemReward(redemptionRepository, rewardRepository, 1, weekId, rewardId)` with hardcoded user id `1` for MVP.

#### Scenario: Route accepts JSON body with rewardId

- **WHEN** a client sends `POST /api/weeks/1/redemptions` with `Content-Type: application/json`
- **THEN** the request body is validated by `redeemRewardSchema` before the use case runs

#### Scenario: Invalid weekId returns 404

- **WHEN** a client sends `POST /api/weeks/not-a-number/redemptions` with body `{ "rewardId": 2 }`
- **THEN** the response status is `404`
- **AND** the response body has `code: "WEEK_NOT_FOUND"`

### Requirement: RewardRedemptionRepository wired in createApp

The system SHALL instantiate `createPrismaRewardRedemptionRepository(prisma)` in `createApp.ts` alongside existing repositories and pass it to `redeemReward` when handling redemption routes.

#### Scenario: Repository factory imported and used

- **WHEN** `createApp(prisma)` is called
- **THEN** a `RewardRedemptionRepository` instance is created via `createPrismaRewardRedemptionRepository`

### Requirement: Successful reward redemption

The system SHALL respond with HTTP `201` and JSON `{ id, weekId, rewardId, pointsSpent, redeemedAt }` when `redeemReward` succeeds on an unlocked week with sufficient balance (US-12 Scenario 1). The `redeemedAt` field SHALL be serialized as an ISO-8601 string.

#### Scenario: Happy path redeems reward

- **WHEN** week id=1 has available balance ≥ reward cost and `isLocked=false` for user id=1
- **AND** a client sends `POST /api/weeks/1/redemptions` with body `{ "rewardId": 2 }`
- **THEN** the response status is `201`
- **AND** the response body matches `{ "id": <number>, "weekId": 1, "rewardId": 2, "pointsSpent": <number>, "redeemedAt": "<ISO-8601>" }`

### Requirement: Insufficient points rejection

The system SHALL reject redemption when available balance is less than `reward.cost`, responding with HTTP `422` and body containing `code: "INSUFFICIENT_POINTS"` and `details: { available, required }` where `required` equals the reward cost. No `RewardRedemption` row SHALL be created (US-12 Scenario 2).

#### Scenario: Insufficient balance returns 422

- **WHEN** `redeemReward` throws `UnprocessableError` with code `INSUFFICIENT_POINTS` and details `{ available: 30, required: 50 }`
- **AND** a client sends `POST /api/weeks/1/redemptions` with body `{ "rewardId": 2 }`
- **THEN** the response status is `422`
- **AND** the response body has `code: "INSUFFICIENT_POINTS"`
- **AND** the response body has `details: { "available": 30, "required": 50 }`

### Requirement: Locked week rejection

The system SHALL reject redemption when the target `Week.isLocked` is `true`, responding with HTTP `409` and body `{ code: "WEEK_LOCKED", message: "No se puede modificar una semana bloqueada" }` (US-12 Scenario 3).

#### Scenario: Locked week returns 409

- **WHEN** `redeemReward` throws `ConflictError` with code `WEEK_LOCKED`
- **AND** a client sends `POST /api/weeks/1/redemptions` with body `{ "rewardId": 2 }`
- **THEN** the response status is `409`
- **AND** the response body has `code: "WEEK_LOCKED"`

### Requirement: Not found for missing or foreign week or reward

The system SHALL respond with HTTP `404` when the week or reward does not exist or does not belong to user id=1, without revealing resource existence to unauthorized callers.

#### Scenario: Week not found returns 404

- **WHEN** `redeemReward` throws `NotFoundError` with code `WEEK_NOT_FOUND`
- **AND** a client sends `POST /api/weeks/99999/redemptions` with body `{ "rewardId": 2 }`
- **THEN** the response status is `404`
- **AND** the response body has `code: "WEEK_NOT_FOUND"`

#### Scenario: Reward not found returns 404

- **WHEN** `redeemReward` throws `NotFoundError` with code `REWARD_NOT_FOUND`
- **AND** a client sends `POST /api/weeks/1/redemptions` with body `{ "rewardId": 99999 }`
- **THEN** the response status is `404`
- **AND** the response body has `code: "REWARD_NOT_FOUND"`

### Requirement: Validation error on invalid rewardId

The system SHALL respond with HTTP `400` and body `{ code: "VALIDATION_ERROR", message, details }` when `rewardId` is missing, not a positive integer, or otherwise fails schema validation.

#### Scenario: Missing rewardId returns 400

- **WHEN** a client sends `POST /api/weeks/1/redemptions` with body `{}`
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`

#### Scenario: Invalid rewardId type returns 400

- **WHEN** a client sends `POST /api/weeks/1/redemptions` with body `{ "rewardId": "abc" }`
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`
- **AND** `redeemReward` is NOT invoked
