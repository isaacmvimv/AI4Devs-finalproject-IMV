# Design — T-16-05 · Componente WeeklyCalendar y navegación de semanas

## Context

`WeeklyCalendar.tsx` existe en `frontend/src/presentation/components/` pero su contrato de props actual no satisface el DoD del ticket:

**Estado actual:**
```typescript
interface WeeklyCalendarProps {
  weekDates: Array<{ day: string; date: number; month?: string }>
  weekRange: string
  onPrevWeek: () => void
  onNextWeek: () => void
  currentDayIndex: number
}
```

**Problemas:**
1. Los callbacks `onPrevWeek`/`onNextWeek` no corresponden al patrón `handleWeekNav(delta)` del hook `useHabitDashboard`.
2. No existe la prop `weekOffset` (necesaria para deshabilitar "›" y destacar el día actual condicionalmente).
3. No existe la prop `isWeekLocked` (necesaria para el badge "Semana bloqueada 🔒").
4. Sin tests unitarios.

El componente es de **presentación pura** (capa `presentation/components`): no llama a ninguna API ni tiene estado propio; toda la lógica de semana vive en `useHabitDashboard`.

## Goals / Non-Goals

**Goals:**
- Redefinir la interfaz de props con `weekOffset`, `isWeekLocked` y `onWeekNav(delta: number)`.
- Deshabilitar "›" cuando `weekOffset === 0`; nunca deshabilitar "‹" (en el sprint actual no hay límite hacia atrás).
- Mostrar badge cuando `isWeekLocked === true`.
- Destacar el día actual solo cuando `weekOffset === 0` (calcular `todayIndex` internamente según estándar T-16-03).
- Cubrir los casos del DoD con tests unitarios (`WeeklyCalendar.test.tsx`).

**Non-Goals:**
- No implementar el cálculo de `weekOffset` ni la lógica de bloqueo en el hook.
- No modificar `CalendarSection.tsx` ni el resto de la app para pasar las nuevas props (puede quedar pendiente de T-16-06).
- No añadir animaciones de transición entre semanas.

## Decisions

### 1. Unificar callbacks en `onWeekNav(delta: number)`

**Decisión:** sustituir `onPrevWeek`/`onNextWeek` por un único `onWeekNav: (delta: number) => void`.

**Razón:** `useHabitDashboard` ya expone `handleWeekNav(delta)`. Mantener dos callbacks separados obliga al padre a definir dos funciones que son siempre `() => handleWeekNav(-1)` y `() => handleWeekNav(1)`. Un único callback reduce el boilerplate y alinea el contrato con el hook.

### 2. Recibir `weekOffset` como prop, no calcular internamente

**Decisión:** el componente recibe `weekOffset: number` (0 = semana actual, negativo = semanas pasadas).

**Razón:** el componente no conoce el estado de navegación; es el hook quien lo gestiona. Pasar `weekOffset` permite que el componente sea un pure-view sin estado propio.

### 3. Calcular `todayIndex` internamente (patrón T-16-03)

**Decisión:** calcular `todayIndex` dentro del componente siguiendo el estándar ya definido en `frontend-standards.md` (Lunes=0 … Domingo=6).

```typescript
const todayIndex = (() => {
  const day = new Date().getDay()
  return day === 0 ? 6 : day - 1
})()
const isToday = weekOffset === 0 && index === todayIndex
```

**Razón:** coherencia con `HabitRow.tsx` (T-16-03), que ya sigue el mismo patrón.

### 4. Calcular `weekDates` y `weekRange` en el componente a partir de `weekOffset`

**Decisión:** mover el cálculo de fechas de la semana al interior del componente usando `date-fns`.

**Razón:** el componente actual ya recibe `weekDates` y `weekRange` precalculados por el padre, lo que acopla el padre a un formato de datos concreto. Calculándolo internamente a partir de `weekOffset`, el componente es más autónomo y el padre solo necesita pasar un número entero. Esto también simplifica los tests.

**Alternativa descartada:** mantener `weekDates`/`weekRange` como props y solo añadir `weekOffset` e `isWeekLocked`. Se descarta porque duplica la responsabilidad de formateo de fechas entre el hook y el componente.

## Archivos afectados

| Archivo | Acción |
|---------|--------|
| `frontend/src/presentation/components/WeeklyCalendar.tsx` | Modificar — nueva interfaz de props + lógica interna |
| `frontend/src/presentation/components/WeeklyCalendar.test.tsx` | Crear — tests unitarios con jsdom |

## Interfaz de props objetivo

```typescript
interface WeeklyCalendarProps {
  weekOffset: number        // 0 = semana actual; negativo = semanas pasadas
  isWeekLocked: boolean     // true → badge "Semana bloqueada 🔒" y sin interacción
  onWeekNav: (delta: number) => void  // -1 para ‹, +1 para ›
}
```

## Risks / Trade-offs

- **Ruptura de integración con CalendarSection:** el cambio de props rompe `CalendarSection.tsx` hasta que T-16-06 actualice los consumidores. Mitigación: documentar en tasks.md que el componente puede no estar integrado en el dashboard hasta T-16-06; los tests unitarios verifican el comportamiento aislado.
- **date-fns ya es dependencia:** `date-fns 3.6.0` está instalado; no introduce nuevas dependencias.
