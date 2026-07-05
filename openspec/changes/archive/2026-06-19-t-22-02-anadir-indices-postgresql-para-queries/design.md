# Design — T-22-02 · Añadir índices PostgreSQL para queries de producción

## Context

El schema Prisma (`backend/prisma/schema.prisma`) ya define los cuatro índices que el DoD del ticket requiere:

| Índice | Declaración Prisma | Materializado |
|--------|-------------------|---------------|
| `Week(userId, startDate)` | `@@index([userId, startDate])` | Sí (migración `20260530120258_init`) |
| `WeekHabit(weekId)` | `@@index([weekId])` + `@@unique([weekId, habitId])` | Sí |
| `HabitEntry(weekHabitId)` | `@@index([weekHabitId])` | Sí |
| `RewardRedemption(weekId)` | `@@index([weekId])` | Sí |

La query principal de producción es `GET /api/weeks/current`, que ejecuta:
1. `Week.findFirst({ where: { userId, startDate, endDate } })` → usa índice `(userId, startDate)`.
2. Include de `weekHabits` → usa índice `WeekHabit(weekId)`.
3. Include de `habitEntries` por cada `WeekHabit` → usa índice `HabitEntry(weekHabitId)`.
4. `RewardRedemption.findMany({ where: { weekId } })` → usa índice `RewardRedemption(weekId)`.

## Goals / Non-Goals

**Goals:**
- Verificar que los índices definidos en Prisma están materializados en PostgreSQL.
- Ejecutar `EXPLAIN ANALYZE` en las queries de `GET /api/weeks/current` y confirmar ausencia de Sequential Scans en tablas principales.
- Si se detecta algún índice faltante, crear migración `add_performance_indexes`.

**Non-Goals:**
- Optimización de bundle frontend (T-22-01).
- Cambios en lógica de negocio o estructura de la API.
- Tests unitarios (excluidos en el ticket).

## Decisions

### 1. Verificación antes de migración

**Decisión:** inspeccionar la BD con `\di` o consulta a `pg_indexes` antes de crear migración.

**Razón:** los cuatro índices ya están en el schema Prisma y fueron aplicados con la migración inicial. Es probable que no se necesite migración nueva. Solo se crea `add_performance_indexes` si falta alguno.

**Alternativa descartada:** crear migración vacía "por si acaso" — añade ruido al historial de migraciones sin beneficio.

### 2. Validación con EXPLAIN ANALYZE

**Decisión:** ejecutar `EXPLAIN ANALYZE` directamente contra PostgreSQL con las queries que Prisma genera para `getCurrentWeek`, simulando carga realista (datos del seed: usuario demo con hábitos y semana activa).

**Razón:** el AC Scenario 3 de US-22 exige que el query plan no contenga Sequential Scans en tablas principales. `EXPLAIN ANALYZE` es la herramienta estándar para verificar esto.

### 3. Sin cambios en el código de aplicación

**Decisión:** este ticket no modifica código TypeScript. Solo toca schema Prisma (si se necesita migración) y documentación.

## Risks / Trade-offs

- **[Datos insuficientes para EXPLAIN ANALYZE]** → El seed puede tener pocas filas y PostgreSQL podría preferir Seq Scan por ser más eficiente en tablas pequeñas. **Mitigación:** verificar con `SET enable_seqscan = off` para forzar uso de índices y confirmar que existen; documentar que con carga MVP (50 semanas, 10 hábitos) los índices se utilizarán.
- **[Migración innecesaria]** → Si todos los índices ya están materializados, no se necesita migración. **Mitigación:** el flujo verifica primero; solo crea migración si falta algo.
