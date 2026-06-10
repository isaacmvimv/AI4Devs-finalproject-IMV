# habit-http

Exposición HTTP de creación y listado de hábitos (`GET /api/habits`, `POST /api/habits`) — T-07-02 / US-07.

## ADDED Requirements

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

The system SHALL register `POST /api/habits` in `createApp.ts`, wrapped with `asyncHandler`, invoking `createHabit(habitRepository, 1, req.body)` with hardcoded user id `1` for MVP.

#### Scenario: Route accepts JSON body

- **WHEN** a client sends `POST /api/habits` with `Content-Type: application/json`
- **THEN** the request body is passed to `createHabit` as `unknown` input for Zod validation

### Requirement: Successful habit creation

The system SHALL respond with HTTP `201` and the created habit JSON when `createHabit` succeeds (US-07 Scenario 1).

#### Scenario: Happy path creates and returns habit

- **WHEN** a client sends `POST /api/habits` with body `{ "emoji": "🏃", "name": "Correr", "pointsPerDay": 10, "penalty": 5 }`
- **THEN** the response status is `201`
- **AND** the response body includes `id`, `userId`, `emoji`, `name`, `pointsPerDay`, `penalty`, `isActive: true`, and `createdAt`
- **AND** the habit is persisted in PostgreSQL (verified via subsequent `GET /api/habits` or curl)

### Requirement: Validation error response on POST

The system SHALL propagate `ValidationError` from `createHabit` / `parseCreateHabitInput` through `asyncHandler` to `errorHandler`, responding with HTTP `400` and body `{ code: "VALIDATION_ERROR", message, details }` where `details` is an array of `{ field, message }` (US-07 Scenarios 3–5).

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
