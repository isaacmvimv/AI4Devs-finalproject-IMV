# Spec — week-lock-transition

**Ticket:** T-09-02 · **User Story:** US-09

Bloqueo de semana anterior, snapshots definitivos y transición semanal vía `lockWeek` y `lockWeekAndTransition` (US-09 esc. 3–5).

## Requirements

### Requirement: Week repository lockWeek method

The system SHALL extend `WeekRepository` in `backend/src/application/ports/WeekRepository.ts` with:

- `findUnlockedWeekBefore(userId: number, beforeStartDate: Date): Promise<WeekWithDetails | null>` — returns the most recent unlocked week for the user whose `startDate` is strictly before `beforeStartDate`, or `null` if none exists.
- `lockWeek(weekId: number): Promise<Week>` — locks the week inside a single Prisma transaction.

#### Scenario: findUnlockedWeekBefore returns stale unlocked week

- **WHEN** the user has an unlocked week with `startDate` before the current week's `startDate`
- **AND** `findUnlockedWeekBefore` is invoked with that current `startDate`
- **THEN** the method SHALL return that week with nested `weekHabits` and `habitEntries`

#### Scenario: findUnlockedWeekBefore returns null when no stale week

- **WHEN** the user has no unlocked week with `startDate` before the given date
- **AND** `findUnlockedWeekBefore` is invoked
- **THEN** the method SHALL return `null`

### Requirement: lockWeek transactional persistence

The system SHALL implement `lockWeek` in `backend/src/infrastructure/prismaWeekRepository.ts` using `prisma.$transaction`.

Inside the transaction, for the target week:

1. Load week with `weekHabits`, `habitEntries`, and related `habit` master rows.
2. If `isLocked` is already `true`, return the week unchanged (idempotent, no error).
3. For each `WeekHabit`, compute contribution to totals from its `habitEntries`:
   - `totalPointsEarned` += count of `status: completed` × current `Habit.pointsPerDay`
   - `totalPenalties` += count of `status: failed` × current `Habit.penalty`
4. Update each `WeekHabit` with definitive snapshots from the current `Habit` master: `snapshotName`, `snapshotPoints`, `snapshotPenalty`.
5. Update `Week` with `isLocked: true`, `totalPointsEarned`, `totalPenalties`.

#### Scenario: Week transition locks previous week with totals and snapshots (US-09 Scenario 3)

- **WHEN** `lockWeek` is invoked for an unlocked week with completed and failed entries
- **THEN** the week SHALL be persisted with `isLocked: true`
- **AND** `totalPointsEarned` SHALL equal the sum of completed entries multiplied by the habit's `pointsPerDay` at lock time
- **AND** `totalPenalties` SHALL equal the sum of failed entries multiplied by the habit's `penalty` at lock time
- **AND** each `WeekHabit` SHALL have `snapshotName`, `snapshotPoints`, and `snapshotPenalty` copied from the current `Habit` master

#### Scenario: lockWeek is idempotent on already locked week (US-09 Scenario 4)

- **WHEN** `lockWeek` is invoked for a week with `isLocked: true`
- **THEN** the method SHALL NOT modify `Week`, `WeekHabit`, or `HabitEntry` rows
- **AND** SHALL NOT throw an error
- **AND** SHALL return the existing locked week

#### Scenario: Zero totals when no completed or failed entries

- **WHEN** `lockWeek` is invoked for an unlocked week where all entries are `pending`
- **THEN** `totalPointsEarned` SHALL be `0`
- **AND** `totalPenalties` SHALL be `0`
- **AND** snapshots SHALL still be written from the current `Habit` master

### Requirement: lockWeekAndTransition use case

The system SHALL implement `lockWeekAndTransition` in `backend/src/application/lockWeekAndTransition.ts` accepting `WeekRepository`, `HabitRepository`, `userId`, and optional `now` defaulting to `new Date()`.

#### Scenario: Weekly transition blocks previous and ensures current week (US-09 Scenario 3)

- **WHEN** the user has an unlocked week whose `startDate` is before the current week's `startDate` (computed via `getWeekBoundaries(now)`)
- **AND** `lockWeekAndTransition` is invoked
- **THEN** the use case SHALL call `lockWeek` on that previous week
- **AND** SHALL then call `getCurrentWeek` to return the current week's `WeekWithDetails`
- **AND** the returned week SHALL be the new current week, not the locked one
- **AND** the new week SHALL have all `HabitEntry` rows with `status: pending` for each active habit

#### Scenario: No stale week delegates only to getCurrentWeek (US-09 Scenario 2 path)

- **WHEN** the user has no unlocked week before the current `startDate`
- **AND** `lockWeekAndTransition` is invoked
- **THEN** the use case SHALL NOT call `lockWeek`
- **AND** SHALL return the result of `getCurrentWeek` without creating duplicate weeks

#### Scenario: Second transition call is idempotent (US-09 Scenario 4)

- **WHEN** the previous week is already locked
- **AND** `lockWeekAndTransition` is invoked twice in succession for the same `now`
- **THEN** neither invocation SHALL create duplicate `Week` rows
- **AND** neither invocation SHALL re-modify the locked week
- **AND** both invocations SHALL return the same current week

### Requirement: Locked week snapshots are immutable after habit edit (US-09 Scenario 5)

After `lockWeek` persists snapshots, subsequent edits to the `Habit` master SHALL NOT alter `WeekHabit.snapshotName`, `snapshotPoints`, or `snapshotPenalty` on locked weeks.

#### Scenario: snapshotPoints unchanged after habit pointsPerDay update

- **WHEN** a week was locked with a habit at `pointsPerDay: 10`
- **AND** the `Habit` master is later updated to `pointsPerDay: 15`
- **THEN** the locked week's `WeekHabit.snapshotPoints` SHALL remain `10`

### Requirement: Unit tests for lockWeekAndTransition

The system SHALL provide Vitest unit tests in `backend/src/application/lockWeekAndTransition.test.ts` using mocked `WeekRepository` and `HabitRepository` (and optionally verifying `lockWeek` contract via mock).

#### Scenario: Transition happy path is covered

- **WHEN** the test suite runs
- **THEN** it SHALL assert `lockWeek` is called for the stale week and `getCurrentWeek` returns the new week

#### Scenario: Idempotency is covered

- **WHEN** the test suite runs
- **THEN** it SHALL assert a second `lockWeekAndTransition` call does not invoke `lockWeek` again when no stale week exists

#### Scenario: Snapshot immutability invariant is documented

- **WHEN** the test suite runs
- **THEN** it SHALL include a case verifying that post-lock snapshot values are independent of subsequent habit master changes (mock or explicit assertion on repository contract)
