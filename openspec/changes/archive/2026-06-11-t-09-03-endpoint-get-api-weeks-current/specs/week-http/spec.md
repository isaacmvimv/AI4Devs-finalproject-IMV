# Spec — week-http

**Ticket:** T-09-03 · **User Story:** US-09

Exposición HTTP de semanas activas e históricas (`GET /api/weeks/current`, `GET /api/weeks?offset=n`) con DTO completo y estadísticas calculadas en capa de aplicación.

## ADDED Requirements

### Requirement: GET /api/weeks/current route registered

The system SHALL register `GET /api/weeks/current` in `backend/src/presentation/http/createApp.ts`, wrapped with `asyncHandler`, invoking an application use case with hardcoded `userId=1` for MVP.

The handler SHALL NOT contain stats calculation logic; it SHALL delegate to the application layer and return the serialized DTO.

#### Scenario: Route is reachable

- **WHEN** an HTTP client sends `GET /api/weeks/current`
- **THEN** the request is handled by the weeks current route (not Express 404)

### Requirement: Current week orchestrates lockWeekAndTransition

The application use case for `GET /api/weeks/current` SHALL invoke `lockWeekAndTransition(weekRepo, habitRepo, userId, now)` before building the response DTO.

`lockWeekAndTransition` already delegates to `getCurrentWeek`; the HTTP layer SHALL NOT call `getCurrentWeek` separately after a successful transition.

#### Scenario: Week transition on current endpoint (US-09 Scenario 3)

- **WHEN** the user has an unlocked previous week and today is in a new ISO week
- **AND** a client sends `GET /api/weeks/current`
- **THEN** `lockWeekAndTransition` SHALL lock the previous week (`isLocked=true`, totals and snapshots persisted)
- **AND** the response SHALL contain the new active week (`isLocked=false`), not the locked one

#### Scenario: First week creation (US-09 Scenario 1)

- **WHEN** the user has no weeks in the database
- **AND** a client sends `GET /api/weeks/current`
- **THEN** the response status is `200`
- **AND** the response includes a week with `isLocked=false`
- **AND** each habit has 7 `HabitEntry` with `status: pending`

#### Scenario: Same week without duplicates (US-09 Scenario 2)

- **WHEN** the user already has the current unlocked week
- **AND** a client sends `GET /api/weeks/current`
- **THEN** the response status is `200`
- **AND** the same week id is returned without creating duplicates

#### Scenario: Idempotent consecutive calls (US-09 Scenario 4)

- **WHEN** `GET /api/weeks/current` is called twice in succession
- **THEN** both responses return status `200`
- **AND** both return the same current week id
- **AND** no additional weeks are created

### Requirement: Week response DTO shape

A successful `GET /api/weeks/current` response SHALL be HTTP `200` with JSON body:

```json
{
  "week": { "id", "startDate", "endDate", "isLocked", "totalPointsEarned", "totalPenalties" },
  "habits": [{ "weekHabit": { "id", "habitId", "order", "snapshotName", "snapshotPoints", "snapshotPenalty" }, "entries": [{ "id", "dayIndex", "status" }] }],
  "stats": { "thisWeekPoints", "penalties", "lastWeekPoints", "maxStreak" },
  "redemptions": []
}
```

Date fields SHALL serialize as ISO-8601 strings. `redemptions` SHALL be an empty array until reward redemption HTTP is implemented.

#### Scenario: Full payload on happy path

- **WHEN** `lockWeekAndTransition` resolves to a `WeekWithDetails` with habits and entries
- **AND** a client sends `GET /api/weeks/current`
- **THEN** the response status is `200`
- **AND** the body includes `week`, `habits`, `stats`, and `redemptions: []`

### Requirement: Week stats calculated in application layer

The system SHALL compute `stats` in the application layer (not in the HTTP handler) from the active week's `WeekHabit` entries and snapshots:

