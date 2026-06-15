## Context

`useHabitDashboard` (`frontend/src/application/useHabitDashboard.ts`) gestiona hoy `habits`/`rewards` con `useState` inicializado desde `domain/fixtures.ts` (`INITIAL_HABITS`/`INITIAL_REWARDS`), y deriva `stats`, `weekData`, `isCurrentWeek`/`isWeekLocked` con funciones puras de `domain/habit.ts` y `domain/week.ts` que no dependen de fechas reales del backend.

T-16-01 ya añadió `frontend/src/infrastructure/habitApi.ts` (`fetchHabits`, `createHabit`, `deleteHabit`) y `habitEntryApi.ts` (`updateHabitEntry`), junto con `apiRequest`/`ApiError` en `httpClient.ts`. No existe todavía cliente HTTP para `/api/weeks/*`. El backend ya implementa `GET /api/weeks/current`, `GET /api/weeks?offset=`, `POST /api/habits`, `DELETE /api/habits/:id` y `PATCH /api/habit-entries/:id` (`docs/api-spec.yml`).

El `WeekResponse` del backend no es un `Habit[]` directamente: agrupa por `weekHabit` (snapshot de nombre/puntos/penalización en el momento de crear la semana) + `entries` (7 filas con `id`, `dayIndex`, `status`). El dominio `Habit` (`domain/habit.ts`) espera `completionStatus: CompletionStatus[]` (array de 7 indexado por día) y `streak` calculado. Hace falta un mapeo `WeekResponseDto → Habit[]` y conservar, por hábito, el `id` numérico de cada `entry` (para `PATCH /api/habit-entries/:id`) y el `id` del hábito (para `DELETE /api/habits/:id`).

## Goals / Non-Goals

**Goals:**
- Cargar la semana activa desde la API al montar y mapearla a los tipos de dominio existentes (`Habit`, `HabitStats`) sin romper el contrato de retorno consumido por `presentation/`.
- Conectar `handleToggleDay`, `handleAddHabit`, `handleDeleteHabit`, `handleWeekNav` con `weekApi`/`habitApi`/`habitEntryApi`, con optimistic updates + rollback + toast (`sonner`) en error.
- Derivar `isCurrentWeek`/`isWeekLocked` de `week.isLocked` (backend) en lugar de solo del cálculo local de `domain/week.ts`.
- Añadir `frontend/src/infrastructure/weekApi.ts` siguiendo el patrón de `habitApi.ts` (DTOs alineados con `api-spec.yml`, `apiRequest`, `ApiError`).

**Non-Goals:**
- No se crea `rewardApi.ts`: `handleAddReward`/`handleRedeemReward`/`handleDeleteReward` siguen sobre `rewards`/`INITIAL_REWARDS` en estado local, sin tocar `/api/rewards` ni `/api/weeks/{weekId}/redemptions`.
- No se cambia el contrato público del hook (nombres de propiedades/handlers devueltos) salvo añadir `loading`/`error`, para no romper `presentation/`.
- No se modifica `domain/habit.ts`, `domain/reward.ts` ni `domain/week.ts` (funciones puras existentes se siguen usando para el mapeo y el cálculo derivado).

## Decisions

### 1. Mapeo `WeekResponseDto → Habit[]` vive en `application/`, no en `infrastructure/` ni `domain/`
- **Alternativas:** (a) mapeo dentro de `weekApi.ts` (infraestructura devuelve ya `Habit[]`); (b) función pura en `domain/`; (c) helper en `application/` usado solo por el hook.
- **Elegido (c):** `weekApi.ts` devuelve el DTO crudo (`WeekResponseDto`), igual que `habitApi`/`habitEntryApi` devuelven DTOs. El mapeo a `Habit`/`HabitStats` depende de tipos de dominio (`CompletionStatus`, `computeStreakFromStatus`), por lo que no es infraestructura pura; y no es lógica de negocio agnóstica de la API (depende del shape `weekHabit`+`entries`), por lo que tampoco es `domain/` puro. Se añade `frontend/src/application/mapWeekResponseToDashboard.ts` con una función `mapWeekResponseToDashboard(dto: WeekResponseDto): { habits: Habit[]; stats: HabitStats; entryIdsByHabitId: Record<string, number[]> }` que reutiliza `computeStreakFromStatus` de `domain/habit.ts`.

