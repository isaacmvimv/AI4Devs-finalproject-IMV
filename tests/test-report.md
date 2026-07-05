# Informe de tests — ConRutina

> Generado automáticamente el 2026-07-04 17:22 UTC — suite completa **267/267 PASS**

## Resumen ejecutivo

| Suite | Comando | Tests | PASS | FAIL | Resultado |
| --- | --- | ---: | ---: | ---: | :---: |
| Unitarios (Vitest) | `npm test` | 253 | 253 | 0 | **PASS** |
| Integración (Vitest) | `npm run test:integration` | 14 | 14 | 0 | **PASS** |
| E2E (Playwright) | `node scripts/run-e2e-playwright.mjs` | 9 pasos | — | — | **PASS** |
| **Total automatizado** | — | **267** | **267** | **0** | **PASS** |

### Stack de testing

- **Runner:** Vitest 4.x con entorno `node` (unitarios) y PostgreSQL real (integración).
- **Frontend UI:** Testing Library + jsdom.
- **API HTTP:** supertest sobre Express.
- **E2E:** Playwright contra `http://localhost:5173` (MCP no conectado; ver nota al final).

---

## Suite unitaria (Vitest)

- **Comando:** `npm test`
- **Ejecutado:** 2026-07-04 17:22 UTC
- **Resultado global:** **PASS** (253/253 tests)

### Backend — Capa de aplicación

#### `backend/src/application/calculateWeekAvailableBalance.test.ts`

Cálculo del saldo disponible de la semana.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns earned minus penalties minus prior redemptions` | returns earned minus penalties minus prior redemptions | **PASS** | 5 |
| `returns zero when only pending entries and no redemptions` | returns zero when only pending entries and no redemptions | **PASS** | 1 |
| `returns negative when redemptions exceed earned balance` | returns negative when redemptions exceed earned balance | **PASS** | 1 |

#### `backend/src/application/calculateWeekStats.test.ts`

Estadísticas semanales e índice del día actual.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns 2 for Wednesday in the week` | returns 2 for Wednesday in the week | **PASS** | 4 |
| `caps at 6 for dates after the week` | caps at 6 for dates after the week | **PASS** | 1 |
| `returns zeros for week with only pending entries (US-13 S5 edge)` | returns zeros for week with only pending entries (US-13 S5 edge) | **PASS** | 2 |
| `sums points and penalties from completed and failed entries` | sums points and penalties from completed and failed entries | **PASS** | 1 |
| `counts best streak even when today is failed` | counts best streak even when today is failed | **PASS** | 0 |

#### `backend/src/application/computeCurrentWeekNetPoints.test.ts`

Puntos netos de la semana en curso.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns earned minus penalties for current week entries` | returns earned minus penalties for current week entries | **PASS** | 5 |

#### `backend/src/application/createHabit.test.ts`

Creación de hábitos con validación de entrada.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `calls repo.create with userId and validated fields and returns habit` | should_create_habit_when_input_is_valid calls repo.create with userId and validated fields and returns habit | **PASS** | 14 |
| `throws ValidationError and does not call create when name is empty` | should_throw_validation_error_when_name_is_empty throws ValidationError and does not call create when name is empty | **PASS** | 6 |
| `throws ValidationError and does not call create when name is missing` | should_throw_validation_error_when_name_is_empty throws ValidationError and does not call create when name is missing | **PASS** | 2 |
| `throws ValidationError when pointsPerDay is zero` | should_throw_validation_error_when_points_per_day_invalid throws ValidationError when pointsPerDay is zero | **PASS** | 2 |
| `throws ValidationError when emoji is absent` | should_throw_validation_error_when_emoji_missing throws ValidationError when emoji is absent | **PASS** | 1 |
| `throws ValidationError when penalty is negative` | should_throw_validation_error_when_penalty_negative throws ValidationError when penalty is negative | **PASS** | 2 |

#### `backend/src/application/createReward.test.ts`

Creación de recompensas con validación de entrada.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `calls repo.create with userId and validated fields and returns reward` | should_create_reward_when_input_is_valid calls repo.create with userId and validated fields and returns reward | **PASS** | 14 |
| `throws ValidationError and does not call create when cost is zero` | should_throw_validation_error_when_cost_is_zero throws ValidationError and does not call create when cost is zero | **PASS** | 7 |
| `throws ValidationError and does not call create when name is empty` | should_throw_validation_error_when_name_is_empty throws ValidationError and does not call create when name is empty | **PASS** | 2 |
| `throws ValidationError and does not call create when name is missing` | should_throw_validation_error_when_name_is_empty throws ValidationError and does not call create when name is missing | **PASS** | 2 |
| `throws ValidationError when emoji is absent` | should_throw_validation_error_when_emoji_missing throws ValidationError when emoji is absent | **PASS** | 1 |

#### `backend/src/application/deactivateHabit.test.ts`

Baja lógica de hábitos y sincronización con semana activa.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `soft-deletes habit and removes it from the current unlocked week` | soft-deletes habit and removes it from the current unlocked week | **PASS** | 11 |
| `throws NotFoundError when habit belongs to another user` | throws NotFoundError when habit belongs to another user | **PASS** | 3 |
| `does not remove week habits when there is no current unlocked week` | does not remove week habits when there is no current unlocked week | **PASS** | 2 |

#### `backend/src/application/getActiveHabits.test.ts`

Consulta de hábitos activos del usuario.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns the same array the repository provides` | should_return_active_habits_from_repository returns the same array the repository provides | **PASS** | 10 |
| `returns empty array when repository returns no habits` | should_return_empty_array_when_no_active_habits returns empty array when repository returns no habits | **PASS** | 2 |

#### `backend/src/application/getActiveRewards.test.ts`

