# Proposal — T-16-05 · Componente WeeklyCalendar y navegación de semanas

**Ticket:** T-16-05 | **User Story:** US-16, US-18 | **Sprint:** Sprint 3 · UI Core — Perfil, Hábitos y Recompensas

## Why

El componente `WeeklyCalendar.tsx` ya existe en el repositorio pero carece de las props y comportamientos del DoD: no deshabilita los botones de navegación según `weekOffset`, no muestra el badge "Semana bloqueada 🔒" cuando la semana está bloqueada, y su interfaz de props no está alineada con el hook `useHabitDashboard`. Completar este componente es necesario para que los tickets posteriores (T-16-06 y sucesivos) puedan integrar la navegación de semanas funcional.

## What Changes

- Actualizar `WeeklyCalendar.tsx` para recibir `weekOffset: number` e `isWeekLocked: boolean` y calcular internamente el rango de fechas y el día actual destacado.
- Cambiar los callbacks de `onPrevWeek`/`onNextWeek` por un único `handleWeekNav(delta: number)` alineado con el hook `useHabitDashboard`.
- Deshabilitar el botón "‹" cuando no hay semana anterior (si el backend no devuelve semanas anteriores; por ahora, nunca deshabilitar hacia atrás).
- Deshabilitar el botón "›" cuando `weekOffset === 0` (no se puede navegar al futuro).
- Mostrar el badge "Semana bloqueada 🔒" cuando `isWeekLocked === true`.
- Destacar el día actual (fondo/borde diferenciador) solo cuando `weekOffset === 0`.
- Añadir tests unitarios en `WeeklyCalendar.test.tsx` cubriendo los casos del DoD.

## Capabilities

### New Capabilities

- `weekly-calendar-navigation`: Navegación entre semanas con controles habilitados/deshabilitados según `weekOffset`, badge de semana bloqueada y destacado del día actual.

### Modified Capabilities

_(ninguna — el componente existe pero no tiene specs previas)_

## Impact

- **Archivo modificado:** `frontend/src/presentation/components/WeeklyCalendar.tsx`
- **Archivo nuevo:** `frontend/src/presentation/components/WeeklyCalendar.test.tsx`
- **Sin cambios en API ni en capa de dominio/aplicación.**
- **Dependencia:** el hook `useHabitDashboard` (T-16-06+) deberá pasar `weekOffset` e `isWeekLocked`; este ticket solo define el contrato de props del componente.

## Non-goals

- No implementar la lógica de `handleWeekNav` en el hook (`useHabitDashboard`); eso pertenece a T-16-06.
- No conectar llamadas reales a la API para cargar datos de la semana seleccionada.
- No implementar el grid de celdas de hábitos (eso es `HabitRow`, ticket T-16-03).
- No modificar `CalendarSection.tsx` ni `App.tsx` para integrar la nueva interfaz de props (puede quedar pendiente para T-16-06).

## Referencia AC Gherkin (US-18 / US-09)

Escenario de navegación (US-18): botones ‹/› invocan `handleWeekNav`; "›" deshabilitado si `weekOffset=0`.
Escenario semana bloqueada (US-09): badge visible si `isWeekLocked=true`.
