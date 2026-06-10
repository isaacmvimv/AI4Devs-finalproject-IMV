# Proposal — T-13-02 · Implementar funciones puras del dominio: recompensas y semanas

**Ticket:** T-13-02 · **User Story:** US-13 · **Sprint:** 1 — APIs Core y Dominio Frontend

## Why

Tras T-13-01, el dominio de hábitos está cubierto con tests; faltan los módulos de **recompensas** y **semanas** que alimentan el calendario (`WeeklyCalendar`) y el formulario de recompensas (`AddRewardModal`). Los archivos `reward.ts` y `week.ts` existen desde el scaffold (T-05-04) pero carecen del tipo explícito `RewardFormInput`, no tienen tests unitarios y el backlog marca el ticket como pendiente. Este change consolida el dominio puro de semanas y recompensas como complemento de US-13 y preparación para US-17.

## What Changes

- Formalizar `frontend/src/domain/reward.ts`: exportar `Reward`, `RewardFormInput` y `createRewardFromFormInput(input, id)` alineados con `api-spec.yml` y `data-model.md`.
- Verificar y, si hace falta, ajustar `frontend/src/domain/week.ts`: tipos `WeekDayLabel`, `WeekData`, `buildWeekData(offset, now?)`, `getCurrentDayIndexForWeek(weekOffset, now?)`.
- Añadir `frontend/src/domain/reward.test.ts` y `frontend/src/domain/week.test.ts` con happy path y edge cases de la tabla del ticket.
- Sin cambios en UI, hooks, API ni persistencia.

## Capabilities

### New Capabilities

- `frontend-reward-domain`: Tipos y factory pura `createRewardFromFormInput` para el catálogo de recompensas del usuario (alineación US-17 formulario).
- `frontend-week-domain`: Generación de etiquetas semanales Lu–Do, rango de fechas y índice del día actual para navegación del calendario (US-13 semanas).

### Modified Capabilities

_(Ninguna — no altera specs archivados ni `frontend-habit-domain`.)_

## Impact

| Área | Alcance |
|------|---------|
| `frontend/src/domain/reward.ts` | Tipo `RewardFormInput`; alinear firma de `createRewardFromFormInput` |
| `frontend/src/domain/week.ts` | Verificación de lógica existente; sin breaking changes en firma |
| `frontend/src/domain/reward.test.ts` | Tests Vitest nuevos |
| `frontend/src/domain/week.test.ts` | Tests Vitest nuevos |
| `frontend/src/application/useHabitDashboard.ts` | Sin cambios (ya importa `buildWeekData` y `getCurrentDayIndexForWeek`) |
| Backend / API / UI | Sin cambios |

## Non-goals

- Lógica de hábitos (`habit.ts`) — cubierta en T-13-01.
- Canje de recompensas, saldo de puntos o `RewardRedemption` (US-12, T-12-xx).
- Cliente HTTP `rewardApi` o integración con `GET /api/rewards` (T-17-01).
- Componentes UI (`RewardCard`, `AddRewardModal`) — US-17, T-17-02/03.
- Persistencia de entidad `Week` en PostgreSQL (US-09).
- Cálculo de `lastWeekPoints` desde semanas históricas (futuro integración API).

## Criterios de aceptación (referencia)

**DoD del ticket:**

1. `buildWeekData(0)` devuelve 7 etiquetas Lu–Do para la semana actual con fechas correctas.
2. `getCurrentDayIndexForWeek()` devuelve 0 (lunes) a 6 (domingo) según la fecha actual; `-1` si la semana visible no es la actual (`weekOffset ≠ 0`).
3. `createRewardFromFormInput` mapea `RewardFormInput → Reward`.

**Alineación AC:** US-13 (navegación semanal); US-17 (datos del formulario de recompensa).
