## ADDED Requirements

### Requirement: ProgressBar muestra porcentaje real de completitud del día

El componente `ProgressBar` SHALL recibir el porcentaje de hábitos completados hoy (`todayProgress` del hook `useHabitDashboard`) y renderizarlo como barra visual con etiqueta de porcentaje.

#### Scenario: Porcentaje acorde a hábitos completados
- **WHEN** hay 3 hábitos y 2 están completados hoy
- **THEN** ProgressBar MUST mostrar 67%

#### Scenario: 0 hábitos no produce NaN
- **WHEN** no hay hábitos activos (lista vacía)
- **THEN** ProgressBar MUST mostrar 0%
- **AND** no se produce `NaN` ni error de renderizado

### Requirement: ProgressBar se actualiza en tiempo real con cada toggle

El porcentaje del `ProgressBar` MUST actualizarse inmediatamente tras cada toggle de celda del día actual, reflejando el optimistic update.

#### Scenario: Toggle incrementa el porcentaje
- **WHEN** el usuario marca completado un hábito del día actual
- **THEN** el porcentaje del ProgressBar se incrementa inmediatamente
- **AND** la barra visual se anima con transición CSS
