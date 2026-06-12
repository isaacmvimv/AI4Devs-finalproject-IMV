# Spec — reward-http

**Ticket:** T-11-02 · **User Story:** US-11

Exposición HTTP de recompensas: listado, creación y baja lógica (`GET`, `POST`, `DELETE /api/rewards`) — T-11-02 / US-11.

## Requirements

### Requirement: Reward repository wired in HTTP layer

The system SHALL instantiate `createPrismaRewardRepository(prisma)` in `backend/src/presentation/http/createApp.ts` and pass it to reward use cases when handling `/api/rewards` routes.

#### Scenario: Repository available to route handlers

- **WHEN** `createApp(prisma)` builds the Express application
- **THEN** reward route handlers SHALL invoke use cases with a `RewardRepository` backed by the provided Prisma client

### Requirement: GET /api/rewards route registered

The system SHALL register `GET /api/rewards` in `createApp.ts`, wrapped with `asyncHandler`, invoking `getActiveRewards(rewardRepository, 1)` with hardcoded user id `1` for MVP.

#### Scenario: Route is reachable

- **WHEN** an HTTP client sends `GET /api/rewards` to the Express application
- **THEN** the request is handled by the rewards list handler (not 404 from Express router)

### Requirement: Successful list of active rewards

The system SHALL respond with HTTP `200` and a JSON array where each element includes `id`, `userId`, `emoji`, `name`, `description`, `cost`, `isActive`, and `createdAt` when `getActiveRewards` returns rewards (US-11 Scenario 2).

#### Scenario: Happy path returns only active rewards

- **WHEN** the user has 3 active rewards and 1 inactive reward in PostgreSQL
- **AND** a client sends `GET /api/rewards`
- **THEN** the response status is `200`
- **AND** the response body is an array of length 3
- **AND** every element has `isActive: true`
- **AND** the inactive reward is not present in the array

#### Scenario: Empty list when no active rewards

- **WHEN** `getActiveRewards` resolves to `[]`
- **AND** a client sends `GET /api/rewards`
- **THEN** the response status is `200`
- **AND** the response body is `[]`

### Requirement: POST /api/rewards route registered

The system SHALL register `POST /api/rewards` in `createApp.ts` with `validateBody(createRewardSchema)` before `asyncHandler`, invoking `createReward(rewardRepository, 1, req.body)` with hardcoded user id `1` for MVP.

#### Scenario: Route validates JSON body before use case

- **WHEN** a client sends `POST /api/rewards` with `Content-Type: application/json`
- **THEN** `validateBody(createRewardSchema)` validates the body before the handler runs
- **AND** invalid bodies never reach `createReward` (rejected with `ValidationError` at middleware)

### Requirement: Successful reward creation

The system SHALL respond with HTTP `201` and the created reward JSON when `createReward` succeeds (US-11 Scenario 1).

#### Scenario: Happy path creates and returns reward

- **WHEN** a client sends `POST /api/rewards` with body `{ "emoji": "🎬", "name": "Ir al cine", "description": "Tarde de peli", "cost": 50 }`
- **THEN** the response status is `201`
- **AND** the response body includes `id`, `userId`, `emoji`, `name`, `description`, `cost`, `isActive: true`, and `createdAt`
- **AND** the reward is persisted in PostgreSQL (verified via subsequent `GET /api/rewards` or curl)

### Requirement: Validation error response on POST

The system SHALL reject invalid POST bodies via `validateBody(createRewardSchema)`, propagating `ValidationError` through `next(err)` to `errorHandler`, responding with HTTP `400` and body `{ code: "VALIDATION_ERROR", message, details }` where `details` is an array of `{ field, message }` (US-11 Scenario 4).

#### Scenario: Zero cost returns 400

- **WHEN** a client sends `POST /api/rewards` with `cost: 0`
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`
- **AND** `details` includes an entry with `field: "cost"` and message `El coste debe ser mayor que 0`

#### Scenario: Missing emoji returns 400

- **WHEN** a client sends `POST /api/rewards` without the `emoji` field
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`
- **AND** `details` includes an entry with `field: "emoji"`

