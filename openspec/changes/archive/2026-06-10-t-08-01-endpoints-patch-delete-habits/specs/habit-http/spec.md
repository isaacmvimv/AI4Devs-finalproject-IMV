# habit-http (delta — T-08-01)

Extensión de la capacidad HTTP de hábitos con `PATCH` y `DELETE /api/habits/:id` — T-08-01 / US-08.

## ADDED Requirements

### Requirement: PATCH /api/habits/:id route registered

The system SHALL register `PATCH /api/habits/:id` in `createApp.ts`, wrapped with `asyncHandler`, parsing `:id` as integer and invoking `updateHabit(habitRepository, 1, habitId, req.body)` with hardcoded user id `1` for MVP.

#### Scenario: Route accepts partial JSON body

- **WHEN** a client sends `PATCH /api/habits/5` with `Content-Type: application/json`
- **THEN** the request body is passed to `updateHabit` as `unknown` input for Zod partial validation

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

The system SHALL propagate `ValidationError` from `updateHabit` / `parseUpdateHabitInput` through `asyncHandler` to `errorHandler`, responding with HTTP `400` and body `{ code: "VALIDATION_ERROR", message, details }` when provided fields fail Zod rules.

#### Scenario: Invalid pointsPerDay on PATCH returns 400

- **WHEN** a client sends `PATCH /api/habits/5` with body `{ "pointsPerDay": 0 }`
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`
- **AND** `details` includes an entry with `field: "pointsPerDay"`

#### Scenario: Empty patch body returns 400

- **WHEN** a client sends `PATCH /api/habits/5` with body `{}`
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`

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

#### Scenario: DELETE preserves WeekHabit snapshots in historical weeks

- **WHEN** habit id=5 has associated `WeekHabit` rows in locked weeks
- **AND** a client sends `DELETE /api/habits/5`
- **THEN** all `WeekHabit.snapshotName`, `snapshotPoints`, and `snapshotPenalty` values remain unchanged
- **AND** no `WeekHabit` or `HabitEntry` rows are deleted

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

The system SHALL include an automated test (use-case level with mocked repository or integration against PostgreSQL) that verifies `deactivateHabit` does not alter `WeekHabit` snapshot fields when historical week data exists (ticket DoD).

#### Scenario: WeekHabit snapshots unchanged after soft delete

- **WHEN** a habit has `WeekHabit` rows with known `snapshotName`, `snapshotPoints`, `snapshotPenalty`
- **AND** `deactivateHabit` completes successfully
- **THEN** those `WeekHabit` snapshot fields remain identical to their pre-delete values
