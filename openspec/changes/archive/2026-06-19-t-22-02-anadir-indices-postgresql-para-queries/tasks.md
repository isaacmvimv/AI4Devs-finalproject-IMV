# Tasks — T-22-02 · Añadir índices PostgreSQL para queries de producción

**Ticket:** T-22-02 · **User Story:** US-22 · **Change:** `t-22-02-anadir-indices-postgresql-para-queries` · **Rama:** `feature/T-22-02-anadir-indices-postgresql-para-queries`
**Pasos aplicables:** unit=N/A · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe (local/remoto)
- [x] 0.3 `git checkout -b feature/T-22-02-anadir-indices-postgresql-para-queries`
- [x] 0.4 `git branch --show-current`

## 1. Verificar índices existentes en PostgreSQL

- [x] 1.1 Arrancar PostgreSQL con `docker compose up -d`
- [x] 1.2 Aplicar migraciones actuales: `npm run db:migrate` (o `npx prisma migrate deploy`)
- [x] 1.3 Consultar `pg_indexes` para las tablas `Week`, `WeekHabit`, `HabitEntry` y `RewardRedemption`; listar índices existentes
- [x] 1.4 Comparar índices encontrados con los cuatro del DoD: `Week(userId, startDate)`, `WeekHabit(weekId)`, `HabitEntry(weekHabitId)`, `RewardRedemption(weekId)`

## 2. Crear migración (solo si faltan índices)

- [x] 2.1 Si todos los índices existen → documentar resultado y saltar a paso 3 *(los 4 índices ya existen; no se requiere migración)*
- [x] 2.2 Si falta alguno → añadir `@@index` en `schema.prisma` *(N/A — todos presentes)*
- [x] 2.3 Verificar que la migración se aplica sin errores *(N/A — sin migración necesaria)*

## 3. Validación con EXPLAIN ANALYZE

- [x] 3.1 Ejecutar seed para tener datos: `npm run db:seed`
- [x] 3.2 `EXPLAIN ANALYZE` en query equivalente a `getCurrentWeek`: `SELECT * FROM "Week" WHERE "userId" = 1 AND "startDate" <= NOW() AND "endDate" >= NOW()`
- [x] 3.3 `EXPLAIN ANALYZE` en `SELECT * FROM "WeekHabit" WHERE "weekId" = <id>`
- [x] 3.4 `EXPLAIN ANALYZE` en `SELECT * FROM "HabitEntry" WHERE "weekHabitId" = <id>`
- [x] 3.5 `EXPLAIN ANALYZE` en `SELECT * FROM "RewardRedemption" WHERE "weekId" = <id>`
- [x] 3.6 Confirmar que ningún plan muestra Sequential Scan en tablas principales (si lo muestra por pocas filas, verificar con `SET enable_seqscan = off`)

## 4. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 4.1 Ejecutar `npm run dev:api` y confirmar que el servidor arranca sin errores
- [x] 4.2 Documentar resultados de `EXPLAIN ANALYZE` y estado de índices; informe en `openspec/changes/t-22-02-anadir-indices-postgresql-para-queries/reports/2026-06-19-step-04-verification.md`

## 5. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 5.1 Actualizar `docs/data-model.md` — añadida sección "Índices de rendimiento" con los 5 índices existentes

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
