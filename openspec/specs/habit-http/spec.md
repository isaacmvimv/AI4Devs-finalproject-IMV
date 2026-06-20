# Spec — habit-http

**Ticket:** T-07-02, T-08-01, T-19-01 · **User Story:** US-07, US-08, US-19

Exposición HTTP de hábitos: listado, creación, actualización parcial y baja lógica (`GET`, `POST`, `PATCH`, `DELETE /api/habits`) — T-07-02 / US-07, T-08-01 / US-08.

## Requirements

### Requirement: Habit repository wired in HTTP layer

The system SHALL instantiate `createPrismaHabitRepository(prisma)` in `backend/src/presentation/http/createApp.ts` and pass it to habit use cases when handling `/api/habits` routes.

#### Scenario: Repository available to route handlers

- **WHEN** `createApp(prisma)` builds the Express application
- **THEN** habit route handlers SHALL invoke use cases with a `HabitRepository` backed by the provided Prisma client

### Requirement: GET /api/habits route registered

The system SHALL register `GET /api/habits` in `createApp.ts`, wrapped with `asyncHandler`, invoking `getActiveHabits(habitRepository, 1)` with hardcoded user id `1` for MVP.

#### Scenario: Route is reachable

- **WHEN** an HTTP client sends `GET /api/habits` to the Express application
- **THEN** the request is handled by the habits list handler (not 404 from Express router)

### Requirement: Successful list of active habits

The system SHALL respond with HTTP `200` and a JSON array where each element includes `id`, `emoji`, `name`, `pointsPerDay`, `penalty`, `isActive`, and `createdAt` when `getActiveHabits` returns habits (US-07 Scenario 2).

#### Scenario: Happy path returns only active habits

- **WHEN** the user has 3 active habits and 1 inactive habit in PostgreSQL
- **AND** a client sends `GET /api/habits`
- **THEN** the response status is `200`
- **AND** the response body is an array of length 3
- **AND** every element has `isActive: true`
- **AND** the inactive habit is not present in the array

#### Scenario: Empty list when no active habits

- **WHEN** `getActiveHabits` resolves to `[]`
- **AND** a client sends `GET /api/habits`
- **THEN** the response status is `200`
- **AND** the response body is `[]`

### Requirement: POST /api/habits route registered

The system SHALL register `POST /api/habits` in `createApp.ts` with `validateBody(createHabitSchema)` before `asyncHandler`, invoking `createHabit(habitRepository, 1, req.body)` with hardcoded user id `1` for MVP.

#### Scenario: Route accepts JSON body

- **WHEN** a client sends `POST /api/habits` with `Content-Type: application/json`
- **THEN** `validateBody(createHabitSchema)` validates the body before the handler runs
- **AND** invalid bodies never reach `createHabit` (rejected with `ValidationError` at middleware)

### Requirement: Successful habit creation

The system SHALL respond with HTTP `201` and the created habit JSON when `createHabit` succeeds (US-07 Scenario 1).

#### Scenario: Happy path creates and returns habit

- **WHEN** a client sends `POST /api/habits` with body `{ "emoji": "🏃", "name": "Correr", "pointsPerDay": 10, "penalty": 5 }`
- **THEN** the response status is `201`
- **AND** the response body includes `id`, `userId`, `emoji`, `name`, `pointsPerDay`, `penalty`, `isActive: true`, and `createdAt`
- **AND** the habit is persisted in PostgreSQL (verified via subsequent `GET /api/habits` or curl)

### Requirement: Validation error response on POST

The system SHALL reject invalid POST bodies via `validateBody(createHabitSchema)` before the use case, propagating `ValidationError` through `next(err)` to `errorHandler`, responding with HTTP `400` and body `{ code: "VALIDATION_ERROR", message, details }` where `details` is an array of `{ field, message }` (US-07 Scenarios 3–5, US-19 Scenario 2).

#### Scenario: Empty or missing name returns 400

- **WHEN** a client sends `POST /api/habits` without `name` or with `name: ""`
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`
- **AND** `details` includes an entry with `field: "name"` and message `El nombre es obligatorio`

#### Scenario: Non-positive pointsPerDay returns 400

- **WHEN** a client sends `POST /api/habits` with `pointsPerDay: 0`
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`
- **AND** `details` includes an entry with `field: "pointsPerDay"`

#### Scenario: Missing emoji returns 400