Consulta de recompensas activas y estado de canje.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns active rewards with redemption status` | returns active rewards with redemption status | **PASS** | 11 |
| `returns empty array when repository returns no rewards` | returns empty array when repository returns no rewards | **PASS** | 2 |

#### `backend/src/application/getCurrentWeek.test.ts`

Inicialización y sincronización de la semana actual.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `creates week with 7 pending entries per active habit (US-09 S1)` | should_create_week_with_habits_and_entries_when_none_exists creates week with 7 pending entries per active habit (US-09 S1) | **PASS** | 15 |
| `returns existing week when all active habits are already linked (US-09 S2)` | should_return_existing_week_without_creating returns existing week when all active habits are already linked (US-09 S2) | **PASS** | 2 |
| `adds active habits missing from the current week snapshot` | should_link_missing_habits_when_week_exists_without_them adds active habits missing from the current week snapshot | **PASS** | 2 |
| `removes week habits whose master habit is no longer active` | should_remove_inactive_habits_from_current_week_snapshot removes week habits whose master habit is no longer active | **PASS** | 2 |
| `creates week without week habits` | should_create_empty_week_when_no_active_habits creates week without week habits | **PASS** | 2 |
| `propagates error from createWeekWithHabitsAndEntries (rollback expected)` | should_propagate_error_when_transactional_create_fails propagates error from createWeekWithHabitsAndEntries (rollback expected) | **PASS** | 4 |

#### `backend/src/application/getCurrentWeekResponse.test.ts`

Orquestación de respuesta completa de semana actual.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `orchestrates lockWeekAndTransition and returns full DTO (US-09 S3)` | orchestrates lockWeekAndTransition and returns full DTO (US-09 S3) | **PASS** | 15 |
| `retries getCurrentWeek once if lockWeekAndTransition fails (design §7)` | retries getCurrentWeek once if lockWeekAndTransition fails (design §7) | **PASS** | 2 |
| `returns same week id on consecutive calls (US-09 S4)` | returns same week id on consecutive calls (US-09 S4) | **PASS** | 2 |

#### `backend/src/application/getUserProfile.test.ts`

Obtención del perfil de usuario.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns UserProfile when repository finds user including avatarUrl` | should_return_profile_when_user_exists returns UserProfile when repository finds user including avatarUrl | **PASS** | 9 |
| `throws NotFoundError with USER_NOT_FOUND when repository returns null` | should_throw_not_found_when_user_missing throws NotFoundError with USER_NOT_FOUND when repository returns null | **PASS** | 5 |
| `preserves name and avatarUrl null when present in repository result` | should_preserve_nullable_fields preserves name and avatarUrl null when present in repository result | **PASS** | 1 |

#### `backend/src/application/getWeekByOffset.test.ts`

Consulta de semanas históricas por offset.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `delegates to getCurrentWeekResponse when offset is 0 (US-09 S3)` | delegates to getCurrentWeekResponse when offset is 0 (US-09 S3) | **PASS** | 14 |
| `returns locked historical week for offset -1 without lockWeekAndTransition (US-09 S5–6)` | returns locked historical week for offset -1 without lockWeekAndTransition (US-09 S5–6) | **PASS** | 3 |
| `throws WEEK_NOT_FOUND when no week exists at offset (US-09 S6)` | throws WEEK_NOT_FOUND when no week exists at offset (US-09 S6) | **PASS** | 5 |

#### `backend/src/application/lockWeekAndTransition.test.ts`

Bloqueo de semanas obsoletas y transición.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `locks stale week then returns current week via getCurrentWeek (US-09 S3)` | should_lock_stale_week_and_return_current_week locks stale week then returns current week via getCurrentWeek (US-09 S3) | **PASS** | 13 |
| `does not call lockWeek when no stale week exists (US-09 S4)` | should_not_relock_on_second_execution does not call lockWeek when no stale week exists (US-09 S4) | **PASS** | 1 |
| `keeps snapshotPoints from lockWeek mock after habit master changes (US-09 S5)` | should_preserve_locked_snapshots_after_habit_edit keeps snapshotPoints from lockWeek mock after habit master changes (US-09 S5) | **PASS** | 2 |
| `lockWeek mock receives stale week with only pending entries → totales 0` | should_lock_week_with_zero_totals_when_only_pending_entries lockWeek mock receives stale week with only pending entries → totales 0 | **PASS** | 1 |
| `creates current week without calling lockWeek` | should_delegate_to_getCurrentWeek_when_no_stale_week creates current week without calling lockWeek | **PASS** | 1 |

#### `backend/src/application/reconcileWeekRedemption.test.ts`

Reconciliación de canjes tras cambios de puntos.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `does nothing when there is no redemption` | does nothing when there is no redemption | **PASS** | 8 |
| `does nothing when net points still cover the redemption` | does nothing when net points still cover the redemption | **PASS** | 2 |
| `deletes redemption when net points are below points spent` | deletes redemption when net points are below points spent | **PASS** | 3 |

#### `backend/src/application/redeemReward.test.ts`

Canje de recompensas y errores de negocio.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `redeems reward when balance is sufficient (US-12 S1)` | redeems reward when balance is sufficient (US-12 S1) | **PASS** | 10 |
| `succeeds when balance equals cost exactly (US-12 edge)` | succeeds when balance equals cost exactly (US-12 edge) | **PASS** | 4 |
| `propagates INSUFFICIENT_POINTS from repo (US-12 S2)` | propagates INSUFFICIENT_POINTS from repo (US-12 S2) | **PASS** | 5 |
| `propagates WEEK_LOCKED from repo (US-12 S3)` | propagates WEEK_LOCKED from repo (US-12 S3) | **PASS** | 2 |
| `propagates WEEK_REDEMPTION_LIMIT from repo` | propagates WEEK_REDEMPTION_LIMIT from repo | **PASS** | 1 |
| `throws REWARD_NOT_FOUND when reward belongs to another user (US-12 ownership)` | throws REWARD_NOT_FOUND when reward belongs to another user (US-12 ownership) | **PASS** | 2 |
| `throws REWARD_NOT_FOUND when reward does not exist` | throws REWARD_NOT_FOUND when reward does not exist | **PASS** | 1 |

#### `backend/src/application/softDeleteReward.test.ts`

Eliminación lógica de recompensas.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `soft-deletes reward when owned by user and never redeemed` | soft-deletes reward when owned by user and never redeemed | **PASS** | 11 |
| `throws ConflictError when reward has been redeemed` | throws ConflictError when reward has been redeemed | **PASS** | 6 |
| `throws NotFoundError when reward belongs to another user` | throws NotFoundError when reward belongs to another user | **PASS** | 2 |
| `throws NotFoundError when reward does not exist` | throws NotFoundError when reward does not exist | **PASS** | 2 |

