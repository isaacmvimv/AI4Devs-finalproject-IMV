## ADDED Requirements

### Requirement: Tests unitarios completos para toggleHabitDayCompletion

El sistema de tests DEBE cubrir el ciclo completo `pending → completed → failed → pending` y el toggle en día del pasado (dayIndex válido pero anterior al actual).

#### Scenario: Ciclo completo de toggle
- **WHEN** se invoca `toggleHabitDayCompletion` tres veces sobre el mismo día
- **THEN** el estado pasa de `pending` a `completed`, luego a `failed`, luego a `pending`

#### Scenario: Toggle en día pasado de la semana
- **WHEN** se invoca `toggleHabitDayCompletion` con un `dayIndex` anterior al día actual (p. ej. 0 si hoy es miércoles)
- **THEN** el estado del día se actualiza correctamente
- **AND** el streak se recalcula desde ese `dayIndex`

#### Scenario: dayIndex fuera de rango
- **WHEN** se invoca con `dayIndex` -1 o 7
- **THEN** retorna el hábito sin cambios

### Requirement: Tests unitarios completos para calculateHabitStats

El sistema de tests DEBE cubrir hábitos mixtos, array vacío y todos fallados.

#### Scenario: Hábitos mixtos (completados y fallados)
- **WHEN** se pasa un array con hábitos que tienen días completados y fallados
- **THEN** `thisWeekPoints` suma los puntos de días completados
- **AND** `penalties` suma las penalizaciones de días fallados
- **AND** `maxStreak` refleja la racha más larga

#### Scenario: Array vacío de hábitos
- **WHEN** se pasa un array vacío
- **THEN** todos los campos retornan 0

#### Scenario: Todos los días fallados
- **WHEN** todos los días de todos los hábitos tienen estado `failed`
- **THEN** `thisWeekPoints` es 0
- **AND** `penalties` es la suma total de penalizaciones

### Requirement: Tests unitarios completos para calculateTodayProgressPercent

El sistema de tests DEBE cubrir 0 hábitos, 1/3 completados y todos completados.

#### Scenario: Sin hábitos (array vacío)
- **WHEN** se pasa un array vacío
- **THEN** retorna 0

#### Scenario: Un tercio completado
- **WHEN** 1 de 3 hábitos está completado en el día actual
- **THEN** retorna 33.33

#### Scenario: Todos completados
- **WHEN** todos los hábitos están completados en el día actual
- **THEN** retorna 100

### Requirement: Tests unitarios completos para computeStreakFromStatus

El sistema de tests DEBE cubrir racha 0, racha 3, interrupción en medio y todos pending.

#### Scenario: Racha 0
- **WHEN** el día actual tiene estado `failed` o `pending`
- **THEN** retorna 0

#### Scenario: Racha 3
- **WHEN** los últimos 3 días consecutivos hasta `currentDayIndex` son `completed`
- **THEN** retorna 3

#### Scenario: Interrupción en medio
- **WHEN** hay un día `failed` entre dos series de `completed`
- **THEN** retorna solo la cuenta desde el último `completed` continuo

#### Scenario: Todos pending
- **WHEN** todos los estados son `pending`
- **THEN** retorna 0

### Requirement: Tests unitarios completos para totalPointsFromStats

El sistema de tests DEBE cubrir positivos, con penalizaciones mayores y resultado negativo.

#### Scenario: Resultado positivo
- **WHEN** `thisWeekPoints + lastWeekPoints > penalties`
- **THEN** retorna la diferencia positiva

#### Scenario: Penalizaciones mayores que puntos
- **WHEN** `penalties > thisWeekPoints + lastWeekPoints`
- **THEN** retorna un número negativo

#### Scenario: Resultado cero
- **WHEN** `thisWeekPoints + lastWeekPoints == penalties`
- **THEN** retorna 0

### Requirement: Tests unitarios completos para buildWeekData

El sistema de tests DEBE generar 7 días, verificar dayIndex correcto para hoy y manejar cruces de mes.

#### Scenario: Genera 7 días con labels correctos
- **WHEN** se invoca `buildWeekData(0, referenceDate)`
- **THEN** retorna exactamente 7 elementos con labels Lun-Dom

#### Scenario: dayIndex correcto para hoy
- **WHEN** se invoca con `weekOffset=0` y una fecha conocida
- **THEN** `getCurrentDayIndexForWeek(0, sameDate)` retorna el índice correcto (0=Lun, 6=Dom)

#### Scenario: Semana que cruza meses
- **WHEN** la semana abarca fin de un mes e inicio del siguiente
- **THEN** las fechas reflejan correctamente ambos meses
