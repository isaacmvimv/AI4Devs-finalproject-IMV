# Design — T-13-01 · Implementar funciones puras del dominio: hábitos y estadísticas

**Ticket:** T-13-01 · **User Story:** US-13 · **Change:** `t-13-01-habitos-y-estadisticas`

## Context

El frontend de ConRutina sigue Clean Architecture (`docs/frontend-standards.md`). La capa `frontend/src/domain/` ya contiene `habit.ts`, `reward.ts`, `week.ts` y `fixtures.ts` creados en T-05-04. El hook `useHabitDashboard.ts` consume las funciones de `habit.ts` para toggle, stats y progreso.

**Estado actual vs objetivo (brechas respecto a US-13):**

| Elemento | Estado actual | Objetivo T-13-01 |
|----------|---------------|------------------|
| Tipos `CompletionStatus`, `Habit`, `HabitStats` | ✅ Existen | Mantener y exportar |
| Tipo `HabitFormInput` | ❌ Inline en `createHabitFromFormInput` | Exportar interfaz dedicada |
| `toggleHabitDayCompletion` | ✅ Ciclo correcto | Añadir guard para `dayIndex` fuera de 0–6 |
| `calculateHabitStats` | ⚠️ Funcional; `lastWeekPoints=72` hardcoded | Mantener campo; `lastWeekPoints=0` hasta integración semana (T-13-02+) |
| `calculateTodayProgressPercent` | ⚠️ Usa `Math.round` → entero | Devolver decimal con 2 decimales (~66.67) |
| `computeStreakFromStatus` | ⚠️ Firma `(status[])` cuenta desde índice 0 | Firma `(statuses, currentDayIndex)` — racha hacia atrás desde día actual |
| `createHabitFromFormInput` | ✅ Funcional | Usar `HabitFormInput` |
| `totalPointsFromStats` | ✅ Funcional | Sin cambios |
| `habit.test.ts` | ❌ No existe | Crear con casos del ticket |

**Dependencias previas:** T-05-04 (capas frontend), scaffold de dominio.

## Goals / Non-Goals

**Goals:**

- Alinear `habit.ts` con los AC BDD US-13 S1–S5 y el DoD del ticket.
- Añadir tests Vitest en `frontend/src/domain/habit.test.ts` (happy path + edge).
- Actualizar llamadas a `computeStreakFromStatus` en `toggleHabitDayCompletion` y, si aplica, en consumidores.

**Non-Goals:**

- Dominio de recompensas/semanas (T-13-02).
- Hooks, componentes UI o integración API.
- Cambios en `api-spec.yml` o backend.

## Decisions

### 1. Extender `habit.ts` existente en lugar de reescribir

**Decisión:** Modificar el archivo actual; no crear módulos paralelos.

**Alternativa descartada:** Nuevo `habitDomain.ts` — duplicaría exports ya usados por `useHabitDashboard`.

### 2. Semántica de racha: hacia atrás desde `currentDayIndex`

**Decisión:** `computeStreakFromStatus(statuses, currentDayIndex)` itera desde `currentDayIndex` hacia `0`. Por cada `'completed'` incrementa contador; ante `'failed'` o `'pending'` detiene. Coincide con US-13 S4.

```typescript
export function computeStreakFromStatus(
  statuses: CompletionStatus[],
  currentDayIndex: number
): number {
  if (currentDayIndex < 0 || currentDayIndex > 6) return 0
  let streak = 0
  for (let i = currentDayIndex; i >= 0; i--) {
    if (statuses[i] === 'completed') streak++
    else break
  }
  return streak
}
```

En `toggleHabitDayCompletion`, recalcular `streak` con el último día completado de la semana como referencia **o** el `dayIndex` toggled — usar el máximo índice con estado distinto de `pending` hacia el final de la semana, **o** simplificar: recalcular con `computeStreakFromStatus(newStatus, dayIndex)` solo si el día toggled es el “día de referencia” para la racha visible.

**Decisión refinada:** La racha del hábito (`habit.streak`) se recalcula con `computeStreakFromStatus(newStatus, dayIndex)` usando el `dayIndex` del toggle como ancla temporal coherente con la UI (el usuario togglea el día visible). Si la UI muestra racha global de la semana, `calculateHabitStats` usa `habit.streak` ya almacenado; tests de S4 validan la función pura directamente.

**Alternativa descartada:** Contar solo desde índice 0 (implementación actual) — no cumple US-13 S4.

### 3. Progreso diario con precisión decimal

**Decisión:** `(completedToday / habits.length) * 100` redondeado a 2 decimales vía `Math.round(value * 100) / 100`.

**Alternativa descartada:** Entero redondeado — contradice US-13 S3 (66.67).

### 4. `dayIndex` inválido en toggle

**Decisión:** Devolver `{ ...habit }` sin cambios; no lanzar error (edge del ticket).

### 5. `lastWeekPoints` en `calculateHabitStats`

**Decisión:** Valor fijo `0` en T-13-01 (eliminar constante demo `72`). La semana anterior se resolverá en T-13-02 / integración API. Evita confundir tests de dominio puro.

**Alternativa descartada:** Mantener `72` — comportamiento legacy no especificado en US-13.

### 6. Tests con Vitest colocalizados

**Decisión:** `frontend/src/domain/habit.test.ts` siguiendo el ejemplo en `frontend-standards.md` §Testing. Helpers locales para construir `Habit` de prueba (sin depender de `fixtures.ts` para aislar tests).

**Comando:** `npm test -- frontend/src/domain/habit.test.ts`

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Cambio de firma `computeStreakFromStatus` rompe `toggleHabitDayCompletion` | Actualizar en el mismo PR; grep en `frontend/` |
| UI muestra progreso entero (`todayProgress`) | Verificar componentes que formatean el valor; aceptar decimal |
| `lastWeekPoints=0` cambia total de puntos en demo | Comportamiento correcto según PRD; fixtures no dependen de 72 |
| Cobertura <80% en `domain/` | T-13-02 consolida cobertura; T-13-01 cubre `habit.test.ts` completo |

## Migration Plan

1. Rama `feature/T-13-01-habitos-y-estadisticas` desde `develop`.
2. Ajustar `habit.ts` + tests.
3. Ejecutar `npm test`, `npm run dev` (typecheck/build).
4. Sin migración de datos ni despliegue especial.

## Open Questions

- Ninguna bloqueante. La negociabilidad INVEST sobre “racha dentro de la semana vs consecutiva” queda resuelta por US-13 S4 (hacia atrás desde `currentDayIndex`).
