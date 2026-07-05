# Capa application

Hooks y orquestación de casos de uso que combinan dominio e infraestructura.

- **Dashboard:** `useHabitDashboard.ts` — estado del panel de hábitos y recompensas. Al montar, carga la semana activa con `weekApi.fetchCurrentWeek()` y la mapea a `habits`/`stats`/`entryIdsByHabitId`/`isWeekLocked` mediante `mapWeekResponseToDashboard.ts`; expone `loading`/`error` para el estado de carga inicial. `handleWeekNav(offset)` navega a otra semana vía `weekApi.fetchWeekByOffset(offset)` y remapea el estado (descarta respuestas obsoletas con un contador de petición). `handleToggleDay`/`handleAddHabit`/`handleDeleteHabit` aplican actualizaciones optimistas contra `habitEntryApi`/`habitApi`, revirtiendo el estado y mostrando un `toast.error` (sonner) si la API falla.
- **Mapeo:** `mapWeekResponseToDashboard.ts` — convierte un `WeekResponseDto` (infrastructure) en `{ habits, stats, entryIdsByHabitId, isLocked }` del dominio, calculando `streak` con `computeStreakFromStatus` a partir del `currentDayIndex` de la semana.
- **Perfil:** `useUserProfile.ts` — carga del usuario vía `profileApi`

Los hooks consumen tipos de `domain/` y adaptadores de `infrastructure/`; no contienen JSX.