### 2. IDs: `Habit.id` (dominio, `string`) = `String(weekHabit.habitId)`; se conserva un mapa auxiliar `entryIdsByHabitId`
- `domain/habit.ts` define `Habit.id: string` (no se modifica, ya que `domain/` es agnóstico de la API). Al mapear, `id = String(weekHabit.habitId)` para poder llamar `habitApi.deleteHabit(Number(habit.id))`.
- Los `id` de cada `entry` (necesarios para `PATCH /api/habit-entries/:id`) no forman parte de `Habit` (el dominio no los necesita para sus cálculos puros). Se guardan aparte, en estado del hook: `entryIdsByHabitId: Record<string, number[]>` (array de 7 posiciones, indexado por `dayIndex`), actualizado junto con `habits` en cada carga.

### 3. `isCurrentWeek`/`isWeekLocked` pasan a derivarse de la respuesta del backend
- Hoy `isCurrentWeek(weekOffset)`/`isWeekLocked(weekOffset)` de `domain/week.ts` son funciones puras basadas solo en `weekOffset` (asumen `offset===0` ⇔ semana actual no bloqueada). Tras este cambio, el hook usa `week.isLocked` del `WeekResponseDto` recibido como fuente de verdad para `isWeekLocked`, y `weekOffset===0` para `isCurrentWeek` (alineado con la semántica de `GET /api/weeks?offset=0` ≡ `/api/weeks/current`). Las funciones de `domain/week.ts` se mantienen (se siguen usando para `buildWeekData`/`getCurrentDayIndexForWeek`, que son cálculos de calendario independientes de la API).

### 4. Errores y feedback: `sonner` `toast.error(...)`
- `App.tsx` ya monta `<Toaster />` (sonner). Los handlers que necesitan feedback de error (`handleToggleDay`, `handleAddHabit`, `handleDeleteHabit`) usan `toast.error(message)` importado de `sonner`, con `message` derivado de `ApiError.message` (o un mensaje genérico para `NETWORK_ERROR`).

### 5. `handleWeekNav(offset)` reemplaza la navegación local de `weekOffset`
- Antes, cambiar `weekOffset` solo recalculaba `weekData`/`isCurrentWeek`/`isWeekLocked` localmente (sin red). Ahora `handleWeekNav(offset)` actualiza `weekOffset` y dispara `weekApi.fetchWeekByOffset(offset)`, sustituyendo `habits`/`stats`/`entryIdsByHabitId`/`week.isLocked` con la respuesta. `setWeekOffset` deja de exponerse directamente (se sustituye por `handleWeekNav`); `weekData`/`getCurrentDayIndexForWeek` siguen calculándose localmente a partir de `weekOffset` para el calendario.

## Risks / Trade-offs

- **[Riesgo] Recarga completa tras `handleAddHabit`** (`fetchCurrentWeek()` de nuevo) es menos eficiente que insertar el hábito creado directamente en `habits`, pero garantiza que `entryIdsByHabitId` y `weekHabit.order`/snapshots queden consistentes con el backend → Mitigación: aceptable para MVP (lista de hábitos pequeña); documentado como decisión explícita.
- **[Riesgo] Optimistic update de `handleToggleDay` necesita el `entryId` antes de la llamada API** → Mitigación: `entryIdsByHabitId` se puebla en cada carga de semana (`fetchCurrentWeek`/`fetchWeekByOffset`), por lo que está disponible siempre que `habits` lo está.
- **[Riesgo] Carrera entre `handleWeekNav` rápido (doble clic) y la respuesta `fetch` anterior** → Mitigación: seguir el patrón de `useUserProfile.ts` (`cancelled` flag en `useEffect`/llamadas async) para ignorar respuestas obsoletas.

## Migration Plan

No aplica (sin datos persistentes que migrar; cambio de implementación de un hook frontend). El contrato de retorno del hook se mantiene compatible con `presentation/` salvo la adición de `loading`/`error` y la sustitución de `setWeekOffset` por `handleWeekNav`; se debe verificar en `N+1`/`N+3` que `presentation/` no usa `setWeekOffset` directamente (en caso contrario, ajustar el componente llamador dentro del mismo ticket).

## Open Questions

- Ninguna bloqueante. Si `presentation/` (p. ej. `AppLayout`/`CalendarSection`) usa `setWeekOffset` directamente, se ajustará su llamada a `handleWeekNav` como parte de la implementación (sin cambiar el componente más allá de esa llamada).
