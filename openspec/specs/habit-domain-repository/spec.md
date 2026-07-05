# Spec — habit-domain-repository

**Ticket:** T-07-01 · **User Story:** US-07

Dominio, puerto, repositorio Prisma y casos de uso de hábitos (T-07-01 / US-07).

## Requirements

### Requirement: Habit entity shape

The system SHALL define a `Habit` type in `backend/src/domain/habit.ts` with fields `id: number`, `userId: number`, `emoji: string`, `name: string`, `pointsPerDay: number`, `penalty: number`, `isActive: boolean`, and `createdAt: Date`, aligned with the Prisma `Habit` model and `docs/data-model.md`.

#### Scenario: Domain type mirrors persisted habit row

- **WHEN** a habit row exists in PostgreSQL with all Prisma columns populated
- **AND** `HabitRepository` maps that row to the domain type
- **THEN** the returned `Habit` SHALL include matching `id`, `userId`, `emoji`, `name`, `pointsPerDay`, `penalty`, `isActive`, and `createdAt`

### Requirement: Habit repository port

The system SHALL expose `HabitRepository` in `backend/src/application/ports/HabitRepository.ts` with methods:

- `create(data: CreateHabitData): Promise<Habit>`
- `findActiveByUserId(userId: number): Promise<Habit[]>`
- `findById(id: number): Promise<Habit | null>`
- `update(id: number, data: UpdateHabitData): Promise<Habit>`
- `softDelete(id: number): Promise<void>`

#### Scenario: Port supports active listing by user

- **WHEN** `findActiveByUserId` is called with a user id
- **THEN** the method SHALL resolve to an array of `Habit` entities (possibly empty)

#### Scenario: Port supports soft delete without physical removal

- **WHEN** `softDelete` is invoked for an existing habit id
- **THEN** the repository implementation SHALL set `isActive: false` on the row without deleting it from PostgreSQL

### Requirement: Prisma habit repository

The system SHALL implement `HabitRepository` in `backend/src/infrastructure/prismaHabitRepository.ts` using Prisma client operations on the `Habit` model.

#### Scenario: Create persists habit with isActive true

- **WHEN** `create` is called with valid habit data including `userId`
- **THEN** `createPrismaHabitRepository(...).create(...)` SHALL insert a row with `isActive: true` and return the mapped `Habit` (US-07 Scenario 1 — persistence layer)

#### Scenario: findActiveByUserId filters inactive habits

- **WHEN** a user has habits with `isActive: true` and `isActive: false`
- **AND** `findActiveByUserId(userId)` is invoked
- **THEN** only habits with `isActive: true` for that `userId` SHALL be returned (US-07 Scenario 2 — repository layer)

#### Scenario: findById returns null when habit missing

- **WHEN** no habit row matches the requested id
- **AND** `findById` is called
- **THEN** the method SHALL resolve to `null` without throwing

### Requirement: Create habit input validation

The system SHALL validate create-habit input with Zod in `backend/src/application/validation/habit.ts` (or equivalent module) before calling the repository, enforcing:

- `name`: non-empty trimmed string
- `emoji`: non-empty string
- `pointsPerDay`: integer > 0
- `penalty`: integer >= 0

#### Scenario: Empty name throws ValidationError

- **WHEN** `createHabit` receives input with missing or blank `name`
- **THEN** the use case SHALL throw `ValidationError` with code `VALIDATION_ERROR` and a detail for field `name` with message `El nombre es obligatorio` (US-07 Scenario 3)

#### Scenario: Non-positive pointsPerDay throws ValidationError

- **WHEN** `createHabit` receives `pointsPerDay` less than or equal to 0
- **THEN** the use case SHALL throw `ValidationError` with a detail for field `pointsPerDay` (US-07 Scenario 4)

#### Scenario: Missing emoji throws ValidationError

- **WHEN** `createHabit` receives input without `emoji` or with empty `emoji`
- **THEN** the use case SHALL throw `ValidationError` with a detail for field `emoji` (US-07 Scenario 5)

#### Scenario: Negative penalty throws ValidationError

- **WHEN** `createHabit` receives `penalty` less than 0
- **THEN** the use case SHALL throw `ValidationError` with a detail for field `penalty`

### Requirement: Create habit use case

The system SHALL provide `createHabit(repo: HabitRepository, userId: number, input: unknown): Promise<Habit>` in `backend/src/application/createHabit.ts` that validates input, then delegates to `repo.create` with `userId` and validated fields.

#### Scenario: Happy path creates active habit via repository

- **WHEN** input is `{ emoji: "🏃", name: "Correr", pointsPerDay: 10, penalty: 5 }`
- **AND** `createHabit` is called with `userId: 1`
- **THEN** the use case SHALL call `repo.create` with `isActive: true` (implicit/default) and return the created `Habit` (US-07 Scenario 1 — application layer)

#### Scenario: Invalid input does not call repository create

- **WHEN** validation fails for any required field
- **AND** `createHabit` is invoked
- **THEN** `repo.create` SHALL NOT be called

### Requirement: Get active habits use case

The system SHALL provide `getActiveHabits(repo: HabitRepository, userId: number): Promise<Habit[]>` in `backend/src/application/getActiveHabits.ts` that returns only active habits for the user.

#### Scenario: Returns only active habits for user

- **WHEN** the repository would return a mix of active and inactive habits for unrelated queries
- **AND** `getActiveHabits` is called with a user id
- **THEN** the use case SHALL return the result of `repo.findActiveByUserId(userId)` (US-07 Scenario 2 — application layer)

#### Scenario: Empty list when user has no active habits

- **WHEN** `findActiveByUserId` resolves to `[]`
- **AND** `getActiveHabits` is called
- **THEN** the use case SHALL return an empty array

### Requirement: Unit tests for habit use cases

The system SHALL include Vitest tests with a mocked `HabitRepository`:

- `backend/src/application/createHabit.test.ts` — happy path and validation errors
- `backend/src/application/getActiveHabits.test.ts` — active-only filtering and empty list

#### Scenario: createHabit test suite passes

- **WHEN** `npm test -- backend/src/application/createHabit.test.ts` runs
- **THEN** tests SHALL pass for valid create delegation and `ValidationError` on invalid `name`, `pointsPerDay`, and `emoji`

#### Scenario: getActiveHabits test suite passes

- **WHEN** `npm test -- backend/src/application/getActiveHabits.test.ts` runs
- **THEN** tests SHALL pass for returning only active habits and empty array edge case