#### `backend/src/application/updateHabit.test.ts`

Actualización parcial de hábitos.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `updates habit when owned by user and input is valid` | updates habit when owned by user and input is valid | **PASS** | 14 |
| `throws NotFoundError when habit belongs to another user` | throws NotFoundError when habit belongs to another user | **PASS** | 5 |
| `throws ValidationError when input is invalid` | throws ValidationError when input is invalid | **PASS** | 3 |

#### `backend/src/application/updateHabitEntry.test.ts`

Actualización de entradas diarias de hábito.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `updates entry status on happy path` | updates entry status on happy path | **PASS** | 11 |
| `returns redemptionInvalidated when reconciliation removes a redemption` | returns redemptionInvalidated when reconciliation removes a redemption | **PASS** | 2 |
| `throws ConflictError when week is locked` | throws ConflictError when week is locked | **PASS** | 5 |
| `throws NotFoundError when entry does not exist` | throws NotFoundError when entry does not exist | **PASS** | 2 |

#### `backend/src/application/validation/habit.test.ts`

Esquema de validación para PATCH de hábitos.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `accepts a single valid partial field` | accepts a single valid partial field | **PASS** | 8 |
| `throws ValidationError when pointsPerDay is zero` | throws ValidationError when pointsPerDay is zero | **PASS** | 3 |
| `throws ValidationError when body is empty` | throws ValidationError when body is empty | **PASS** | 2 |

#### `backend/src/application/validation/habitEntry.test.ts`

Esquema de validación para PATCH de entradas.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `accepts status completed` | accepts status completed | **PASS** | 8 |
| `rejects invalid status done` | rejects invalid status done | **PASS** | 2 |
| `rejects empty body` | rejects empty body | **PASS** | 1 |

### Backend — Configuración

#### `backend/src/config.test.ts`

Validación de variables de entorno y valores por defecto.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `applies defaults when only DATABASE_URL is set` | happy path applies defaults when only DATABASE_URL is set | **PASS** | 6 |
| `exits with message when DATABASE_URL is missing` | DATABASE_URL required exits with message when DATABASE_URL is missing | **PASS** | 8 |
| `exits with message when DATABASE_URL is empty` | DATABASE_URL required exits with message when DATABASE_URL is empty | **PASS** | 5 |
| `accepts production` | NODE_ENV enum accepts production | **PASS** | 1 |
| `rejects invalid NODE_ENV values` | NODE_ENV enum rejects invalid NODE_ENV values | **PASS** | 3 |

### Backend — Dominio

#### `backend/src/domain/getWeekBoundaries.test.ts`

