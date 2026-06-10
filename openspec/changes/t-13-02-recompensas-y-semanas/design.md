# Design — T-13-02 · Recompensas y semanas (dominio frontend)

**Ticket:** T-13-02 · **User Story:** US-13 · **Change:** `t-13-02-recompensas-y-semanas`

## Context

| Artefacto | Estado actual | Objetivo T-13-02 |
|-----------|---------------|------------------|
| `reward.ts` | ✅ Existe; `createRewardFromFormInput` con tipo inline en el argumento | Exportar `RewardFormInput`; tests |
| `week.ts` | ✅ Existe; lógica Lu–Do, `buildWeekData`, `getCurrentDayIndexForWeek(weekOffset, now?)` | Verificar DoD; tests con fechas mockeadas |
| `reward.test.ts` | ❌ No existe | Crear según tabla del ticket |
| `week.test.ts` | ❌ No existe | Crear según tabla del ticket |
| `useHabitDashboard.ts` | ✅ Ya importa `buildWeekData` y `getCurrentDayIndexForWeek` | Sin cambios |

T-13-01 completó `habit.ts` con `lastWeekPoints=0` hasta integración de semanas históricas. El seed de desarrollo (T-03-03) reutiliza la misma lógica de lunes que `buildWeekData(0)` para calcular `Week.startDate`.

**Dependencia:** T-13-01 archivado (`frontend-habit-domain` en `openspec/specs/`).

## Goals / Non-Goals

**Goals:**

- Cumplir DoD del ticket sin romper consumidores existentes.
- Cobertura unitaria de `reward.ts` y `week.ts` (happy path + edge de la tabla del backlog).
- Mantener dominio puro: sin React, fetch, `Date` global sin parámetro opcional en tests.

**Non-Goals:**

- UI, API, Prisma, canje de recompensas, hooks adicionales.
- Cambiar etiquetas `Lun`–`Dom` (ya usadas en `WeeklyCalendar` y en producción).

## Decisions

### 1. No reescribir `week.ts` si cumple el spec

**Decisión:** Conservar la implementación actual de `week.ts` salvo bug detectado en tests. La lógica de lunes (`diff = currentDay === 0 ? -6 : 1 - currentDay`) coincide con T-03-03 dev-seed y con el calendario en UI.

**Alternativa descartada:** Migrar a `date-fns` — dependencia innecesaria para 60 líneas de lógica ya validada en runtime.

### 2. `RewardFormInput` como interfaz explícita

**Decisión:** Sustituir el tipo inline en `createRewardFromFormInput` por `export interface RewardFormInput` con los cuatro campos del formulario y del schema `CreateRewardRequest` (`emoji`, `name`, `description`, `cost`). `Reward.id` permanece `string` (convención cliente; API devuelve string en `api-spec.yml`).

**Alternativa descartada:** Unificar con tipo de `AddRewardModal` — el modal puede seguir definiendo props locales; el dominio exporta su contrato.

### 3. Firma de `getCurrentDayIndexForWeek(weekOffset, now?)`

**Decisión:** Mantener `weekOffset` como primer argumento (requerido por `useHabitDashboard`). El ticket menciona `getCurrentDayIndexForWeek()` sin parámetros; el comportamiento DoD se cumple con `weekOffset=0` y `now` opcional. Documentar en tests que `weekOffset !== 0` → `-1`.

**Alternativa descartada:** Sobrecarga sin `weekOffset` — duplicaría API sin beneficio.

### 4. Tests con fechas fijas

**Decisión:** En `week.test.ts`, pasar `now` explícito (`new Date(2026, 5, 11)` para miércoles 11 jun 2026) para evitar flakes. No mockear `Date` global.

### 5. Estrategia de implementación mínima

**Decisión:** Cambio esperado en código de producción: solo `reward.ts` (tipo `RewardFormInput`). `week.ts` probablemente sin diff. Esfuerzo principal en tests.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Semana que cruza meses: `range` usa mes del lunes | Escenario en `week.test.ts`; comportamiento ya existente |
| `setDate` con DST en zonas horarias extremas | Usar fechas locales del entorno de test; aceptable para MVP |
| Backlog dice "crear archivos" pero ya existen | Artefactos y PR reflejan estado real; marcar ticket implementado tras tests |

## Migration Plan

1. Rama `feature/T-13-02-recompensas-y-semanas` desde `develop`.
2. Ajuste mínimo en `reward.ts` + tests nuevos.
3. `npm test -- frontend/src/domain/reward.test.ts frontend/src/domain/week.test.ts`.
4. Sin despliegue ni migración de datos.

## Open Questions

_(Ninguna bloqueante.)_
