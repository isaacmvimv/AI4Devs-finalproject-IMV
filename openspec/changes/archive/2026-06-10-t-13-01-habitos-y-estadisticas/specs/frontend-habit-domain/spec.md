# frontend-habit-domain

## ADDED Requirements

### Requirement: Tipos exportables del dominio de hábitos

El módulo `frontend/src/domain/habit.ts` SHALL exportar los tipos `CompletionStatus` (`'completed' | 'failed' | 'pending'`), `Habit`, `HabitStats` y `HabitFormInput` sin dependencias externas (solo TypeScript nativo).

#### Scenario: Importación desde capa application

- **WHEN** un módulo de `frontend/src/application/` importa tipos y funciones desde `../domain/habit`
- **THEN** la compilación TypeScript completa sin errores
- **AND** no se requiere React, fetch ni librerías de terceros

### Requirement: Toggle cíclico del estado diario

La función `toggleHabitDayCompletion(habit, dayIndex)` SHALL devolver un nuevo `Habit` inmutable con el estado del día alternando en ciclo: `pending` → `completed` → `failed` → `pending`. SHALL recalcular `streak` del hábito usando la lógica de racha definida en este spec.

#### Scenario: Ciclo completo en tres toggles (US-13 S1)

- **WHEN** un `Habit` tiene `completionStatus[2] = 'pending'`
- **AND** se invoca `toggleHabitDayCompletion(habit, 2)` tres veces consecutivas
- **THEN** tras el 1.er toggle `completionStatus[2] = 'completed'`
- **AND** tras el 2.º toggle `completionStatus[2] = 'failed'`
- **AND** tras el 3.er toggle `completionStatus[2] = 'pending'`

#### Scenario: dayIndex fuera de rango 0–6

- **WHEN** se invoca `toggleHabitDayCompletion(habit, dayIndex)` con `dayIndex < 0` o `dayIndex > 6`
- **THEN** devuelve el `Habit` sin modificaciones (misma referencia de datos inmutables equivalente)
- **AND** no lanza excepción

### Requirement: Cálculo de estadísticas semanales

La función `calculateHabitStats(habits)` SHALL agregar puntos y penalizaciones de todos los hábitos según `completionStatus` y los valores `pointsPerDay` / `penalty` de cada hábito. SHALL calcular `maxStreak` como el máximo `streak` entre los hábitos del array.

#### Scenario: Puntos y penalizaciones con un hábito (US-13 S2)

- **WHEN** un `Habit` tiene `pointsPerDay=10`, `penalty=5`
- **AND** `completionStatus = ['completed','completed','failed','pending','pending','pending','pending']`
- **AND** se invoca `calculateHabitStats([habit])`
- **THEN** `thisWeekPoints = 20`
- **AND** `penalties = 5`

#### Scenario: Sin hábitos (US-13 S5)

- **WHEN** se invoca `calculateHabitStats([])`
- **THEN** `thisWeekPoints = 0`, `penalties = 0`, `maxStreak = 0`
- **AND** no se lanza excepción

### Requirement: Progreso porcentual del día actual

La función `calculateTodayProgressPercent(habits, dayIndex)` SHALL devolver el porcentaje de hábitos con `completionStatus[dayIndex] = 'completed'` respecto al total de hábitos, como número decimal (no entero redondeado).

#### Scenario: Dos de tres hábitos completados (US-13 S3)

- **WHEN** existen 3 hábitos y 2 tienen `completionStatus[2] = 'completed'` y 1 `'pending'`
- **AND** se invoca `calculateTodayProgressPercent(habits, 2)`
- **THEN** el resultado es `66.67` (2/3 × 100, con precisión de dos decimales)

#### Scenario: Sin hábitos

- **WHEN** `habits` es un array vacío
- **AND** se invoca `calculateTodayProgressPercent(habits, dayIndex)` con cualquier `dayIndex` válido
- **THEN** el resultado es `0`

### Requirement: Cálculo de racha desde el día actual

La función `computeStreakFromStatus(statuses, currentDayIndex)` SHALL contar días consecutivos `completed` hacia atrás desde `currentDayIndex` (inclusive). SHALL detener el conteo al encontrar `failed` o `pending`. SHALL devolver `0` si todos los días evaluados son `pending` o si `currentDayIndex` es inválido.

#### Scenario: Racha reinicia tras día fallido (US-13 S4)

- **WHEN** `statuses = ['completed','completed','completed','failed','completed','pending','pending']`
- **AND** se invoca `computeStreakFromStatus(statuses, 4)`
- **THEN** el resultado es `1`

#### Scenario: Todos pending

- **WHEN** `statuses` contiene solo `'pending'`
- **AND** se invoca `computeStreakFromStatus(statuses, currentDayIndex)` con índice válido
- **THEN** el resultado es `0`

### Requirement: Creación de hábito desde formulario

La función `createHabitFromFormInput(input, id)` SHALL construir un `Habit` con `completionStatus` de 7 elementos `'pending'`, `streak = 0` y los campos de `HabitFormInput` (`emoji`, `name`, `pointsPerDay`, `penalty`).

#### Scenario: Hábito nuevo con semana vacía

- **WHEN** se invoca `createHabitFromFormInput({ emoji:'🏃', name:'Correr', pointsPerDay:10, penalty:5 }, '42')`
- **THEN** devuelve un `Habit` con `id='42'`, los campos del input y `completionStatus` de 7× `'pending'`
- **AND** `streak = 0`

### Requirement: Puntos totales desde estadísticas

La función `totalPointsFromStats(stats)` SHALL devolver `stats.thisWeekPoints + stats.lastWeekPoints - stats.penalties`.

#### Scenario: Total neto con penalizaciones

- **WHEN** `stats = { thisWeekPoints: 20, lastWeekPoints: 0, penalties: 5, maxStreak: 3 }`
- **AND** se invoca `totalPointsFromStats(stats)`
- **THEN** el resultado es `15`

### Requirement: Funciones puras sin efectos secundarios

Todas las funciones exportadas del módulo SHALL ser puras: sin mutación de argumentos, sin I/O, sin llamadas HTTP y sin acceso a estado global.

#### Scenario: Inmutabilidad en toggle

- **WHEN** se invoca `toggleHabitDayCompletion(habit, dayIndex)`
- **THEN** el objeto `habit` original no es mutado
- **AND** `habit.completionStatus` conserva sus valores previos
