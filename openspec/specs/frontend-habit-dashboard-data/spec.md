# frontend-habit-dashboard-data Specification

## Purpose
TBD - created by archiving change t-16-02-hook-usehabitdashboard-con-carga. Update Purpose after archive.
## Requirements
### Requirement: Carga de la semana activa al montar
`useHabitDashboard` SHALL llamar a `weekApi.fetchCurrentWeek()` al montar, mapear el `WeekResponseDto` recibido a `Habit[]` (dominio) y `HabitStats`, y exponer `loading`/`error` durante la carga.

#### Scenario: Carga inicial correcta
- **WHEN** el componente que usa `useHabitDashboard` se monta y `weekApi.fetchCurrentWeek()` resuelve con un `WeekResponse` con 3 hábitos
- **THEN** el hook expone `habits` con esos 3 hábitos (incluyendo `completionStatus` derivado de `entries` y `streak` calculado), `stats` desde `WeekStats`, `loading=false` y `error=null`

#### Scenario: Error al cargar la semana activa
- **WHEN** `weekApi.fetchCurrentWeek()` propaga un `ApiError`
- **THEN** el hook expone `error` con el mensaje del error, `loading=false` y `habits=[]`

### Requirement: Toggle de día con optimistic update y rollback
`handleToggleDay(habitId, dayIndex)` SHALL aplicar primero un cambio optimista al estado local de `habits` (vía `toggleHabitDayCompletion`) y luego llamar a `habitEntryApi.updateHabitEntry(entryId, status)` con el `status` resultante y el `id` de la `entry` correspondiente; si la llamada falla, SHALL revertir `habits` al estado previo y mostrar un toast de error. Si `isWeekLocked` es `true`, `handleToggleDay` SHALL no hacer nada (ni optimistic update ni llamada a la API).

#### Scenario: Toggle correcto (US-16 Scenario 2)
- **WHEN** el usuario hace clic en una celda en estado `pending` de un hábito en la semana activa (no bloqueada)
- **THEN** el estado local de esa celda cambia a `completed` inmediatamente
- **AND** se llama a `habitEntryApi.updateHabitEntry(entryId, 'completed')` con el `id` de la entrada correspondiente al día

#### Scenario: Rollback ante error de red (US-16 Scenario 3)
- **WHEN** `habitEntryApi.updateHabitEntry` propaga un `ApiError` (p. ej. red caída o `WEEK_LOCKED`)
- **THEN** la celda revierte a su estado anterior
- **AND** se muestra un toast de error no intrusivo

#### Scenario: Semana bloqueada — sin edición (US-16 Scenario 5)
- **WHEN** `isWeekLocked` es `true` y el usuario hace clic en una celda
- **THEN** `handleToggleDay` no modifica `habits` ni llama a `habitEntryApi.updateHabitEntry`

### Requirement: Crear hábito y recargar semana (US-16 Scenario 1)
`handleAddHabit(input)` SHALL llamar a `habitApi.createHabit(input)`; cuando la creación es correcta, SHALL recargar la semana activa (`weekApi.fetchCurrentWeek()`) para reflejar el nuevo hábito con sus 7 entradas en estado `pending`.

#### Scenario: Creación correcta de hábito
- **WHEN** el usuario confirma el formulario con `{emoji:"🧘", name:"Meditar", pointsPerDay:10, penalty:5}`
- **THEN** se llama a `habitApi.createHabit` con esos datos
- **AND** tras la respuesta correcta, `habits` incluye el nuevo hábito con 7 celdas en estado `pending`

#### Scenario: Error de validación al crear hábito (US-16 Scenario 6)
- **WHEN** `habitApi.createHabit` propaga un `ApiError` con `code="VALIDATION_ERROR"`
- **THEN** `habits` no cambia
- **AND** se muestra un toast de error con el mensaje de validación

### Requirement: Eliminar hábito con optimistic delete y rollback (US-16 Scenario 4)
`handleDeleteHabit(habitId)` SHALL eliminar el hábito del estado local de `habits` de forma optimista y luego llamar a `habitApi.deleteHabit(id)`; si la llamada falla, SHALL restaurar el hábito eliminado en `habits` y mostrar un toast de error.

#### Scenario: Eliminación correcta
- **WHEN** el usuario confirma eliminar el hábito "Yoga"
- **THEN** el hábito desaparece de `habits` inmediatamente
- **AND** se llama a `habitApi.deleteHabit` con el `id` numérico del hábito

#### Scenario: Rollback ante error al eliminar
- **WHEN** `habitApi.deleteHabit` propaga un `ApiError`
- **THEN** el hábito eliminado se restaura en `habits` en su posición original
- **AND** se muestra un toast de error

### Requirement: Navegación entre semanas
`handleWeekNav(offset)` SHALL actualizar `weekOffset` y cargar la semana correspondiente vía `weekApi.fetchWeekByOffset(offset)`, actualizando `habits`, `stats`, `isCurrentWeek` e `isWeekLocked` con la respuesta.

#### Scenario: Navegar a una semana anterior bloqueada (US-16 Scenario 5)
- **WHEN** el usuario navega a `weekOffset=-1`
- **THEN** se llama a `weekApi.fetchWeekByOffset(-1)`
- **AND** el hook expone `isWeekLocked=true` y `isCurrentWeek=false` según `week.isLocked` de la respuesta
- **AND** los componentes que usan estos flags no muestran el botón "× eliminar" ni responden al clic en las celdas (consecuencia de `isWeekLocked`)

#### Scenario: Volver a la semana actual
- **WHEN** el usuario navega de vuelta a `weekOffset=0`
- **THEN** se llama a `weekApi.fetchWeekByOffset(0)` (equivalente a `fetchCurrentWeek`)
- **AND** el hook expone `isCurrentWeek=true` e `isWeekLocked=false`

