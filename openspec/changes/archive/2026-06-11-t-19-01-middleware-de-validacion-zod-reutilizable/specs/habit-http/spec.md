# Spec — habit-http (delta)

**Ticket:** T-19-01 · **User Story:** US-07, US-19

## MODIFIED Requirements

### Requirement: POST /api/habits route registered

The system SHALL register `POST /api/habits` in `createApp.ts` with `validateBody(createHabitSchema)` before `asyncHandler`, invoking `createHabit(habitRepository, 1, req.body)` with hardcoded user id `1` for MVP.

#### Scenario: Route accepts JSON body

- **WHEN** a client sends `POST /api/habits` with `Content-Type: application/json`
- **THEN** `validateBody(createHabitSchema)` validates the body before the handler runs
- **AND** invalid bodies never reach `createHabit` (rejected with `ValidationError` at middleware)

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
- **AND** `details` includes an entry with `field: "pointsPerDay"`

#### Scenario: Missing emoji returns 400

- **WHEN** a client sends `POST /api/habits` without `emoji`
- **THEN** the response status is `400`
- **AND** `details` includes an entry with `field: "emoji"`

### Requirement: PATCH /api/habits/:id route registered

The system SHALL register `PATCH /api/habits/:id` in `createApp.ts` with `validateBody(updateHabitSchema)` before `asyncHandler`, invoking `updateHabit(habitRepository, 1, habitId, req.body)` after parsing `:id` as a numeric habit id.

#### Scenario: Route accepts partial JSON body

- **WHEN** a client sends `PATCH /api/habits/:id` with a partial JSON body
- **THEN** `validateBody(updateHabitSchema)` validates the body before `updateHabit` runs

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
