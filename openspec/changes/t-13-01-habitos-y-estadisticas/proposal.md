# Proposal — T-13-01 · Implementar funciones puras del dominio: hábitos y estadísticas

**Ticket:** T-13-01 · **User Story:** US-13 · **Sprint:** 1 — APIs Core y Dominio Frontend

## Why

La UI de ConRutina necesita actualizar puntos, rachas y progreso diario de forma reactiva sin esperar a la API. El módulo `frontend/src/domain/habit.ts` existe como esqueleto del scaffold (T-05-04) pero no cumple aún los AC BDD de US-13 ni dispone de tests unitarios. Este change consolida la lógica pura del dominio frontend como motor de la experiencia gamificada.

## What Changes

- Completar y alinear `frontend/src/domain/habit.ts` con los tipos `CompletionStatus`, `Habit`, `HabitStats`, `HabitFormInput` y las seis funciones puras del ticket.
- Corregir discrepancias respecto a US-13: firma y semántica de `computeStreakFromStatus(statuses, currentDayIndex)`, precisión decimal en `calculateTodayProgressPercent`, manejo de `dayIndex` fuera de rango en `toggleHabitDayCompletion`.
- Añadir `frontend/src/domain/habit.test.ts` con casos happy path y edge de la tabla del ticket (escenarios US-13 S1–S5).
- Exportar tipos y funciones para consumo desde `application/` sin dependencias externas.

## Capabilities

### New Capabilities

- `frontend-habit-domain`: Lógica pura de hábitos en el frontend — toggle de estados, cálculo de puntos/penalizaciones semanales, progreso del día, rachas y creación desde formulario.

### Modified Capabilities

_(Ninguna — no altera specs archivados de backend ni de capas frontend existentes.)_

## Impact

| Área | Alcance |
|------|---------|
| `frontend/src/domain/habit.ts` | Tipos, funciones puras y ajustes de semántica |
| `frontend/src/domain/habit.test.ts` | Tests Vitest nuevos |
| `frontend/src/application/useHabitDashboard.ts` | Posible ajuste de llamada a `computeStreakFromStatus` si cambia la firma |
| Backend / API | Sin cambios |
| UI / E2E | Sin cambios directos (solo datos derivados más precisos) |

## Non-goals

- Implementar hooks de aplicación o componentes UI (US-14+, T-13-02).
- Integración con API de hábitos o semanas (US-09, US-10).
- Lógica de recompensas (`reward.ts`) o semanas (`week.ts`).
- Persistencia, fetch ni efectos secundarios.
- Refactorizar `fixtures.ts` o el dashboard más allá de adaptaciones mínimas por cambio de firma.

## Criterios de aceptación (referencia US-13)

Los escenarios Gherkin US-13 S1–S5 son la fuente de verdad:

1. **S1** — Toggle ciclo completo: pending → completed → failed → pending.
2. **S2** — Puntos semanales: 2×completed + 1×failed → `thisWeekPoints=20`, `penalties=5`.
3. **S3** — Progreso del día: 2/3 hábitos completados → ~66.67 %.
4. **S4** — Racha reinicia tras `failed`; cuenta hacia atrás desde `currentDayIndex`.
5. **S5** — Array vacío → ceros sin excepción.
