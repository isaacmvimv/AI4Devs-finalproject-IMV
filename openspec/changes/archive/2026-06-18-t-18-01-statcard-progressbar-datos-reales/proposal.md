# Proposal — T-18-01 · Componentes StatCard y ProgressBar con datos reales de API

**Ticket:** T-18-01 · **User Story:** US-18 · **Sprint:** 4

## Why

Los componentes `StatCard` y `ProgressBar` ya existen en la UI y están conectados al hook `useHabitDashboard`, que ya expone `stats` (con `thisWeekPoints`, `lastWeekPoints`, `penalties`, `maxStreak`) y `todayProgress` calculados a partir de los datos reales de la API de semanas. Sin embargo, falta verificar que los 4 StatCards muestran valores correctos desde la API (especialmente `lastWeekPoints = 0` sin error cuando no hay semana anterior), y que el `ProgressBar` se actualiza en tiempo real (<100ms) con cada toggle de celda mediante optimistic update.

## What Changes

- Verificar y ajustar `StatCard` para que los 4 contadores reflejen datos reales: `thisWeekPoints`, `lastWeekPoints` (0 si no hay semana anterior), `penalties`, `maxStreak`.
- Verificar y ajustar `ProgressBar` para que su porcentaje se recalcule inmediatamente tras cada toggle optimista de celda.
- Añadir tests unitarios `StatCard.test.tsx` y `ProgressBar.test.tsx` cubriendo happy path y edge cases del DoD.
- Asegurar que la actualización de StatCards ocurre en <100ms tras cada interacción (optimistic update ya implementado en `useHabitDashboard`).

## Non-goals

- No se implementa navegación histórica de semanas (T-18-02).
- No se modifica la lógica de dominio de cálculo de estadísticas (`habit.ts`, `week.ts`).
- No se modifican los endpoints de la API backend.
- No se crean nuevos componentes fuera de `StatCard` y `ProgressBar`.

## Capabilities

### New Capabilities
- `stat-display`: Renderizado correcto de los 4 StatCards con datos reales de API y manejo del caso `lastWeekPoints = 0`.
- `progress-realtime`: ProgressBar con actualización reactiva en tiempo real al toggle de celdas.

### Modified Capabilities

_(ninguna — no hay specs existentes afectados)_

## Impact

- **Código afectado:** `frontend/src/presentation/components/StatCard.tsx`, `frontend/src/presentation/components/ProgressBar.tsx`, `frontend/src/presentation/App.tsx`.
- **Tests nuevos:** `StatCard.test.tsx`, `ProgressBar.test.tsx`.
- **Dependencias:** `useHabitDashboard` (ya expone los datos necesarios), API `GET /api/weeks/current` (ya implementada).
- **AC vinculados:** US-18 Scenario 1 (actualización en tiempo real), Scenario 2 (4 contadores correctos); US-13 S3 (ProgressBar).