Límites ISO de semana (lunes–domingo) en UTC.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns Monday 00:00 UTC to Sunday 23:59:59.999 UTC` | should_return_monday_to_sunday_boundaries_for_monday_input returns Monday 00:00 UTC to Sunday 23:59:59.999 UTC | **PASS** | 6 |
| `returns boundaries for the week containing the Sunday` | should_map_sunday_to_same_iso_week_starting_previous_monday returns boundaries for the week containing the Sunday | **PASS** | 1 |
| `returns correct boundaries when week spans two months` | should_handle_month_boundary_crossing returns correct boundaries when week spans two months | **PASS** | 1 |
| `returns correct boundaries for the first ISO week of the year` | should_handle_year_boundary_crossing returns correct boundaries for the first ISO week of the year | **PASS** | 1 |
| `returns correct boundaries for the last ISO week of the year` | should_handle_year_boundary_crossing returns correct boundaries for the last ISO week of the year | **PASS** | 1 |
| `adds positive weeks in UTC` | adds positive weeks in UTC | **PASS** | 0 |
| `subtracts weeks with negative offset` | subtracts weeks with negative offset | **PASS** | 1 |

### Backend — Infraestructura

#### `backend/src/infrastructure/ensureDemoUser.test.ts`

Asegura usuario demo en arranque.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `does nothing when demo user already exists` | does nothing when demo user already exists | **PASS** | 8 |
| `creates demo user and syncs sequence when missing` | creates demo user and syncs sequence when missing | **PASS** | 5 |

### Backend — Presentación HTTP

#### `backend/src/presentation/http/createApp.test.ts`

Contratos HTTP de todos los endpoints REST (supertest).

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns 200 with full UserProfile on happy path` | /api/profile returns 200 with full UserProfile on happy path | **PASS** | 54 |
| `returns 404 with USER_NOT_FOUND when user not found` | /api/profile returns 404 with USER_NOT_FOUND when user not found | **PASS** | 22 |
| `preserves name: null in response` | /api/profile preserves name: null in response | **PASS** | 10 |
| `returns 200 with active habits on happy path` | /api/habits returns 200 with active habits on happy path | **PASS** | 9 |
| `returns 200 with empty array when no active habits` | /api/habits returns 200 with empty array when no active habits | **PASS** | 10 |
| `returns 201 with created habit on happy path` | /api/habits returns 201 with created habit on happy path | **PASS** | 40 |
| `returns 400 VALIDATION_ERROR when name is invalid` | /api/habits returns 400 VALIDATION_ERROR when name is invalid | **PASS** | 16 |
| `returns 400 VALIDATION_ERROR when pointsPerDay is invalid` | /api/habits returns 400 VALIDATION_ERROR when pointsPerDay is invalid | **PASS** | 10 |
| `returns 400 VALIDATION_ERROR when emoji is invalid` | /api/habits returns 400 VALIDATION_ERROR when emoji is invalid | **PASS** | 21 |
| `returns 400 VALIDATION_ERROR via middleware without invoking use case` | /api/habits returns 400 VALIDATION_ERROR via middleware without invoking use case | **PASS** | 21 |
| `returns 200 with updated habit on happy path` | /api/habits/:id returns 200 with updated habit on happy path | **PASS** | 15 |
| `returns 400 VALIDATION_ERROR when validation fails` | /api/habits/:id returns 400 VALIDATION_ERROR when validation fails | **PASS** | 11 |
| `returns 404 HABIT_NOT_FOUND when habit not found` | /api/habits/:id returns 404 HABIT_NOT_FOUND when habit not found | **PASS** | 12 |
| `returns 404 without invoking use case when id is invalid` | /api/habits/:id returns 404 without invoking use case when id is invalid | **PASS** | 14 |
| `returns 200 with 3 active rewards on happy path` | /api/rewards returns 200 with 3 active rewards on happy path | **PASS** | 11 |
| `returns 200 with empty array when no active rewards` | /api/rewards returns 200 with empty array when no active rewards | **PASS** | 7 |
| `returns 201 with created reward on happy path` | /api/rewards returns 201 with created reward on happy path | **PASS** | 9 |
| `returns 400 VALIDATION_ERROR when cost is zero via middleware without invoking use case` | /api/rewards returns 400 VALIDATION_ERROR when cost is zero via middleware without invoking use case | **PASS** | 9 |
| `returns 204 with empty body on happy path` | /api/rewards/:id returns 204 with empty body on happy path | **PASS** | 8 |
| `returns 409 REWARD_ALREADY_REDEEMED when reward has been redeemed` | /api/rewards/:id returns 409 REWARD_ALREADY_REDEEMED when reward has been redeemed | **PASS** | 8 |
| `returns 404 REWARD_NOT_FOUND when reward not found` | /api/rewards/:id returns 404 REWARD_NOT_FOUND when reward not found | **PASS** | 8 |
| `returns 404 without invoking use case when id is invalid` | /api/rewards/:id returns 404 without invoking use case when id is invalid | **PASS** | 8 |
| `returns 200 with redemptionInvalidated flag on happy path` | /api/habits/:id returns 200 with redemptionInvalidated flag on happy path | **PASS** | 13 |
| `returns 404 HABIT_NOT_FOUND when habit not found` | /api/habits/:id returns 404 HABIT_NOT_FOUND when habit not found | **PASS** | 8 |
| `returns 200 with week, habits, stats and redemptions (US-09 S3)` | /api/weeks/current returns 200 with week, habits, stats and redemptions (US-09 S3) | **PASS** | 8 |
| `returns same week on two consecutive calls (US-09 S4)` | /api/weeks/current returns same week on two consecutive calls (US-09 S4) | **PASS** | 13 |
| `returns 200 with locked historical week for offset=-1 (US-09 S5–6)` | /api/weeks returns 200 with locked historical week for offset=-1 (US-09 S5–6) | **PASS** | 13 |
| `returns 404 WEEK_NOT_FOUND for offset=-5 (US-09 S6)` | /api/weeks returns 404 WEEK_NOT_FOUND for offset=-5 (US-09 S6) | **PASS** | 10 |
| `returns 400 VALIDATION_ERROR for invalid offset` | /api/weeks returns 400 VALIDATION_ERROR for invalid offset | **PASS** | 8 |
| `returns 200 with updated entry on happy path` | /api/habit-entries/:id returns 200 with updated entry on happy path | **PASS** | 8 |
| `returns 400 VALIDATION_ERROR for invalid status without invoking use case` | /api/habit-entries/:id returns 400 VALIDATION_ERROR for invalid status without invoking use case | **PASS** | 9 |
| `returns 404 HABIT_ENTRY_NOT_FOUND when entry not found` | /api/habit-entries/:id returns 404 HABIT_ENTRY_NOT_FOUND when entry not found | **PASS** | 10 |
| `returns 409 WEEK_LOCKED when week is locked` | /api/habit-entries/:id returns 409 WEEK_LOCKED when week is locked | **PASS** | 8 |
| `returns 404 without invoking use case when id is invalid` | /api/habit-entries/:id returns 404 without invoking use case when id is invalid | **PASS** | 9 |
| `returns 201 with redemption on happy path (US-12 S1)` | /api/weeks/:weekId/redemptions returns 201 with redemption on happy path (US-12 S1) | **PASS** | 8 |
| `returns 422 INSUFFICIENT_POINTS with details (US-12 S2)` | /api/weeks/:weekId/redemptions returns 422 INSUFFICIENT_POINTS with details (US-12 S2) | **PASS** | 9 |
| `returns 409 WEEK_LOCKED when week is locked (US-12 S3)` | /api/weeks/:weekId/redemptions returns 409 WEEK_LOCKED when week is locked (US-12 S3) | **PASS** | 9 |
| `returns 409 WEEK_REDEMPTION_LIMIT when week already has a redemption` | /api/weeks/:weekId/redemptions returns 409 WEEK_REDEMPTION_LIMIT when week already has a redemption | **PASS** | 26 |
| `returns 404 WEEK_NOT_FOUND when week not found` | /api/weeks/:weekId/redemptions returns 404 WEEK_NOT_FOUND when week not found | **PASS** | 9 |
| `returns 404 REWARD_NOT_FOUND when reward not found` | /api/weeks/:weekId/redemptions returns 404 REWARD_NOT_FOUND when reward not found | **PASS** | 27 |
| `returns 400 VALIDATION_ERROR for invalid body without invoking use case` | /api/weeks/:weekId/redemptions returns 400 VALIDATION_ERROR for invalid body without invoking use case | **PASS** | 54 |
| `returns 400 VALIDATION_ERROR for non-positive rewardId without invoking use case` | /api/weeks/:weekId/redemptions returns 400 VALIDATION_ERROR for non-positive rewardId without invoking use case | **PASS** | 29 |
| `returns 404 without invoking use case when weekId is invalid` | /api/weeks/:weekId/redemptions returns 404 without invoking use case when weekId is invalid | **PASS** | 13 |

#### `backend/src/presentation/http/middleware/errorHandler.test.ts`

Mapeo de errores tipados a códigos HTTP.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `maps ValidationError to 400 with details` | typed errors — happy path maps ValidationError to 400 with details | **PASS** | 18 |
| `maps NotFoundError to 404` | typed errors — happy path maps NotFoundError to 404 | **PASS** | 3 |
| `maps ConflictError to 409` | typed errors — happy path maps ConflictError to 409 | **PASS** | 2 |
| `maps UnprocessableError to 422` | typed errors — happy path maps UnprocessableError to 422 | **PASS** | 2 |
| `maps generic Error to 500 INTERNAL_ERROR in development` | generic errors — edge cases maps generic Error to 500 INTERNAL_ERROR in development | **PASS** | 2 |
| `hides stack and original message in production` | generic errors — edge cases hides stack and original message in production | **PASS** | 5 |
| `omits stack for typed errors in production` | generic errors — edge cases omits stack for typed errors in production | **PASS** | 3 |
| `serializes code and message as strings without legacy error field` | response format serializes code and message as strings without legacy error field | **PASS** | 2 |

