# Spec — performance-indexes

## ADDED Requirements

### Requirement: Índice compuesto Week(userId, startDate) para getCurrentWeek

El sistema DEBE tener un índice en la tabla `Week` sobre las columnas `(userId, startDate)` para que la query de `getCurrentWeek` utilice Index Scan en lugar de Sequential Scan.

#### Scenario: Query getCurrentWeek usa índice

- **WHEN** se ejecuta `EXPLAIN ANALYZE` en la query equivalente a `Week.findFirst({ where: { userId: 1, startDate: <lunes>, endDate: <domingo> } })`
- **THEN** el plan de ejecución muestra Index Scan o Index Only Scan en la tabla `Week`
- **AND** no aparece Sequential Scan en la tabla `Week`

### Requirement: Índice WeekHabit(weekId) para carga de hábitos semanales

El sistema DEBE tener un índice en la tabla `WeekHabit` sobre la columna `weekId` para que la carga de hábitos de una semana utilice Index Scan.

#### Scenario: Carga de WeekHabits por weekId usa índice

- **WHEN** se ejecuta `EXPLAIN ANALYZE` en `SELECT * FROM "WeekHabit" WHERE "weekId" = <id>`
- **THEN** el plan de ejecución muestra Index Scan o Bitmap Index Scan en la tabla `WeekHabit`
- **AND** no aparece Sequential Scan en la tabla `WeekHabit`

### Requirement: Índice HabitEntry(weekHabitId) para carga de estados diarios

El sistema DEBE tener un índice en la tabla `HabitEntry` sobre la columna `weekHabitId` para que la carga de entradas de un hábito semanal utilice Index Scan.

#### Scenario: Carga de HabitEntries por weekHabitId usa índice

- **WHEN** se ejecuta `EXPLAIN ANALYZE` en `SELECT * FROM "HabitEntry" WHERE "weekHabitId" = <id>`
- **THEN** el plan de ejecución muestra Index Scan o Bitmap Index Scan en la tabla `HabitEntry`
- **AND** no aparece Sequential Scan en la tabla `HabitEntry`

### Requirement: Índice RewardRedemption(weekId) para cálculo de saldo

El sistema DEBE tener un índice en la tabla `RewardRedemption` sobre la columna `weekId` para que el cálculo de puntos gastados en la semana utilice Index Scan.

#### Scenario: Carga de RewardRedemptions por weekId usa índice

- **WHEN** se ejecuta `EXPLAIN ANALYZE` en `SELECT * FROM "RewardRedemption" WHERE "weekId" = <id>`
- **THEN** el plan de ejecución muestra Index Scan o Bitmap Index Scan en la tabla `RewardRedemption`
- **AND** no aparece Sequential Scan en la tabla `RewardRedemption`

### Requirement: Migración add_performance_indexes aplicada (si necesaria)

Si algún índice del DoD no está materializado en PostgreSQL, el sistema DEBE incluir una migración Prisma `add_performance_indexes` que lo cree.

#### Scenario: Todos los índices existen en PostgreSQL

- **WHEN** se consulta `pg_indexes` para las tablas `Week`, `WeekHabit`, `HabitEntry` y `RewardRedemption`
- **THEN** existen índices que cubren las columnas especificadas en cada requirement anterior

#### Scenario: Índice faltante se añade por migración

- **WHEN** se detecta que un índice requerido no existe en `pg_indexes`
- **THEN** se ejecuta `npx prisma migrate dev --name add_performance_indexes`
- **AND** la migración se aplica sin errores
- **AND** el índice aparece en `pg_indexes` tras la migración