- `thisWeekPoints`: sum of `snapshotPoints` for each entry with `status: completed`
- `penalties`: sum of `snapshotPenalty` for each entry with `status: failed`
- `maxStreak`: maximum streak across week habits, counting consecutive `completed` entries backward from the current UTC day index within the week (0=Monday … 6=Sunday)
- `lastWeekPoints`: `totalPointsEarned` of the most recent locked week immediately before the returned week, or `0` if none exists

#### Scenario: Stats reflect completed and failed entries (US-13 alignment)

- **WHEN** the active week has entries with `completed` and `failed` statuses
- **AND** a client sends `GET /api/weeks/current`
- **THEN** `stats.thisWeekPoints` and `stats.penalties` reflect snapshot values multiplied by entry counts

#### Scenario: Empty week yields zero stats without error

- **WHEN** the active week has only `pending` entries
- **AND** a client sends `GET /api/weeks/current`
- **THEN** `stats` is `{ thisWeekPoints: 0, penalties: 0, lastWeekPoints: 0, maxStreak: 0 }`
- **AND** the response status is `200`

### Requirement: GET /api/weeks with offset query parameter

The system SHALL register `GET /api/weeks` accepting query parameter `offset` (integer):

- `offset=0`: equivalent to current week; SHALL invoke `lockWeekAndTransition` then return the DTO (same as `/current`)
- `offset<0`: return the historical week `n` weeks before the current ISO week; SHALL NOT invoke `lockWeekAndTransition`
- Missing or non-numeric `offset` on `/api/weeks`: SHALL respond `400` with `VALIDATION_ERROR` (consistent with other query validation in the API)

#### Scenario: Historical week by offset (US-09 Scenario 6)

- **WHEN** the user has a locked week one position before the current week
- **AND** a client sends `GET /api/weeks?offset=-1`
- **THEN** the response status is `200`
- **AND** `week.isLocked` is `true`

#### Scenario: Non-existent historical week returns 404 (US-09 Scenario 6)

- **WHEN** no week exists at the requested offset (e.g. `offset=-5`)
- **AND** a client sends `GET /api/weeks?offset=-5`
- **THEN** the response status is `404`
- **AND** the body includes `{ code: "WEEK_NOT_FOUND", message: "Semana no encontrada" }`

#### Scenario: Immutable snapshots on historical week (US-09 Scenario 5)

- **WHEN** a locked week was blocked with `snapshotPoints=10` for a habit
- **AND** the habit master was later edited to `pointsPerDay=15`
- **AND** a client sends `GET /api/weeks?offset=-1`
- **THEN** the response still shows `snapshotPoints: 10` for that `weekHabit`

### Requirement: Week repository find by offset start date

The system SHALL extend `WeekRepository` with a method to load a week by user and ISO week `startDate` (e.g. `findWeekByUserAndStartDate(userId, startDate): Promise<WeekWithDetails | null>`), implemented in `prismaWeekRepository.ts` with nested `weekHabits` and `habitEntries`.

#### Scenario: Repository returns null when offset week missing

- **WHEN** no `Week` row exists for the computed `startDate` and user
- **AND** `getWeekByOffset` is invoked with that offset
- **THEN** the use case throws `NotFoundError` mapped to HTTP `404`

### Requirement: HTTP unit tests for week endpoints

The system SHALL include Vitest tests using supertest in `createApp.test.ts` with mocked application use cases, covering:

- `GET /api/weeks/current` → `200` with full DTO after transition mock (US-09 S3)
- Two consecutive `GET /api/weeks/current` without duplicate week creation (US-09 S4, mock)
- `GET /api/weeks?offset=-1` → `200` with locked week and historical snapshots (US-09 S5–6)
- `GET /api/weeks?offset=-5` → `404` `WEEK_NOT_FOUND` (US-09 S6)

#### Scenario: Test suite validates current week 200

- **WHEN** HTTP tests run with `npm test`
- **THEN** a test asserts `GET /api/weeks/current` returns `200` with `week`, `habits`, `stats`, `redemptions`

#### Scenario: Test suite validates offset 404

- **WHEN** HTTP tests run with `npm test`
- **THEN** a test asserts `GET /api/weeks?offset=-5` returns `404` with `WEEK_NOT_FOUND`