#### `backend/src/presentation/http/middleware/validateBody.test.ts`

Middleware de validación de body con Zod.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `calls next() without error when body is valid` | calls next() without error when body is valid | **PASS** | 11 |
| `calls next with ValidationError when one field is invalid` | calls next with ValidationError when one field is invalid | **PASS** | 2 |
| `calls next with ValidationError containing multiple details` | calls next with ValidationError containing multiple details | **PASS** | 5 |
| `maps createRewardSchema cost: 0 to ValidationError with field cost` | maps createRewardSchema cost: 0 to ValidationError with field cost | **PASS** | 2 |

### Frontend — Aplicación (hooks)

#### `frontend/src/application/useHabitDashboard.test.ts`

Hook principal del dashboard: toggle, navegación y errores.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `carga la semana activa al montar` | carga la semana activa al montar | **PASS** | 106 |
| `handleToggleDay actualiza el estado local y llama a updateHabitEntry` | handleToggleDay actualiza el estado local y llama a updateHabitEntry | **PASS** | 103 |
| `handleToggleDay actualiza stats.thisWeekPoints al completar` | handleToggleDay actualiza stats.thisWeekPoints al completar | **PASS** | 91 |
| `handleToggleDay actualiza stats.penalties al marcar como failed` | handleToggleDay actualiza stats.penalties al marcar como failed | **PASS** | 75 |
| `handleToggleDay revierte stats cuando la API falla` | handleToggleDay revierte stats cuando la API falla | **PASS** | 142 |
| `handleToggleDay revierte el estado y muestra un toast en error` | handleToggleDay revierte el estado y muestra un toast en error | **PASS** | 162 |
| `isWeekLocked=true evita que handleToggleDay llame a updateHabitEntry` | isWeekLocked=true evita que handleToggleDay llame a updateHabitEntry | **PASS** | 87 |
| `handleToggleDay no permite toggle en días futuros de la semana actual` | handleToggleDay no permite toggle en días futuros de la semana actual | **PASS** | 63 |
| `handleDeleteHabit elimina el hábito y sincroniza la semana actual` | handleDeleteHabit elimina el hábito y sincroniza la semana actual | **PASS** | 80 |
| `handleDeleteHabit recalcula stats al eliminar un hábito con puntos` | handleDeleteHabit recalcula stats al eliminar un hábito con puntos | **PASS** | 81 |
| `handleDeleteHabit revierte stats cuando la API falla` | handleDeleteHabit revierte stats cuando la API falla | **PASS** | 88 |
| `handleDeleteHabit restaura el hábito y muestra un toast en error` | handleDeleteHabit restaura el hábito y muestra un toast en error | **PASS** | 94 |
| `weekLoading es true durante handleWeekNav y vuelve a false` | weekLoading es true durante handleWeekNav y vuelve a false | **PASS** | 82 |
| `404 en fetchWeekByOffset → canGoBack=false y weekOffset revierte` | 404 en fetchWeekByOffset → canGoBack=false y weekOffset revierte | **PASS** | 78 |
| `race condition: dos navegaciones rápidas, solo la última aplica` | race condition: dos navegaciones rápidas, solo la última aplica | **PASS** | 75 |
| `handleWeekNav llama a fetchWeekByOffset y actualiza habits/isWeekLocked/isCurrentWeek` | handleWeekNav llama a fetchWeekByOffset y actualiza habits/isWeekLocked/isCurrentWeek | **PASS** | 70 |

#### `frontend/src/application/useUserProfile.test.ts`

Hook de carga del perfil de usuario.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `carga el perfil correctamente (Sc. 1)` | carga el perfil correctamente (Sc. 1) | **PASS** | 120 |
| `expone un error cuando la API falla (Sc. 3)` | expone un error cuando la API falla (Sc. 3) | **PASS** | 75 |

### Frontend — Clientes HTTP

#### `frontend/src/infrastructure/habitApi.test.ts`

Cliente HTTP de hábitos.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `devuelve la lista de hábitos (200)` | fetchHabits devuelve la lista de hábitos (200) | **PASS** | 8 |
| `crea un hábito (201)` | createHabit crea un hábito (201) | **PASS** | 1 |
| `lanza ApiError con details en error de validación (400)` | createHabit lanza ApiError con details en error de validación (400) | **PASS** | 4 |
| `elimina un hábito (204)` | deleteHabit elimina un hábito (204) | **PASS** | 1 |
| `lanza ApiError HABIT_NOT_FOUND (404)` | deleteHabit lanza ApiError HABIT_NOT_FOUND (404) | **PASS** | 1 |

#### `frontend/src/infrastructure/habitEntryApi.test.ts`

Cliente HTTP de entradas diarias.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `actualiza el estado de una entrada (200)` | updateHabitEntry actualiza el estado de una entrada (200) | **PASS** | 8 |
| `lanza ApiError WEEK_LOCKED cuando la semana está cerrada (409)` | updateHabitEntry lanza ApiError WEEK_LOCKED cuando la semana está cerrada (409) | **PASS** | 4 |

#### `frontend/src/infrastructure/rewardApi.test.ts`

Cliente HTTP de recompensas y canjes.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `devuelve la lista de recompensas (200)` | fetchRewards devuelve la lista de recompensas (200) | **PASS** | 8 |
| `crea una recompensa (201)` | createReward crea una recompensa (201) | **PASS** | 1 |
| `elimina una recompensa (204)` | deleteReward elimina una recompensa (204) | **PASS** | 1 |
| `happy path: llama a POST /api/weeks/:id/redemptions y retorna el resultado (201)` | redeemReward happy path: llama a POST /api/weeks/:id/redemptions y retorna el resultado (201) | **PASS** | 6 |
| `edge case 422 INSUFFICIENT_POINTS: lanza ApiError con details tipados` | redeemReward edge case 422 INSUFFICIENT_POINTS: lanza ApiError con details tipados | **PASS** | 5 |

