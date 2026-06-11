# Proposal — T-09-02 · Caso de uso: bloquear semana anterior y transición semanal

**Ticket:** T-09-02  
**User Story:** US-09 — API: gestión de semanas y bloqueo automático  
**Sprint:** 2 · Ciclo Semanal y Recompensas API

## Why

T-09-01 ✅ ya expone `getCurrentWeek`, repositorios Prisma y creación atómica de semanas, pero no existe la mecánica que distingue ConRutina: **bloquear la semana anterior** al cambiar de semana ISO, calcular totales, persistir snapshots definitivos e iniciar la nueva semana con celdas `pending`. Sin `lockWeek` y `lockWeekAndTransition`, el historial semanal no es inmutable y T-09-03 no puede orquestar `GET /api/weeks/current` (US-09 esc. 3–5).

## What Changes

- Ampliar `WeekRepository` con `lockWeek(weekId)` — transacción Prisma que:
  - Calcula `totalPointsEarned` y `totalPenalties` a partir de `HabitEntry` (completados × puntos, fallados × penalización).
  - Escribe snapshots definitivos en `WeekHabit` (`snapshotName`, `snapshotPoints`, `snapshotPenalty`) desde el hábito maestro actual.
  - Actualiza `Week` con `isLocked=true` y los totales calculados.
- Implementar `lockWeek` en `prismaWeekRepository.ts` con **idempotencia**: si `isLocked=true`, no modifica filas ni lanza error.
- Crear caso de uso `lockWeekAndTransition(userId, now?)` que:
  - Detecta semana desbloqueada anterior al `startDate` de la semana actual (UTC).
  - Si existe, invoca `lockWeek` y luego delega en `getCurrentWeek` para materializar la semana nueva.
  - Si no hay semana anterior pendiente, delega solo en `getCurrentWeek` (sin efecto adicional).
- Tests unitarios `lockWeekAndTransition.test.ts`: transición (US-09 S3), idempotencia (US-09 S4), snapshots inmutables tras editar `Habit` (US-09 S5), edge totales 0 sin entries completados/fallados.
- **Estado actual:** `getCurrentWeek`, `WeekRepository`, `prismaWeekRepository` y tipos de dominio en `week.ts` existen (T-09-01 ✅); no hay `lockWeek`, `lockWeekAndTransition` ni `findUnlockedWeekBefore`.

## Capabilities

### New Capabilities

- `week-lock-transition`: Método `lockWeek` en repositorio, caso de uso `lockWeekAndTransition` y tests que materializan US-09 esc. 3–5 a nivel de aplicación.

### Modified Capabilities

_(Ninguna — `week-get-current` no cambia requisitos; este ticket añade comportamiento de bloqueo/transición sin alterar `getCurrentWeek`.)_

## Impact

- **Backend / aplicación:** `lockWeekAndTransition.ts` (nuevo); ampliación de `ports/WeekRepository.ts`.
- **Backend / infraestructura:** `prismaWeekRepository.ts` — `lockWeek`, posible `findUnlockedWeekBefore(userId, beforeStartDate)`.
- **Dependencias:** reutiliza `getCurrentWeek`, `getWeekBoundaries`, `HabitRepository`, `createWeekWithHabitsAndEntries` (T-09-01 ✅); modelos Prisma sin cambios de esquema.
- **Tests:** `lockWeekAndTransition.test.ts` (mocks de repositorios; test de inmutabilidad de snapshots).
- **Documentación:** actualizar `docs/data-model.md` (flujo de bloqueo y cálculo de totales); sin cambios en `api-spec.yml` (T-09-03).
- **Tickets posteriores:** T-09-03 (`GET /api/weeks/current` orquesta `lockWeekAndTransition` + stats).

## Non-goals

- Endpoints HTTP `GET /api/weeks/current` o `GET /api/weeks?offset=n` (T-09-03).
- Cálculo de estadísticas de respuesta (`thisWeekPoints`, `maxStreak`, `lastWeekPoints`) — T-09-03 / US-13.
- Wiring en `createApp.ts` / registro de rutas.
- Cambios de esquema Prisma o migraciones.
- Integración frontend.
- Commits Git durante apply (política OpenSpec).

## Criterios de aceptación (Gherkin — alcance T-09-02)

| Origen | Escenario | Aplicabilidad en T-09-02 |
|--------|-----------|---------------------------|
| US-09 | Scenario 1 — Primera semana del usuario | **Indirecto** — `lockWeekAndTransition` delega en `getCurrentWeek` (ya cubierto T-09-01) |
| US-09 | Scenario 2 — Misma semana | **Indirecto** — sin semana anterior desbloqueada, solo `getCurrentWeek` |
| US-09 | Scenario 3 — Cambio de semana (transición) | **Completo** — bloqueo + snapshots + nueva semana con entries `pending` |
| US-09 | Scenario 4 — Idempotencia tras bloqueo | **Completo** — `lockWeek` y segunda ejecución de transición sin duplicados |
| US-09 | Scenario 5 — Snapshot inmutable | **Completo** — snapshots escritos al bloquear no cambian si se edita `Habit` |
| US-09 | Scenario 6 — GET /api/weeks?offset=n | **Fuera de alcance** — T-09-03 |
