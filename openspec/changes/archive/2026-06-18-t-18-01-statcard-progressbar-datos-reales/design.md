# Design — T-18-01 · StatCard y ProgressBar con datos reales

**Ticket:** T-18-01 · **User Story:** US-18 · **Change:** `t-18-01-statcard-progressbar-datos-reales`

## Context

Los componentes `StatCard` y `ProgressBar` ya existen como componentes de presentación pura en `frontend/src/presentation/components/`. El hook `useHabitDashboard` ya expone:
- `stats: HabitStats` (`thisWeekPoints`, `lastWeekPoints`, `penalties`, `maxStreak`)
- `todayProgress: number` (porcentaje 0–100)

`App.tsx` ya conecta los 4 StatCards a `stats.*` y el ProgressBar a `todayProgress`. El toggle optimista en `handleToggleDay` actualiza `habits` inmediatamente → los `useMemo` derivados (`todayProgress`, `stats` vía recarga API) se recalculan en el mismo ciclo de render.

**Estado actual vs objetivo:** La integración ya funciona end-to-end. El ticket requiere:
1. Verificar que `lastWeekPoints = 0` se maneja sin error (el backend ya devuelve 0 si no hay semana anterior).
2. Añadir tests unitarios de componentes que validen renderizado con distintos props.
3. Confirmar actualización <100ms (inherente al optimistic update).

## Goals / Non-Goals

**Goals:**
- Tests unitarios para `StatCard` y `ProgressBar` cubriendo happy path y edge cases del DoD.
- Verificar que el flujo completo (toggle → recálculo → re-render) funciona correctamente.

**Non-Goals:**
- No modificar lógica de dominio ni API backend.
- No implementar navegación de semanas históricas (T-18-02).

## Decisions

### D1 — No se requieren cambios estructurales en los componentes

**Decisión:** `StatCard.tsx` y `ProgressBar.tsx` ya son componentes de presentación pura que reciben props y renderizan. No necesitan modificación funcional.

**Alternativa considerada:** Añadir lógica de formateo condicional (ej. mostrar "−" en vez de "0" para lastWeekPoints). Descartada porque el DoD dice explícitamente `lastWeekPoints = 0`.

### D2 — Tests con Vitest + Testing Library + jsdom

**Decisión:** Crear `StatCard.test.tsx` y `ProgressBar.test.tsx` siguiendo el patrón existente (`// @vitest-environment jsdom`, `cleanup()` en `afterEach`).

**Casos de test:**

| Componente | Test | Tipo |
|-----------|------|------|
| `StatCard` | Renderiza valor positivo con prefijo `+` | Happy path |
| `StatCard` | Renderiza valor 0 (lastWeekPoints sin semana anterior) | Edge case |
| `StatCard` | Renderiza valor negativo (penalizaciones) | Happy path |
| `StatCard` | Muestra icono, label y bgColor correctos | Happy path |
| `ProgressBar` | Renderiza porcentaje acorde a props (ej. 67%) | Happy path |
| `ProgressBar` | Renderiza 0% sin NaN cuando progress=0 | Edge case |
| `ProgressBar` | Barra tiene width acorde al porcentaje | Happy path |

### D3 — Verificación de rendimiento <100ms por observación

**Decisión:** La restricción de <100ms se cumple por diseño (setState síncrono + useMemo). Se verificará mediante E2E/observación en el navegador, no con benchmarks automatizados.

## Risks / Trade-offs

- **[Stats se recalculan solo tras recarga API]** → Actualmente `handleToggleDay` hace optimistic update de `habits` pero no recalcula `stats` (que viene del mapeo de la respuesta de la API). El `todayProgress` sí se recalcula vía `useMemo`. Para `thisWeekPoints`/`penalties` la actualización real llega con la siguiente llamada a la API. → Mitigación: verificar en E2E si la latencia percibida es aceptable; si no, considerar cálculo local de stats como mejora futura.

## Open Questions

_(ninguna — el alcance es claro y los componentes ya existen)_