#### `frontend/src/infrastructure/weekApi.test.ts`

Cliente HTTP de semanas.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `devuelve la semana activa (200)` | fetchCurrentWeek devuelve la semana activa (200) | **PASS** | 8 |
| `devuelve una semana histórica bloqueada (200)` | fetchWeekByOffset devuelve una semana histórica bloqueada (200) | **PASS** | 1 |
| `lanza ApiError WEEK_NOT_FOUND (404)` | fetchWeekByOffset lanza ApiError WEEK_NOT_FOUND (404) | **PASS** | 4 |

### Frontend — Componentes UI

#### `frontend/src/presentation/components/AddHabitModal.test.tsx`

Modal de alta de hábito y validaciones.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `5.2 submit con nombre vacío → error inline visible, onAdd no invocado` | 5.2 submit con nombre vacío → error inline visible, onAdd no invocado | **PASS** | 884 |
| `5.3 submit con puntos = 0 → error inline visible, onAdd no invocado` | 5.3 submit con puntos = 0 → error inline visible, onAdd no invocado | **PASS** | 395 |
| `5.4 submit válido → onAdd invocado con datos correctos; modal llama a onClose` | 5.4 submit válido → onAdd invocado con datos correctos; modal llama a onClose | **PASS** | 254 |
| `5.5 error de API → onAdd invocado, modal permanece abierto (onClose no llamado)` | 5.5 error de API → onAdd invocado, modal permanece abierto (onClose no llamado) | **PASS** | 252 |

#### `frontend/src/presentation/components/AddRewardModal.test.tsx`

Modal de alta de recompensa y validaciones.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `2.2 submit con nombre vacío → error inline visible, onAdd no invocado` | 2.2 submit con nombre vacío → error inline visible, onAdd no invocado | **PASS** | 752 |
| `2.3 submit con coste = 0 → error inline visible, onAdd no invocado` | 2.3 submit con coste = 0 → error inline visible, onAdd no invocado | **PASS** | 403 |
| `2.4 submit válido → onAdd invocado con datos correctos, onClose invocado` | 2.4 submit válido → onAdd invocado con datos correctos, onClose invocado | **PASS** | 265 |
| `2.5 error de API → onAdd invocado, onClose NO invocado, modal permanece abierto` | 2.5 error de API → onAdd invocado, onClose NO invocado, modal permanece abierto | **PASS** | 234 |

#### `frontend/src/presentation/components/HabitRow.test.tsx`

Fila de hábito: toggle, racha, read-only y eliminación.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `2.2 happy path toggle: click en celda pendiente llama onToggle con índice correcto` | 2.2 happy path toggle: click en celda pendiente llama onToggle con índice correcto | **PASS** | 595 |
| `2.3 isReadOnly=true: celdas son div (no button), botón × ausente` | 2.3 isReadOnly=true: celdas son div (no button), botón × ausente | **PASS** | 10 |
| `2.4 estado completado: celda con clase verde e icono check` | 2.4 estado completado: celda con clase verde e icono check | **PASS** | 49 |
| `2.5 estado fallado: celda con clase roja e icono x` | 2.5 estado fallado: celda con clase roja e icono x | **PASS** | 57 |
| `2.6 indicador de hoy: presente cuando weekOffset=0, ausente cuando weekOffset=-1` | 2.6 indicador de hoy: presente cuando weekOffset=0, ausente cuando weekOffset=-1 | **PASS** | 84 |
| `2.7 botón ×: click llama onDelete(); ausente en isReadOnly` | 2.7 botón ×: click llama onDelete(); ausente en isReadOnly | **PASS** | 49 |
| `días futuros en semana actual son read-only (div, no button)` | días futuros en semana actual son read-only (div, no button) | **PASS** | 28 |
| `en semanas pasadas (weekOffset=-1) todos los días son editables si no es readOnly` | en semanas pasadas (weekOffset=-1) todos los días son editables si no es readOnly | **PASS** | 36 |
| `2.8 racha: muestra 🔥 5 días cuando streak=5; sin indicador cuando streak=0` | 2.8 racha: muestra 🔥 5 días cuando streak=5; sin indicador cuando streak=0 | **PASS** | 30 |

#### `frontend/src/presentation/components/ProgressBar.test.tsx`

Barra de progreso diario.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `renders percentage according to props` | renders percentage according to props | **PASS** | 100 |
| `renders 0% without NaN when progress is 0` | renders 0% without NaN when progress is 0 | **PASS** | 12 |
| `inner bar has width matching percentage` | inner bar has width matching percentage | **PASS** | 13 |

#### `frontend/src/presentation/components/RewardCard.test.tsx`

Tarjeta de recompensa: canje, límites y eliminación.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `SC1 — currentPoints < cost → botón "Faltan X pts" y disabled` | SC1 — currentPoints < cost → botón "Faltan X pts" y disabled | **PASS** | 572 |
| `SC2 — currentPoints >= cost → botón "Canjear" habilitado` | SC2 — currentPoints >= cost → botón "Canjear" habilitado | **PASS** | 31 |
| `SC3 — canje exitoso → onRedeemSuccess llamado con rewardId y pointsSpent` | SC3 — canje exitoso → onRedeemSuccess llamado con rewardId y pointsSpent | **PASS** | 58 |
| `SC4 — error 422 → toast error, onRedeemSuccess no llamado` | SC4 — error 422 → toast error, onRedeemSuccess no llamado | **PASS** | 41 |
| `SC5 — clic en eliminar → onDelete llamado cuando canDelete es true` | SC5 — clic en eliminar → onDelete llamado cuando canDelete es true | **PASS** | 31 |
| `SC6 — no muestra botón eliminar cuando canDelete es false` | SC6 — no muestra botón eliminar cuando canDelete es false | **PASS** | 40 |
| `SC7 — límite semanal alcanzado → botón "Límite semanal" disabled` | SC7 — límite semanal alcanzado → botón "Límite semanal" disabled | **PASS** | 31 |
| `SC8 — recompensa canjeada esta semana → botón "¡Canjeada!" disabled` | SC8 — recompensa canjeada esta semana → botón "¡Canjeada!" disabled | **PASS** | 18 |

