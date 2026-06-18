## ADDED Requirements

### Requirement: StatCard muestra 4 contadores con datos reales de API

El sistema SHALL renderizar 4 componentes `StatCard` conectados a los valores reales del hook `useHabitDashboard`: `thisWeekPoints`, `lastWeekPoints`, `penalties` y `maxStreak`. Cada StatCard MUST mostrar icono, valor numérico y etiqueta descriptiva.

#### Scenario: Estadísticas correctas con datos de API
- **WHEN** la semana tiene hábitos con días completados y fallados
- **THEN** "Esta semana" = `stats.thisWeekPoints`
- **AND** "Semana anterior" = `stats.lastWeekPoints` (de la última semana bloqueada)
- **AND** "Penalizaciones" = `-stats.penalties`
- **AND** "Mejor racha" = `stats.maxStreak`

#### Scenario: lastWeekPoints es 0 sin semana anterior
- **WHEN** no existe semana anterior bloqueada
- **THEN** el StatCard "Semana anterior" MUST mostrar el valor `0`
- **AND** no se produce ningún error ni excepción

### Requirement: StatCards se actualizan en menos de 100ms tras interacción

Los StatCards MUST reflejar los valores actualizados en menos de 100ms tras cada toggle de celda, aprovechando el optimistic update del hook `useHabitDashboard`.

#### Scenario: Actualización optimista tras toggle
- **WHEN** el usuario marca completado un hábito de 10 pts y tenía 20 pts esta semana
- **THEN** el StatCard "Esta semana" pasa a 30 en menos de 100ms
- **AND** el StatCard "Penalizaciones" se recalcula al mismo tiempo
