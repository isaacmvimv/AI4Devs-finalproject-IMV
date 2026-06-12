# Spec — reward-domain-repository

**Ticket:** T-11-01 · **User Story:** US-11

Dominio, puerto, repositorio Prisma y casos de uso de recompensas (T-11-01 / US-11).

## Requirements

### Requirement: Reward entity shape

The system SHALL define a `Reward` type in `backend/src/domain/reward.ts` with fields `id: number`, `userId: number`, `emoji: string`, `name: string`, `description: string`, `cost: number`, `isActive: boolean`, and `createdAt: Date`, aligned with the Prisma `Reward` model and `docs/data-model.md`.

#### Scenario: Domain type mirrors persisted reward row

- **WHEN** a reward row exists in PostgreSQL with all Prisma columns populated
- **AND** `RewardRepository` maps that row to the domain type
- **THEN** the returned `Reward` SHALL include matching `id`, `userId`, `emoji`, `name`, `description`, `cost`, `isActive`, and `createdAt`

### Requirement: Reward repository port

The system SHALL expose `RewardRepository` in `backend/src/application/ports/RewardRepository.ts` with methods:

- `create(data: CreateRewardData): Promise<Reward>`
- `findActiveByUserId(userId: number): Promise<Reward[]>`
- `findById(id: number): Promise<Reward | null>`
- `softDelete(id: number): Promise<Reward>`

#### Scenario: Port supports active listing by user

- **WHEN** `findActiveByUserId` is called with a user id
- **THEN** the method SHALL resolve to an array of `Reward` entities (possibly empty)

#### Scenario: Port supports soft delete without physical removal

- **WHEN** `softDelete` is invoked for an existing reward id
- **THEN** the repository implementation SHALL set `isActive: false` on the row without deleting it from PostgreSQL
- **AND** existing `RewardRedemption` rows linked to that reward SHALL remain in the database (US-11 Scenario 3)

### Requirement: Prisma reward repository

The system SHALL implement `RewardRepository` in `backend/src/infrastructure/prismaRewardRepository.ts` using Prisma client operations on the `Reward` model.

#### Scenario: Create persists reward with isActive true

- **WHEN** `create` is called with valid reward data including `userId`
- **THEN** `createPrismaRewardRepository(...).create(...)` SHALL insert a row with `isActive: true` and return the mapped `Reward` (US-11 Scenario 1 — persistence layer)

#### Scenario: findActiveByUserId filters inactive rewards

- **WHEN** a user has rewards with `isActive: true` and `isActive: false`
- **AND** `findActiveByUserId(userId)` is invoked
- **THEN** only rewards with `isActive: true` for that `userId` SHALL be returned (US-11 Scenario 2 — repository layer)

#### Scenario: findById returns null when reward missing

- **WHEN** no reward row matches the requested id
- **AND** `findById` is called
- **THEN** the method SHALL resolve to `null` without throwing

#### Scenario: softDelete does not cascade delete redemptions

- **WHEN** a reward has historical `RewardRedemption` rows
- **AND** `softDelete(rewardId)` is invoked
- **THEN** the reward row SHALL have `isActive: false`
- **AND** all `RewardRedemption` rows for that reward SHALL still exist (US-11 Scenario 3)

### Requirement: Create reward input validation

The system SHALL validate create-reward input with Zod in `backend/src/application/validation/reward.ts` before calling the repository, enforcing:

- `name`: non-empty trimmed string
- `emoji`: non-empty string
- `description`: non-empty trimmed string (schema from T-19-01)
- `cost`: integer > 0

#### Scenario: Empty name throws ValidationError

- **WHEN** `createReward` receives input with missing or blank `name`
- **THEN** the use case SHALL throw `ValidationError` with a detail for field `name` (US-11 Scenario 1 validation)

#### Scenario: Zero cost throws ValidationError

- **WHEN** `createReward` receives `cost` equal to 0
- **THEN** the use case SHALL throw `ValidationError` with a detail for field `cost` with message indicating it must be greater than 0 (US-11 Scenario 4)

