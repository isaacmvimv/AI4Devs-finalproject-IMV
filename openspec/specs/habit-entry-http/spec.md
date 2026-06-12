# Spec — habit-entry-http

**Ticket:** T-10-01 · **User Story:** US-10

Capacidad HTTP para actualizar el estado diario de una `HabitEntry` vía `PATCH /api/habit-entries/:id`.

## Requirements

### Requirement: PATCH /api/habit-entries/:id route registered

The system SHALL register `PATCH /api/habit-entries/:id` in `createApp.ts`, wrapped with `validateBody(updateHabitEntrySchema)` and `asyncHandler`, parsing `:id` as integer and invoking `updateHabitEntry(habitEntryRepository, 1, entryId, req.body)` with hardcoded user id `1` for MVP.

#### Scenario: Route accepts JSON body with status

- **WHEN** a client sends `PATCH /api/habit-entries/42` with `Content-Type: application/json`
- **THEN** the request body is validated by `updateHabitEntrySchema` before the use case runs

#### Scenario: Invalid entry id returns 404

- **WHEN** a client sends `PATCH /api/habit-entries/not-a-number` with body `{ "status": "completed" }`
- **THEN** the response status is `404`
- **AND** the response body has `code: "HABIT_ENTRY_NOT_FOUND"`

### Requirement: Successful habit entry status update

The system SHALL respond with HTTP `200` and JSON `{ id, status, updatedAt }` when `updateHabitEntry` succeeds on an unlocked week owned by the user (US-10 Scenario 1). The `status` field SHALL be one of `pending`, `completed`, or `failed`. Prisma SHALL persist the new `status` and refresh `updatedAt`.

#### Scenario: Happy path marks day as completed

- **WHEN** `HabitEntry` id=42 exists with `status=pending` in a week with `isLocked=false` belonging to user id=1
- **AND** a client sends `PATCH /api/habit-entries/42` with body `{ "status": "completed" }`
- **THEN** the response status is `200`
- **AND** the response body is `{ "id": 42, "status": "completed", "updatedAt": "<ISO-8601>" }`
- **AND** the PostgreSQL row for id=42 has `status=completed`

#### Scenario: State cycle allows completed to failed

- **WHEN** `HabitEntry` id=42 exists with `status=completed` in an unlocked week owned by user id=1
- **AND** a client sends `PATCH /api/habit-entries/42` with body `{ "status": "failed" }`
- **THEN** the response status is `200`
- **AND** the response body has `status: "failed"` (US-10 Scenario 3)

### Requirement: Locked week rejection

The system SHALL reject updates when the parent `Week.isLocked` is `true`, responding with HTTP `409` and body `{ code: "WEEK_LOCKED", message: "No se puede modificar una semana bloqueada" }`. The entry status in PostgreSQL SHALL NOT change (US-10 Scenario 2).

#### Scenario: Locked week returns 409

- **WHEN** `HabitEntry` id=99 belongs to a week with `isLocked=true` owned by user id=1
- **AND** a client sends `PATCH /api/habit-entries/99` with body `{ "status": "completed" }`
- **THEN** the response status is `409`
- **AND** the response body has `code: "WEEK_LOCKED"`
- **AND** the entry status in PostgreSQL is unchanged

### Requirement: Validation error on invalid status

The system SHALL respond with HTTP `400` and body `{ code: "VALIDATION_ERROR", message, details }` when `status` is not a valid enum value (US-10 Scenario 4).

#### Scenario: Invalid status value returns 400

- **WHEN** a client sends `PATCH /api/habit-entries/42` with body `{ "status": "done" }`
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`
- **AND** `details` includes `{ "field": "status", "message": "Debe ser pending, completed o failed" }`

#### Scenario: Missing status field returns 400

- **WHEN** a client sends `PATCH /api/habit-entries/42` with body `{}`
- **THEN** the response status is `400`
- **AND** the response body has `code: "VALIDATION_ERROR"`

### Requirement: Not found for missing or foreign entry

The system SHALL respond with HTTP `404` when the `HabitEntry` does not exist or belongs to a `Week` owned by a different user, without revealing resource existence to unauthorized callers (US-10 Scenario 5).

#### Scenario: Non-existent entry returns 404

- **WHEN** no `HabitEntry` exists with id=99999
- **AND** a client sends `PATCH /api/habit-entries/99999` with body `{ "status": "completed" }`
- **THEN** the response status is `404`
- **AND** the response body has `code: "HABIT_ENTRY_NOT_FOUND"`

#### Scenario: Entry owned by another user returns 404

- **WHEN** `HabitEntry` id=200 belongs to a week owned by user id=2
- **AND** user id=1 sends `PATCH /api/habit-entries/200` with body `{ "status": "completed" }`
- **THEN** the response status is `404`
- **AND** the response body has `code: "HABIT_ENTRY_NOT_FOUND"`
