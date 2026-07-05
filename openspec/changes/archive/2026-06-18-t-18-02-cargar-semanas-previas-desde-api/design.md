# Design — T-18-02 · Integrar historial: cargar semanas previas desde API

**Ticket:** T-18-02 · **User Story:** US-18

## Estado actual

- `weekApi.ts` ya expone `fetchWeekByOffset(offset)` que llama a `GET /api/weeks?offset=n`.
- `useHabitDashboard.ts` ya tiene `handleWeekNav(offset)` que llama a `fetchWeekByOffset` y usa `weekRequestRef` para manejar race conditions.
- `WeeklyCalendar.tsx` ya recibe `weekOffset`, `isWeekLocked` y `onWeekNav`, y deshabilita "›" cuando `weekOffset === 0`.
- **Falta:** estado de carga visual durante transición, manejo de 404 para deshabilitar "‹", skeleton en calendario.

## Decisiones técnicas

### 1. Nuevo estado en `useHabitDashboard`

Añadir dos estados:

```typescript
const [weekLoading, setWeekLoading] = useState(false)
const [canGoBack, setCanGoBack] = useState(true)
```

En `handleWeekNav`:
- Activar `setWeekLoading(true)` al inicio, desactivar en finally.
- Si `fetchWeekByOffset` lanza error con status 404 → `setCanGoBack(false)`, revertir `weekOffset` al valor anterior.
- En navegación exitosa → `setCanGoBack(true)` (puede haber más semanas atrás).
- Al navegar hacia adelante (offset sube) → restaurar `canGoBack = true`.

### 2. Skeleton en calendario

En `CalendarSection.tsx`, cuando `weekLoading` es `true`:
- Mostrar skeleton animado (divs con `animate-pulse bg-gray-200`) en lugar de `HabitRow`s.
- Mantener `WeeklyCalendar` visible (cabecera con rango de fechas) para contexto.

### 3. Deshabilitar botón "‹" en `WeeklyCalendar`

Añadir prop `canGoBack: boolean` a `WeeklyCalendarProps`:
- Deshabilitar botón "‹" cuando `!canGoBack || weekLoading`.
- Deshabilitar botón "›" cuando `weekOffset === 0 || weekLoading`.

### 4. Props en `App.tsx`

Pasar `weekLoading` y `canGoBack` desde el hook a `CalendarSection` y `WeeklyCalendar`.

## Archivos afectados

| Archivo | Cambio |
|---------|--------|
| `frontend/src/application/useHabitDashboard.ts` | Añadir `weekLoading`, `canGoBack`; manejo 404 en `handleWeekNav` |
| `frontend/src/presentation/components/WeeklyCalendar.tsx` | Prop `canGoBack`, `loading`; deshabilitar botones durante carga |
| `frontend/src/presentation/components/layout/CalendarSection.tsx` | Skeleton condicional cuando `weekLoading` |
| `frontend/src/presentation/App.tsx` | Pasar nuevas props del hook |

## Dependencias

- API `GET /api/weeks?offset=n` ya implementada (US-09).
- `weekApi.fetchWeekByOffset` ya existe.
- Race condition ya manejada con `weekRequestRef` en el hook.
