# Spec — week-get-current

**Ticket:** T-09-01 · **User Story:** US-09

Utilidad de límites semanales, repositorios y caso de uso `getCurrentWeek` (T-09-01 / US-09 esc. 1–2).

## Requirements

### Requirement: Week boundaries utility in UTC

The system SHALL expose `getWeekBoundaries(date: Date): { startDate: Date; endDate: Date }` in `backend/src/domain/week.ts`, where `startDate` is Monday 00:00:00.000 UTC and `endDate` is Sunday 23:59:59.999 UTC of the week containing `date`.

#### Scenario: Monday input returns same-week boundaries

- **WHEN** `getWeekBoundaries` is called with a Date representing Monday 2026-06-08 at 12:00 UTC
- **THEN** `startDate` SHALL be Monday 2026-06-08 00:00:00.000 UTC
- **AND** `endDate` SHALL be Sunday 2026-06-14 23:59:59.999 UTC

#### Scenario: Sunday input maps to current ISO week starting previous Monday

- **WHEN** `getWeekBoundaries` is called with a Date representing Sunday 2026-06-14 at 15:00 UTC
- **THEN** `startDate` SHALL be Monday 2026-06-08 00:00:00.000 UTC
- **AND** `endDate` SHALL be Sunday 2026-06-14 23:59:59.999 UTC

#### Scenario: Month boundary crossing

- **WHEN** `getWeekBoundaries` is called with a date in a week that spans two calendar months
- **THEN** the returned `startDate` and `endDate` SHALL still represent Monday–Sunday of that ISO week in UTC

#### Scenario: Year boundary crossing

- **WHEN** `getWeekBoundaries` is called with a date in the last/first ISO week of a year
- **THEN** the returned boundaries SHALL be correct Monday–Sunday UTC dates without local-time drift

### Requirement: Week domain types

The system SHALL define domain types in `backend/src/domain/week.ts` aligned with Prisma models and `docs/data-model.md`:

- `Week` with `id`, `userId`, `startDate`, `endDate`, `isLocked`, `totalPointsEarned`, `totalPenalties`, `createdAt`
- `WeekHabit` with `id`, `weekId`, `habitId`, `order`, `snapshotName`, `snapshotPoints`, `snapshotPenalty`
- `HabitEntry` with `id`, `weekHabitId`, `dayIndex`, `status`, `updatedAt`
- `CompletionStatus` as `'pending' | 'completed' | 'failed'`

#### Scenario: Domain types mirror persisted rows

- **WHEN** repository mappers convert Prisma rows to domain types
- **THEN** all fields SHALL match the persisted column values

### Requirement: Week repository port

The system SHALL expose `WeekRepository` in `backend/src/application/ports/WeekRepository.ts` with at least:

- `findCurrentWeek(userId: number, startDate: Date): Promise<WeekWithDetails | null>`
- `createWeekWithHabitsAndEntries(userId: number, startDate: Date, endDate: Date, activeHabits: Habit[]): Promise<WeekWithDetails>`

where `WeekWithDetails` includes the week plus nested week habits and habit entries.

#### Scenario: findCurrentWeek queries by user and startDate

- **WHEN** `findCurrentWeek` is invoked with a user id and a week `startDate`
- **THEN** the method SHALL return the matching unlocked week with nested data if it exists
- **AND** SHALL return `null` if no week matches that user and `startDate`

### Requirement: Week habit repository port

The system SHALL expose `WeekHabitRepository` in `backend/src/application/ports/WeekHabitRepository.ts` with:

- `createWeekHabits(weekId: number, activeHabits: Habit[]): Promise<WeekHabit[]>`

used internally by the transactional week creation flow.

#### Scenario: createWeekHabits copies habit snapshots

- **WHEN** `createWeekHabits` is called with active habits
- **THEN** each created `WeekHabit` SHALL set `snapshotName`, `snapshotPoints`, and `snapshotPenalty` from the source `Habit`
- **AND** SHALL assign `order` following the active habits order

### Requirement: Prisma week repositories

The system SHALL implement week persistence in `backend/src/infrastructure/prismaWeekRepository.ts` and `backend/src/infrastructure/prismaWeekHabitRepository.ts` using Prisma.

#### Scenario: Transactional week creation is atomic

- **WHEN** `createWeekWithHabitsAndEntries` runs
- **THEN** Week, WeekHabit, and HabitEntry rows SHALL be created inside a single `prisma.$transaction`
- **AND** if any insert fails, the entire transaction SHALL roll back with no partial week persisted

#### Scenario: Seven pending entries per week habit

- **WHEN** a WeekHabit is created for an active habit
- **THEN** the repository SHALL create exactly 7 `HabitEntry` rows with `dayIndex` 0 through 6
- **AND** each entry SHALL have `status: pending`

#### Scenario: Week with no active habits

- **WHEN** `createWeekWithHabitsAndEntries` is called with an empty `activeHabits` array
- **THEN** the system SHALL create the `Week` row
- **AND** SHALL create no `WeekHabit` or `HabitEntry` rows

### Requirement: getCurrentWeek use case

The system SHALL implement `getCurrentWeek` in `backend/src/application/getCurrentWeek.ts` with signature accepting `WeekRepository`, `HabitRepository`, `userId`, and optional `now` defaulting to `new Date()`.

#### Scenario: First week for user creates full structure (US-09 Scenario 1)

- **WHEN** the user has no week in the database for the current week's `startDate`
- **AND** the user has one or more active habits
- **AND** `getCurrentWeek` is invoked
- **THEN** the use case SHALL compute boundaries with `getWeekBoundaries(now)`
- **AND** SHALL load active habits via `HabitRepository.findActiveByUserId`
- **AND** SHALL create Week, WeekHabits, and 7 pending HabitEntries per habit in one transaction
- **AND** SHALL return the newly created week with all nested data

#### Scenario: Existing current week is returned without duplication (US-09 Scenario 2)

- **WHEN** the user already has a week for the current `startDate` with `isLocked: false`
- **AND** `getCurrentWeek` is invoked
- **THEN** the use case SHALL return the existing week with nested data
- **AND** SHALL NOT create duplicate Week, WeekHabit, or HabitEntry rows

#### Scenario: Active habits list is empty on first week

- **WHEN** the user has no week for the current `startDate`
- **AND** `findActiveByUserId` returns an empty array
- **AND** `getCurrentWeek` is invoked
- **THEN** the use case SHALL create only the `Week` row
- **AND** SHALL return the week without week habits or entries

### Requirement: Unit tests for week boundaries and getCurrentWeek

The system SHALL provide Vitest unit tests in `backend/src/domain/getWeekBoundaries.test.ts` (or co-located with domain module) and `backend/src/application/getCurrentWeek.test.ts` using mocked repositories.

#### Scenario: getWeekBoundaries edge cases are covered

- **WHEN** the test suite runs
- **THEN** it SHALL include cases for month boundary and year boundary dates

#### Scenario: getCurrentWeek rollback is verified with mock transaction

- **WHEN** a mocked transactional create throws after Week insert
- **THEN** the test SHALL assert the use case propagates the error
- **AND** documents expected rollback behavior (no partial persistence)