- **WHEN** a client sends `POST /api/habits` without the `emoji` field
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`
- **AND** `details` includes an entry with `field: "emoji"`

### Requirement: HTTP unit tests for habits endpoints

The system SHALL include Vitest tests using supertest with mocked `createHabit` and/or `getActiveHabits` (or mocked repository), covering GET list, POST happy path, and POST validation errors aligned with the ticket DoD.

#### Scenario: Test suite validates GET 200

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `GET /api/habits` returns `200` with an array of habit objects when the use case succeeds

#### Scenario: Test suite validates POST 201

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `POST /api/habits` returns `201` with the created habit when input is valid

#### Scenario: Test suite validates POST 400 validation

- **WHEN** the HTTP tests run with `npm test`
- **THEN** tests assert `POST /api/habits` returns `400` with `VALIDATION_ERROR` and field details for invalid `name`, `pointsPerDay`, and `emoji`

### Requirement: PATCH /api/habits/:id route registered

The system SHALL register `PATCH /api/habits/:id` in `createApp.ts` with `validateBody(updateHabitSchema)` before `asyncHandler`, invoking `updateHabit(habitRepository, 1, habitId, req.body)` after parsing `:id` as a numeric habit id.

#### Scenario: Route accepts partial JSON body

- **WHEN** a client sends `PATCH /api/habits/:id` with a partial JSON body
- **THEN** `validateBody(updateHabitSchema)` validates the body before `updateHabit` runs

#### Scenario: Invalid habit id returns 404

- **WHEN** a client sends `PATCH /api/habits/not-a-number`
- **THEN** the response status is `404`
- **AND** the response body has `code: "HABIT_NOT_FOUND"`

### Requirement: Successful habit update

The system SHALL respond with HTTP `200` and the updated habit JSON when `updateHabit` succeeds (US-08 Scenario 1). Mutable fields: `emoji`, `name`, `pointsPerDay`, `penalty`.

#### Scenario: Happy path updates mutable fields

- **WHEN** habit id=5 exists with `name="Correr"`, `pointsPerDay=10` and belongs to user id=1
- **AND** a client sends `PATCH /api/habits/5` with body `{ "pointsPerDay": 15 }`
- **THEN** the response status is `200`
- **AND** the response body includes `pointsPerDay: 15` and unchanged fields from the persisted habit
- **AND** only the `Habit` row is updated in PostgreSQL

#### Scenario: PATCH does not mutate WeekHabit snapshots in locked weeks

- **WHEN** habit id=5 is referenced by a `WeekHabit` in a week with `isLocked=true`
- **AND** a client sends `PATCH /api/habits/5` with body `{ "name": "Correr 5K" }`
- **THEN** the `Habit.name` in PostgreSQL is updated
- **AND** the existing `WeekHabit.snapshotName`, `snapshotPoints`, and `snapshotPenalty` for that week remain unchanged (US-08 Scenario 4)

### Requirement: Validation error response on PATCH

The system SHALL reject invalid PATCH bodies via `validateBody(updateHabitSchema)`, responding with HTTP `400` and `{ code: "VALIDATION_ERROR", details }` when validation fails (US-08 edge cases, US-10 validation).

#### Scenario: Empty PATCH body returns 400

- **WHEN** a client sends `PATCH /api/habits/5` with body `{}`
- **THEN** the response status is `400`
- **AND** `details` includes an entry with `field: "input"` indicating at least one field is required

#### Scenario: Invalid pointsPerDay on PATCH returns 400

- **WHEN** a client sends `PATCH /api/habits/5` with `{ "pointsPerDay": 0 }`
- **THEN** the response status is `400`
- **AND** `details` includes an entry with `field: "pointsPerDay"`

### Requirement: DELETE /api/habits/:id route registered

The system SHALL register `DELETE /api/habits/:id` in `createApp.ts`, wrapped with `asyncHandler`, parsing `:id` as integer and invoking `deactivateHabit(habitRepository, 1, habitId)` with hardcoded user id `1` for MVP.

#### Scenario: Route is reachable

- **WHEN** an HTTP client sends `DELETE /api/habits/5` to the Express application
- **THEN** the request is handled by the habit deactivate handler (not 404 from Express router)

### Requirement: Successful habit soft delete

The system SHALL respond with HTTP `204` and empty body when `deactivateHabit` succeeds (US-08 Scenario 2). The habit SHALL remain in PostgreSQL with `isActive=false`; no physical delete.

#### Scenario: Happy path deactivates habit

- **WHEN** habit id=5 exists, belongs to user id=1, and `isActive=true`
- **AND** a client sends `DELETE /api/habits/5`
- **THEN** the response status is `204`
- **AND** the response body is empty
- **AND** the habit row in PostgreSQL has `isActive=false`

#### Scenario: Deactivated habit excluded from GET list

- **WHEN** habit id=5 was deactivated via `DELETE /api/habits/5`
- **AND** a client sends `GET /api/habits`
- **THEN** habit id=5 is not present in the response array

#### Scenario: DELETE preserves WeekHabit snapshots in locked weeks

- **WHEN** habit id=5 has associated `WeekHabit` rows in locked weeks
- **AND** a client sends `DELETE /api/habits/5`
- **THEN** all `WeekHabit.snapshotName`, `snapshotPoints`, and `snapshotPenalty` values remain unchanged
- **AND** no `WeekHabit` or `HabitEntry` rows are deleted from those locked weeks

#### Scenario: DELETE removes habit from current unlocked week

- **WHEN** habit id=5 is linked to the current unlocked `Week` via `WeekHabit` and `HabitEntry` rows
- **AND** a client sends `DELETE /api/habits/5`
- **THEN** the habit row has `isActive=false`
- **AND** the `WeekHabit` and related `HabitEntry` rows for that habit in the current unlocked week are removed
- **AND** a subsequent `GET /api/weeks/current` does not include the habit
- **AND** week stats (`thisWeekPoints`, `penalties`) no longer count contributions from that habit

### Requirement: Not found when habit missing or owned by another user

The system SHALL respond with HTTP `404` and body `{ code: "HABIT_NOT_FOUND", message }` when the habit does not exist or `habit.userId !== userId`, without revealing cross-user resource existence (US-08 Scenario 3).

#### Scenario: PATCH on another user's habit returns 404

- **WHEN** habit id=7 belongs to user id=2
- **AND** user id=1 sends `PATCH /api/habits/7` with a valid body
- **THEN** the response status is `404`
- **AND** the response body has `code: "HABIT_NOT_FOUND"`

#### Scenario: DELETE on another user's habit returns 404

- **WHEN** habit id=7 belongs to user id=2
- **AND** user id=1 sends `DELETE /api/habits/7`
- **THEN** the response status is `404`
- **AND** the response body has `code: "HABIT_NOT_FOUND"`

#### Scenario: PATCH on non-existent habit returns 404

- **WHEN** no habit exists with id=9999
- **AND** a client sends `PATCH /api/habits/9999` with a valid body
- **THEN** the response status is `404`
- **AND** the response body has `code: "HABIT_NOT_FOUND"`

### Requirement: HTTP unit tests for PATCH and DELETE

The system SHALL include Vitest tests using supertest with mocked `updateHabit` and/or `deactivateHabit`, covering PATCH 200, PATCH 400, PATCH/DELETE 404, and DELETE 204 aligned with the ticket DoD.

#### Scenario: Test suite validates PATCH 200

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `PATCH /api/habits/:id` returns `200` with the updated habit when the use case succeeds

#### Scenario: Test suite validates DELETE 204

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `DELETE /api/habits/:id` returns `204` with empty body when the use case succeeds

#### Scenario: Test suite validates 404 for foreign habit

- **WHEN** the HTTP tests run with `npm test`
- **THEN** tests assert PATCH and DELETE return `404` with `HABIT_NOT_FOUND` when the use case throws `NotFoundError`

### Requirement: Snapshot integrity test on deactivate

The system SHALL include an automated test (use-case level with mocked repository or integration against PostgreSQL) that verifies `deactivateHabit` does not alter `WeekHabit` snapshot fields when historical week data exists (ticket DoD), and that it removes the habit from the current unlocked week calendar.

#### Scenario: WeekHabit snapshots unchanged in locked weeks after soft delete

- **WHEN** a habit has `WeekHabit` rows in a locked week with known `snapshotName`, `snapshotPoints`, `snapshotPenalty`
- **AND** `deactivateHabit` completes successfully
- **THEN** those locked-week `WeekHabit` snapshot fields remain identical to their pre-delete values

#### Scenario: Integration test covers week calendar sync on create and delete

- **WHEN** `npm run test:integration` runs against PostgreSQL
- **THEN** tests assert `POST /api/habits` followed by `GET /api/weeks/current` includes the new habit in the current week
- **AND** tests assert `DELETE /api/habits/:id` followed by `GET /api/weeks/current` excludes the habit and reverts its points/penalties from week stats
