# Spec — frontend-week-domain

**Ticket:** T-13-02 · **User Story:** US-13

Generación de datos de semana (lunes–domingo) y índice del día actual para el calendario semanal del dashboard.

## Requirements

### Requirement: Tipos exportables de semana

El módulo `frontend/src/domain/week.ts` SHALL exportar `WeekDayLabel` (`day`, `date`) y `WeekData` (`dates`, `range`) sin dependencias externas.

#### Scenario: Importación desde useHabitDashboard

- **WHEN** `frontend/src/application/useHabitDashboard.ts` importa desde `../domain/week`
- **THEN** la compilación TypeScript completa sin errores

### Requirement: Construcción de datos de semana

La función `buildWeekData(weekOffset: number, now?: Date)` SHALL devolver un `WeekData` con exactamente 7 entradas en `dates`, ordenadas de lunes a domingo. Cada `WeekDayLabel.day` SHALL usar abreviaturas en español: `Lun`, `Mar`, `Mié`, `Jue`, `Vie`, `Sáb`, `Dom`. El campo `date` SHALL ser el día del mes (1–31) correspondiente a esa fecha. El campo `range` SHALL describir el intervalo visible (p. ej. `10 – 16 De Junio`).

#### Scenario: Semana actual con offset 0

- **WHEN** `now` es un miércoles 11 de junio de 2026
- **AND** se invoca `buildWeekData(0, now)`
- **THEN** `dates` tiene longitud 7
- **AND** `dates[0].day = 'Lun'` y `dates[0].date = 9`
- **AND** `dates[2].day = 'Mié'` y `dates[2].date = 11`
- **AND** `dates[6].day = 'Dom'` y `dates[6].date = 15`
- **AND** `range` contiene el mes `Junio`

#### Scenario: Semana anterior con offset -1

- **WHEN** `now` es un miércoles 11 de junio de 2026
- **AND** se invoca `buildWeekData(-1, now)`
- **THEN** `dates[0].date = 2` (lunes de la semana anterior)
- **AND** `dates[6].date = 8` (domingo de la semana anterior)

#### Scenario: Semana que cruza meses

- **WHEN** `now` es un martes 1 de julio de 2026
- **AND** se invoca `buildWeekData(0, now)`
- **THEN** `dates[0].date = 30` (lunes en junio)
- **AND** `dates[6].date = 6` (domingo en julio)

### Requirement: Índice del día actual en la semana visible

La función `getCurrentDayIndexForWeek(weekOffset: number, now?: Date)` SHALL devolver el índice 0–6 (lunes=0, domingo=6) cuando `weekOffset === 0`, calculado desde `now`. Cuando `weekOffset !== 0`, SHALL devolver `-1` (la semana visible no es la actual).

#### Scenario: Miércoles en semana actual

- **WHEN** `now` representa un miércoles
- **AND** se invoca `getCurrentDayIndexForWeek(0, now)`
- **THEN** el resultado es `2`

#### Scenario: Domingo en semana actual

- **WHEN** `now` representa un domingo
- **AND** se invoca `getCurrentDayIndexForWeek(0, now)`
- **THEN** el resultado es `6`

#### Scenario: Semana no actual

- **WHEN** se invoca `getCurrentDayIndexForWeek(weekOffset)` con `weekOffset !== 0` (p. ej. `-1` o `1`)
- **THEN** el resultado es `-1`