#### Scenario: Missing emoji throws ValidationError

- **WHEN** `createReward` receives input without `emoji` or with empty `emoji`
- **THEN** the use case SHALL throw `ValidationError` with a detail for field `emoji`

#### Scenario: Invalid input does not call repository create

- **WHEN** validation fails for any required field
- **AND** `createReward` is invoked
- **THEN** `repo.create` SHALL NOT be called

### Requirement: Create reward use case

The system SHALL provide `createReward(repo: RewardRepository, userId: number, input: unknown): Promise<Reward>` in `backend/src/application/createReward.ts` that validates input, then delegates to `repo.create` with `userId` and validated fields.

#### Scenario: Happy path creates active reward via repository

- **WHEN** input is `{ emoji: "🎬", name: "Ir al cine", description: "Tarde de peli", cost: 50 }`
- **AND** `createReward` is called with `userId: 1`
- **THEN** the use case SHALL call `repo.create` with validated fields and return the created `Reward` with `isActive: true` (US-11 Scenario 1 — application layer)

### Requirement: Get active rewards use case

The system SHALL provide `getActiveRewards(repo: RewardRepository, userId: number): Promise<Reward[]>` in `backend/src/application/getActiveRewards.ts` that returns only active rewards for the user.

#### Scenario: Returns only active rewards for user

- **WHEN** `getActiveRewards` is called with a user id
- **THEN** the use case SHALL return the result of `repo.findActiveByUserId(userId)` (US-11 Scenario 2 — application layer)

#### Scenario: Empty list when user has no active rewards

- **WHEN** `findActiveByUserId` resolves to `[]`
- **AND** `getActiveRewards` is called
- **THEN** the use case SHALL return an empty array

### Requirement: Soft delete reward use case

The system SHALL provide `softDeleteReward(repo: RewardRepository, userId: number, rewardId: number): Promise<Reward>` in `backend/src/application/softDeleteReward.ts` that verifies ownership, then delegates to `repo.softDelete`.

#### Scenario: Happy path soft deletes owned reward

- **WHEN** the reward exists and `reward.userId` matches the caller `userId`
- **AND** `softDeleteReward` is invoked
- **THEN** the use case SHALL call `repo.softDelete(rewardId)` and return a `Reward` with `isActive: false` (US-11 Scenario 3 — application layer)

#### Scenario: Reward owned by another user throws NotFoundError

- **WHEN** the reward exists but belongs to a different user
- **AND** `softDeleteReward` is called
- **THEN** the use case SHALL throw `NotFoundError` with code `REWARD_NOT_FOUND` (US-11 Scenario 5)

#### Scenario: Missing reward throws NotFoundError

- **WHEN** no reward exists for the given id
- **AND** `softDeleteReward` is called
- **THEN** the use case SHALL throw `NotFoundError` with code `REWARD_NOT_FOUND`

### Requirement: Unit tests for reward use cases

The system SHALL include Vitest tests with a mocked `RewardRepository`:

- `backend/src/application/createReward.test.ts` — happy path and `cost: 0` validation
- `backend/src/application/getActiveRewards.test.ts` — active-only listing and empty list
- `backend/src/application/softDeleteReward.test.ts` — soft delete and ownership errors

#### Scenario: createReward test suite passes

- **WHEN** `npm test -- backend/src/application/createReward.test.ts` runs
- **THEN** tests SHALL pass for valid create delegation and `ValidationError` on `cost: 0` (US-11 S1, S4)

#### Scenario: getActiveRewards test suite passes

- **WHEN** `npm test -- backend/src/application/getActiveRewards.test.ts` runs
- **THEN** tests SHALL pass for returning active rewards and empty array edge case (US-11 S2)

#### Scenario: softDeleteReward test suite passes

- **WHEN** `npm test -- backend/src/application/softDeleteReward.test.ts` runs
- **THEN** tests SHALL pass for soft delete delegation and `NotFoundError` on foreign reward (US-11 S3, S5)
