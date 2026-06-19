# Proposal — T-22-02 · Añadir índices PostgreSQL para queries de producción

**Ticket:** T-22-02 · **User Story:** US-22 — Rendimiento · **Sprint:** 5

## Why

Las queries más frecuentes del MVP (`getCurrentWeek`, carga de hábitos semanales, estados diarios, cálculo de saldo de recompensas) deben ejecutarse sin Sequential Scans en tablas principales para cumplir el requisito de respuesta < 200 ms (p95) del AC Scenario 3 de US-22. Es necesario verificar que los índices del schema Prisma cubren todos los patrones de acceso de producción y, si falta alguno, añadirlo mediante migración.

## What Changes

- **Auditoría de índices existentes:** revisar `backend/prisma/schema.prisma` contra los patrones de acceso reales de la API (`GET /api/weeks/current`, carga de `WeekHabit`, `HabitEntry`, `RewardRedemption`).
- **Añadir índices faltantes** (si los hay) vía migración Prisma `add_performance_indexes`.
- **Verificación con `EXPLAIN ANALYZE`** en las queries principales para confirmar uso de índices (sin Seq Scans en tablas principales).

**Estado actual del schema:** los cuatro índices del DoD ya existen en `schema.prisma`:
- `Week: @@index([userId, startDate])` ✅
- `WeekHabit: @@index([weekId])` + `@@unique([weekId, habitId])` ✅
- `HabitEntry: @@index([weekHabitId])` ✅
- `RewardRedemption: @@index([weekId])` ✅

El alcance se centra en verificar que estos índices están materializados en la BD y que `EXPLAIN ANALYZE` lo confirma; si alguno falta o se necesita uno adicional, se crea la migración.

## Non-goals

- Optimización del bundle frontend (T-22-01).
- Optimización de Lighthouse / FCP / TTI (T-22-03).
- Cambios en la lógica de negocio o estructura de endpoints.
- Añadir tests unitarios (excluido explícitamente en el ticket).

## Capabilities

### New Capabilities

- `performance-indexes`: Verificación y materialización de índices PostgreSQL para queries de producción del MVP.

### Modified Capabilities

_(Sin cambios de requisitos en capabilities existentes — solo infraestructura de BD.)_

## Impact

- **Schema Prisma:** posible migración `add_performance_indexes` si se detectan índices faltantes.
- **Base de datos PostgreSQL:** nuevos índices (si aplica); mejora de planes de ejecución.
- **API:** sin cambios de contrato; mejora de rendimiento en queries existentes.
- **Criterios de aceptación:** AC Scenario 3 de US-22 (Gherkin) — respuesta < 200 ms, sin Seq Scans.
