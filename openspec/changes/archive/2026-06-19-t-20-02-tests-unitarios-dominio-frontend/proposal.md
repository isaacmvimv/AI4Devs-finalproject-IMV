# Proposal — T-20-02 · Tests unitarios de funciones de dominio frontend

**Ticket:** T-20-02 · **User Story:** US-20 · **Sprint:** 4 · **Change:** `t-20-02-tests-unitarios-dominio-frontend`

## Why

Las funciones puras del dominio frontend (`habit.ts`, `reward.ts`, `week.ts`) ya tienen tests básicos creados en T-20-01 (configuración Vitest), pero la cobertura no alcanza el ≥80% exigido por US-20 AC Scenario 2. Faltan tests de edge cases para varias funciones críticas: `calculateHabitStats` con todos fallados, `totalPointsFromStats` con resultado negativo, `computeStreakFromStatus` con racha 3 e interrupción en medio, `calculateTodayProgressPercent` con todos completados, y `buildWeekData` con `dayIndex` correcto para hoy.

## What Changes

- Ampliar `frontend/src/domain/habit.test.ts` con tests de edge cases faltantes para `toggleHabitDayCompletion`, `calculateHabitStats`, `calculateTodayProgressPercent`, `computeStreakFromStatus` y `totalPointsFromStats`.
- Ampliar `frontend/src/domain/reward.test.ts` si hay funciones sin cubrir.
- Ampliar `frontend/src/domain/week.test.ts` con edge cases faltantes para `buildWeekData` y verificación de `dayIndex` correcto.
- Alcanzar cobertura ≥80% en `frontend/src/domain/`.

## Capabilities

### New Capabilities

- `domain-unit-tests`: Tests unitarios completos (happy path + edge cases) de todas las funciones puras del dominio frontend, cubriendo los escenarios del DoD del ticket.

### Modified Capabilities

_(ninguna — no se modifican requisitos funcionales existentes)_

## Impact

- Archivos afectados: `frontend/src/domain/habit.test.ts`, `frontend/src/domain/reward.test.ts`, `frontend/src/domain/week.test.ts`, `frontend/src/domain/fixtures.ts` (si se añaden fixtures).
- Sin impacto en código de producción, APIs ni dependencias.
- Requisito: Vitest configurado con `@vitest/coverage-v8` (ya disponible desde T-20-01).

## Non-goals

- No se crean tests de integración de API (eso es T-20-03).
- No se modifica código de producción del dominio.
- No se añaden tests de componentes React ni E2E.
- No se busca cobertura 100%; el objetivo es ≥80% en `frontend/src/domain/`.

## Acceptance Criteria (Gherkin — US-20)

```gherkin
# Scenario 2 — Funciones de dominio cubiertas
Given los tests unitarios se ejecutan
Then existen tests para: toggleHabitDayCompletion, calculateHabitStats, calculateTodayProgressPercent, computeStreakFromStatus, totalPointsFromStats, buildWeekData
And cada función tiene al menos un test de happy path y uno de edge case
```