#### Scenario: Empty name returns 400

- **WHEN** a client sends `POST /api/rewards` with `name: ""`
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`
- **AND** `details` includes an entry with `field: "name"`

### Requirement: DELETE /api/rewards/:id route registered

The system SHALL register `DELETE /api/rewards/:id` in `createApp.ts`, wrapped with `asyncHandler`, parsing `:id` as integer and invoking `softDeleteReward(rewardRepository, 1, rewardId)` with hardcoded user id `1` for MVP.

#### Scenario: Route is reachable

- **WHEN** an HTTP client sends `DELETE /api/rewards/3` to the Express application
- **THEN** the request is handled by the reward soft-delete handler (not 404 from Express router)

#### Scenario: Invalid reward id returns 404

- **WHEN** a client sends `DELETE /api/rewards/not-a-number`
- **THEN** the response status is `404`
- **AND** the response body has `code: "REWARD_NOT_FOUND"`

### Requirement: Successful reward soft delete

The system SHALL respond with HTTP `204` and empty body when `softDeleteReward` succeeds (US-11 Scenario 3). The reward SHALL remain in PostgreSQL with `isActive=false`; no physical delete; `RewardRedemption` rows SHALL remain unchanged.

#### Scenario: Happy path deactivates reward

- **WHEN** reward id=3 exists, belongs to user id=1, and `isActive=true`
- **AND** a client sends `DELETE /api/rewards/3`
- **THEN** the response status is `204`
- **AND** the response body is empty
- **AND** the reward row in PostgreSQL has `isActive=false`

#### Scenario: Deactivated reward excluded from GET list

- **WHEN** reward id=3 was deactivated via `DELETE /api/rewards/3`
- **AND** a client sends `GET /api/rewards`
- **THEN** reward id=3 is not present in the response array

#### Scenario: DELETE preserves RewardRedemption history

- **WHEN** reward id=3 has 2 historical `RewardRedemption` rows
- **AND** a client sends `DELETE /api/rewards/3`
- **THEN** all `RewardRedemption` rows for that reward remain in PostgreSQL unchanged

### Requirement: Not found when reward missing or owned by another user

The system SHALL respond with HTTP `404` and body `{ code: "REWARD_NOT_FOUND", message }` when the reward does not exist or `reward.userId !== userId`, without revealing cross-user resource existence (US-11 Scenario 5).

#### Scenario: DELETE on another user's reward returns 404

- **WHEN** reward id=10 belongs to user id=2
- **AND** user id=1 sends `DELETE /api/rewards/10`
- **THEN** the response status is `404`
- **AND** the response body has `code: "REWARD_NOT_FOUND"`

#### Scenario: DELETE on non-existent reward returns 404

- **WHEN** no reward exists with id=9999
- **AND** a client sends `DELETE /api/rewards/9999`
- **THEN** the response status is `404`
- **AND** the response body has `code: "REWARD_NOT_FOUND"`

### Requirement: HTTP unit tests for rewards endpoints

The system SHALL include Vitest tests using supertest with mocked `createReward`, `getActiveRewards`, and/or `softDeleteReward`, covering GET list, POST happy path, POST validation errors, DELETE 204, and DELETE 404 aligned with the ticket DoD.

#### Scenario: Test suite validates GET 200

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `GET /api/rewards` returns `200` with an array of reward objects when the use case succeeds

#### Scenario: Test suite validates GET 200 empty array

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `GET /api/rewards` returns `200` with `[]` when no active rewards exist

#### Scenario: Test suite validates POST 201

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `POST /api/rewards` returns `201` with the created reward when input is valid

#### Scenario: Test suite validates POST 400 validation

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `POST /api/rewards` with `cost: 0` returns `400` with `VALIDATION_ERROR` and field detail for `cost`

#### Scenario: Test suite validates DELETE 204

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `DELETE /api/rewards/:id` returns `204` with empty body when the use case succeeds

#### Scenario: Test suite validates DELETE 404 for foreign reward

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `DELETE /api/rewards/:id` returns `404` with `REWARD_NOT_FOUND` when the use case throws `NotFoundError`