#### `frontend/src/presentation/components/StatCard.test.tsx`

Tarjeta de estadística con formato de signo.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `renders positive value with + prefix` | renders positive value with + prefix | **PASS** | 106 |
| `renders value 0 as +0` | renders value 0 as +0 | **PASS** | 18 |
| `renders negative value without + prefix` | renders negative value without + prefix | **PASS** | 8 |
| `shows icon, label and bgColor correctly` | shows icon, label and bgColor correctly | **PASS** | 15 |

#### `frontend/src/presentation/components/UserProfileCard.test.tsx`

Tarjeta de perfil: loading, éxito y error.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `muestra un skeleton mientras carga (Sc. 2)` | muestra un skeleton mientras carga (Sc. 2) | **PASS** | 404 |
| `muestra nombre, email y avatar con iniciales en éxito (Sc. 1)` | muestra nombre, email y avatar con iniciales en éxito (Sc. 1) | **PASS** | 62 |
| `muestra "Usuario desconocido" si la API falla (Sc. 3)` | muestra "Usuario desconocido" si la API falla (Sc. 3) | **PASS** | 30 |
| `usa el email como nombre e iniciales cuando name es null (Sc. 4)` | usa el email como nombre e iniciales cuando name es null (Sc. 4) | **PASS** | 26 |

#### `frontend/src/presentation/components/WeeklyCalendar.test.tsx`

Calendario semanal y navegación entre semanas.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `clic en ‹ invoca onWeekNav(-1)` | clic en ‹ invoca onWeekNav(-1) | **PASS** | 109 |
| `clic en › invoca onWeekNav(+1)` | clic en › invoca onWeekNav(+1) | **PASS** | 29 |
| `› tiene disabled cuando weekOffset === 0` | › tiene disabled cuando weekOffset === 0 | **PASS** | 56 |
| `› NO tiene disabled cuando weekOffset === -1` | › NO tiene disabled cuando weekOffset === -1 | **PASS** | 25 |
| `badge Semana bloqueada 🔒 visible cuando isWeekLocked=true` | badge Semana bloqueada 🔒 visible cuando isWeekLocked=true | **PASS** | 20 |
| `badge no visible cuando isWeekLocked=false` | badge no visible cuando isWeekLocked=false | **PASS** | 13 |

### Frontend — Dominio

#### `frontend/src/domain/habit.test.ts`

Lógica pura de hábitos: toggle, stats, rachas y puntos.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `cycles pending → completed → failed → pending (US-13 S1)` | cycles pending → completed → failed → pending (US-13 S1) | **PASS** | 5 |
| `returns habit unchanged when dayIndex is out of range` | returns habit unchanged when dayIndex is out of range | **PASS** | 2 |
| `recalculates streak from current day when toggling a past day` | recalculates streak from current day when toggling a past day | **PASS** | 1 |
| `does not mutate the original habit` | does not mutate the original habit | **PASS** | 1 |
| `aggregates points and penalties (US-13 S2)` | aggregates points and penalties (US-13 S2) | **PASS** | 1 |
| `returns thisWeekPoints=0 and penalties=total when all days failed` | returns thisWeekPoints=0 and penalties=total when all days failed | **PASS** | 1 |
| `returns maxStreak from habit with longest consecutive streak in the week` | returns maxStreak from habit with longest consecutive streak in the week | **PASS** | 1 |
| `counts best streak even when today is failed` | counts best streak even when today is failed | **PASS** | 0 |
| `returns zeros for empty habits array (US-13 S5)` | returns zeros for empty habits array (US-13 S5) | **PASS** | 1 |
| `returns decimal percent with two decimals (US-13 S3)` | returns decimal percent with two decimals (US-13 S3) | **PASS** | 1 |
| `returns 33.33 when 1 of 3 completed` | returns 33.33 when 1 of 3 completed | **PASS** | 1 |
| `returns 100 when all completed` | returns 100 when all completed | **PASS** | 1 |
| `returns 0 when habits array is empty` | returns 0 when habits array is empty | **PASS** | 0 |
| `returns longest consecutive run up to current day` | returns longest consecutive run up to current day | **PASS** | 0 |
| `returns 0 when all days are pending` | returns 0 when all days are pending | **PASS** | 0 |
| `returns 0 for invalid upToDayIndex` | returns 0 for invalid upToDayIndex | **PASS** | 0 |
| `counts completed days backwards from currentDayIndex (US-13 S4)` | counts completed days backwards from currentDayIndex (US-13 S4) | **PASS** | 0 |
| `returns 3 for three consecutive completed days` | returns 3 for three consecutive completed days | **PASS** | 0 |
| `returns 1 when failed interrupts completed streak` | returns 1 when failed interrupts completed streak | **PASS** | 0 |
| `returns 0 when all days are pending` | returns 0 when all days are pending | **PASS** | 0 |
| `returns 0 for invalid currentDayIndex` | returns 0 for invalid currentDayIndex | **PASS** | 0 |
| `creates habit with 7 pending days and streak 0` | creates habit with 7 pending days and streak 0 | **PASS** | 0 |
| `returns net points after penalties` | returns net points after penalties | **PASS** | 0 |
| `returns negative when penalties exceed points` | returns negative when penalties exceed points | **PASS** | 0 |
| `returns zero when penalties equal points` | returns zero when penalties equal points | **PASS** | 0 |
| `subtracts prior redemptions from available balance` | subtracts prior redemptions from available balance | **PASS** | 0 |

#### `frontend/src/domain/reward.test.ts`

Mapeo de formulario a entidad Reward.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `maps RewardFormInput to Reward (US-13 / T-13-02)` | maps RewardFormInput to Reward (US-13 / T-13-02) | **PASS** | 6 |
| `does not mutate the original input` | does not mutate the original input | **PASS** | 1 |

#### `frontend/src/domain/week.test.ts`

