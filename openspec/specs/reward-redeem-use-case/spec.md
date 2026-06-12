# Spec — reward-redeem-use-case

**Ticket:** T-12-01 · **User Story:** US-12

Caso de uso `redeemReward`, puerto `RewardRedemptionRepository`, cálculo transaccional de saldo semanal y validación de concurrencia (T-12-01 / US-12).

## Requirements

### Requirement: Redeem reward with transactional balance validation

The application layer SHALL expose `redeemReward(rewardRedemptionRepo, rewardRepo, userId, weekId, rewardId)` that validates week ownership, reward ownership, week lock state, and available weekly balance before persisting a `RewardRedemption`. The available balance SHALL be computed as `sum(completed entries × snapshotPoints) - sum(failed entries × snapshotPenalty) - sum(existing redemptions.pointsSpent)` for the target week. Balance calculation and `RewardRedemption` creation SHALL occur within the same database transaction (US-12 Scenario 1).

#### Scenario: Successful redemption when balance is sufficient

- **WHEN** the week belongs to `userId`, `isLocked` is `false`, available balance is 80 pts, and reward id=2 has `cost=50`
- **AND** `redeemReward` is invoked with `(userId, weekId=1, rewardId=2)`
- **THEN** the use case returns a `RewardRedemption` with `weekId=1`, `rewardId=2`, `pointsSpent=50`, and `redeemedAt` set
- **AND** the remaining available balance for that week becomes 30 pts

#### Scenario: Redemption at exact balance limit

- **WHEN** available balance equals reward `cost` exactly (e.g. 50 pts and cost=50)
- **AND** `redeemReward` is invoked
- **THEN** the use case succeeds and creates one `RewardRedemption` with `pointsSpent=50`
- **AND** subsequent balance for that week is 0 pts

### Requirement: Reject redemption when balance is insufficient

When `available balance < reward.cost`, the use case SHALL throw `UnprocessableError` with code `INSUFFICIENT_POINTS` and details `{ available, required }` where `required` equals `reward.cost`. No `RewardRedemption` row SHALL be created (US-12 Scenario 2).

#### Scenario: Insufficient points

- **WHEN** available balance is 30 pts and reward `cost` is 50
- **AND** `redeemReward` is invoked
- **THEN** the use case throws `UnprocessableError` with code `INSUFFICIENT_POINTS`, `available: 30`, `required: 50`
- **AND** no `RewardRedemption` is persisted

### Requirement: Reject redemption when week is locked

When the target week has `isLocked=true`, the use case SHALL throw `ConflictError` with code `WEEK_LOCKED` before creating a redemption (US-12 Scenario 3).

#### Scenario: Locked week

- **WHEN** week id=1 has `isLocked=true` and belongs to `userId`
- **AND** `redeemReward` is invoked for that week
- **THEN** the use case throws `ConflictError` with code `WEEK_LOCKED`
- **AND** no `RewardRedemption` is persisted

### Requirement: Concurrency-safe redemption

Concurrent redemption attempts for the same week with balance exactly sufficient for one redemption SHALL allow only one success; the loser SHALL receive `UnprocessableError` with code `INSUFFICIENT_POINTS` and the resulting balance SHALL not be negative (US-12 Scenario 4).

#### Scenario: Two simultaneous redemptions with exact balance

- **WHEN** available balance is exactly 50 pts and two concurrent `redeemReward` calls each attempt to spend 50 pts
- **THEN** exactly one call succeeds and creates a `RewardRedemption`
- **AND** the other call throws `UnprocessableError` with code `INSUFFICIENT_POINTS`
- **AND** the final available balance is 0 (not negative)

### Requirement: Ownership validation before redemption

The use case SHALL reject redemption when the week or reward does not exist or does not belong to `userId`, throwing `NotFoundError` with appropriate codes (`WEEK_NOT_FOUND` / `REWARD_NOT_FOUND`) before balance checks.

#### Scenario: Week not owned by user

- **WHEN** week id=1 belongs to another user
- **AND** `redeemReward` is invoked with the wrong `userId`
- **THEN** the use case throws `NotFoundError` with code `WEEK_NOT_FOUND`
- **AND** no `RewardRedemption` is persisted

#### Scenario: Reward not owned by user

- **WHEN** reward id=2 belongs to another user
- **AND** `redeemReward` is invoked
- **THEN** the use case throws `NotFoundError` with code `REWARD_NOT_FOUND` (via `assertRewardOwnedByUser`)
- **AND** no `RewardRedemption` is persisted
