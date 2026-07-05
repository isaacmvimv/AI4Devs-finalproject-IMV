# Design — T-20-02 · Tests unitarios de funciones de dominio frontend

## Context

Vitest ya está configurado con `@vitest/coverage-v8` (T-20-01). Existen tests iniciales en `frontend/src/domain/habit.test.ts`, `reward.test.ts` y `week.test.ts` con cobertura parcial. Las funciones bajo test son puras y no tienen dependencias externas, por lo que no requieren mocks.

Estado actual de los tests existentes:
- **habit.test.ts**: cubre ciclo toggle, out-of-range, inmutabilidad, stats básicos, progress 66.67%, streak básico, `createHabitFromFormInput` y `totalPointsFromStats` — pero faltan edge cases del DoD (todos fallados, resultado negativo, racha 3, interrupción, todos completados).
- **reward.test.ts**: solo cubre `createRewardFromFormInput` — ya completo (la única función exportada).
- **week.test.ts**: cubre `buildWeekData` básico, cruce de meses, `isCurrentWeek`, `isWeekLocked` y `getCurrentDayIndexForWeek` — razonablemente completo.

## Goals / Non-Goals

**Goals:**
- Añadir tests de edge cases faltantes según el DoD del ticket.
- Alcanzar cobertura ≥80% en `frontend/src/domain/`.
- Cada función del DoD con mínimo 1 happy path + 1 edge case.

**Non-Goals:**
- No se modifica código de producción.
- No se crean tests de integración ni E2E.
- No se busca cobertura 100%.

## Decisions

### D1: Ampliar archivos existentes (no crear nuevos)

Los tests se añaden a los archivos `*.test.ts` existentes dentro de los `describe` blocks correspondientes. No se crean archivos de test adicionales.

**Alternativa descartada:** crear archivos separados tipo `habit-edge.test.ts` — fragmentaría la suite sin beneficio.

### D2: Reutilizar helper `buildHabit` y `weekStatus` existentes

Los helpers `buildHabit()` y `weekStatus()` ya cubren la construcción de fixtures. Se reutilizan directamente.

### D3: Foco en gaps del DoD

Según análisis del código existente, los tests faltantes son:
- `calculateHabitStats`: caso "todos fallados", caso con `maxStreak > 0`.
- `totalPointsFromStats`: resultado negativo, resultado cero.
- `computeStreakFromStatus`: racha 3 consecutiva, interrupción en medio con resultado parcial.
- `calculateTodayProgressPercent`: 1/3 completado, todos completados.
- `toggleHabitDayCompletion`: toggle en día pasado verificando streak recalculado.

`reward.test.ts` y `week.test.ts` ya tienen cobertura adecuada; se revisan pero probablemente no necesitan tests adicionales.

## Risks / Trade-offs

- [Riesgo bajo] Los tests existentes podrían fallar si ha cambiado lógica desde T-20-01 → Mitigación: ejecutar `npm test` antes de añadir nuevos tests.
- [Trade-off] Priorizar cantidad de edge cases sobre exhaustividad total → Aceptable dado el objetivo de ≥80%.