Construcción de datos de semana y bloqueo.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns 7 labels and dates for current week (miércoles 10 jun 2026)` | returns 7 labels and dates for current week (miércoles 10 jun 2026) | **PASS** | 8 |
| `returns previous week when weekOffset is -1` | returns previous week when weekOffset is -1 | **PASS** | 1 |
| `handles week that crosses months` | handles week that crosses months | **PASS** | 1 |
| `only weekOffset 0 is the current editable week` | / isWeekLocked only weekOffset 0 is the current editable week | **PASS** | 1 |
| `returns 2 for Wednesday in current week` | returns 2 for Wednesday in current week | **PASS** | 1 |
| `returns 6 for Sunday in current week` | returns 6 for Sunday in current week | **PASS** | 0 |
| `returns -1 when weekOffset is not 0` | returns -1 when weekOffset is not 0 | **PASS** | 1 |

---

## Suite de integración (Vitest + PostgreSQL)

- **Comando:** `npm run test:integration`
- **Ejecutado:** 2026-07-04 17:22 UTC
- **Resultado global:** **PASS** (14/14 tests)

### Integración (API + PostgreSQL)

#### `backend/src/__tests__/integration/habitEntries.integration.test.ts`

PATCH /api/habit-entries/:id contra PostgreSQL real.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns 200 when updating entry in active week` | /api/habit-entries/:id returns 200 when updating entry in active week | **PASS** | 157 |
| `returns 409 with WEEK_LOCKED when week is locked` | /api/habit-entries/:id returns 409 with WEEK_LOCKED when week is locked | **PASS** | 56 |

#### `backend/src/__tests__/integration/habits.integration.test.ts`

POST/DELETE /api/habits contra PostgreSQL real.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns 201 with created habit on valid body` | /api/habits returns 201 with created habit on valid body | **PASS** | 186 |
| `returns 400 with VALIDATION_ERROR when name is missing` | /api/habits returns 400 with VALIDATION_ERROR when name is missing | **PASS** | 43 |
| `returns 204 and excludes habit from GET /api/habits` | /api/habits/:id returns 204 and excludes habit from GET /api/habits | **PASS** | 66 |
| `returns 404 with HABIT_NOT_FOUND when habit does not exist` | /api/habits/:id returns 404 with HABIT_NOT_FOUND when habit does not exist | **PASS** | 42 |

#### `backend/src/__tests__/integration/profile.integration.test.ts`

GET /api/profile contra PostgreSQL real.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns 200 with user profile when user exists` | /api/profile returns 200 with user profile when user exists | **PASS** | 120 |
| `returns 404 with USER_NOT_FOUND when no user exists` | /api/profile returns 404 with USER_NOT_FOUND when no user exists | **PASS** | 48 |

#### `backend/src/__tests__/integration/redemptions.integration.test.ts`

POST /api/weeks/:weekId/redemptions contra PostgreSQL real.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `returns 201 when user has enough points` | /api/weeks/:weekId/redemptions returns 201 when user has enough points | **PASS** | 200 |
| `returns 409 WEEK_REDEMPTION_LIMIT on second redemption in same week` | /api/weeks/:weekId/redemptions returns 409 WEEK_REDEMPTION_LIMIT on second redemption in same week | **PASS** | 109 |
| `returns 422 with INSUFFICIENT_POINTS when not enough points` | /api/weeks/:weekId/redemptions returns 422 with INSUFFICIENT_POINTS when not enough points | **PASS** | 73 |

#### `backend/src/__tests__/integration/weeks.integration.test.ts`

GET /api/weeks/current y sincronización de hábitos.

| Test | Descripción | Resultado | Duración (ms) |
| --- | --- | :---: | ---: |
| `incluye un hábito creado vía POST tras inicializar la semana vacía` | /api/weeks/current — sincronización con hábitos activos incluye un hábito creado vía POST tras inicializar la semana vacía | **PASS** | 277 |
| `excluye un hábito desactivado y revierte puntos/penalizaciones de la semana actual` | /api/weeks/current — sincronización con hábitos activos excluye un hábito desactivado y revierte puntos/penalizaciones de la semana actual | **PASS** | 198 |
| `conserva snapshots WeekHabit en semanas bloqueadas tras DELETE` | /api/weeks/current — sincronización con hábitos activos conserva snapshots WeekHabit en semanas bloqueadas tras DELETE | **PASS** | 64 |

---


## E2E — Playwright

- **Herramienta:** Playwright (CLI fallback — MCP user-Playwright no disponible en sesión)
- **Comando:** `node scripts/run-e2e-playwright.mjs`
- **Ejecutado:** 2026-07-04T17:18:48.865Z
- **URL:** http://localhost:5173
- **Resultado global:** **PASS**

### Escenario: Dashboard ConRutina — carga, perfil y modal de hábito

Test E2E manual que valida la carga del dashboard en localhost:5173, la presencia de elementos clave y la apertura del modal de nuevo hábito, con capturas en cada paso relevante.

| Paso | Acción | Resultado |
| --- | --- | :---: |
| 1 | Navegar a http://localhost:5173 | **PASS** |
| 2 | Captura del dashboard inicial (full page) | **PASS** |
| 3 | Verificar que la aplicación carga (título o marca ConRutina) | **PASS** |
| 4 | Verificar tarjeta de perfil o datos de usuario visibles | **PASS** |
| 5 | Verificar botón de añadir hábito presente | **PASS** |
| 6 | Abrir modal de nuevo hábito y capturar pantalla | **PASS** |
| 7 | Verificar modal de hábito abierto | **PASS** |
| 8 | Verificar contenido del dashboard (elementos renderizados: 6) | **PASS** |
| 9 | Captura final del dashboard tras interacción | **PASS** |

### Capturas de pantalla

- Dashboard inicial: [Dashboard inicial](e2e-01-dashboard-inicial.png)
- Modal de nuevo hábito: [Modal de nuevo hábito](e2e-02-modal-habito.png)
- Dashboard final: [Dashboard final](e2e-03-dashboard-final.png)

## Artefactos generados

- `tests/unit-results.json` — salida JSON de Vitest (unitarios)
- `tests/integration-results.json` — salida JSON de Vitest (integración)
- `tests/e2e-results.json` — metadatos del test E2E
- `tests/e2e-*.png` — capturas de pantalla E2E
