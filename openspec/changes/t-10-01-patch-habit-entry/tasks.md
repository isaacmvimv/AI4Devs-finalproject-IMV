# Tasks — T-10-01 · Endpoint PATCH /api/habit-entries/:id

**Ticket:** T-10-01 · **User Story:** US-10 · **Change:** `t-10-01-patch-habit-entry` · **Rama:** `feature/T-10-01-patch-habit-entry`

**Pasos aplicables:** unit=sí · curl=sí · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-10-01-patch-habit-entry"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-10-01-patch-habit-entry"`
- [x] 0.4 `git checkout -b feature/T-10-01-patch-habit-entry`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-10-01-patch-habit-entry`

## 1. Preparar entorno

- [x] 1.1 Revisar baseline: `HabitEntry` en Prisma/schema ✅, creación en `createWeekHabitsWithEntriesInTx` (T-09-01 ✅), `GET /api/weeks/current` (T-09-03 ✅), `ConflictError`/`ValidationError`/`NotFoundError` (T-04-02 ✅), `validateBody` (T-19-01 ✅)
- [x] 1.2 Confirmar seed con semana activa (`isLocked=false`) y entries `pending` para usuario `id=1` en `backend/prisma/seed.ts`
- [x] 1.3 Revisar `docs/api-spec.yml` — `/api/habit-entries/{id}` aún no documentado (objetivo de §10)

## 2. Puerto e infraestructura HabitEntry (DoD: cadena Entry → WeekHabit → Week)

- [x] 2.1 Crear `backend/src/application/ports/HabitEntryRepository.ts` con `findByIdWithWeek` y `updateStatus`
- [x] 2.2 Crear `backend/src/infrastructure/prismaHabitEntryRepository.ts` con query `include: { weekHabit: { include: { week: true } } }`
- [x] 2.3 Reutilizar o exportar `mapToHabitEntry` desde infraestructura existente para evitar duplicación

## 3. Validación Zod (DoD: 400 si status inválido — US-10 S4)

- [x] 3.1 Crear `backend/src/application/validation/habitEntry.ts` con `updateHabitEntrySchema` (`status`: enum `pending|completed|failed`)
- [x] 3.2 Mensaje de error en español: `"Debe ser pending, completed o failed"` en campo `status`
- [x] 3.3 Tests unitarios de validación: `completed` OK, `"done"` → error, body `{}` → error

## 4. Caso de uso updateHabitEntry (DoD: ownership + semana no bloqueada)

- [x] 4.1 Crear `backend/src/application/updateHabitEntry.ts`
- [x] 4.2 Si entry no existe o `week.userId !== userId` → `NotFoundError('Entrada de hábito no encontrada', 'HABIT_ENTRY_NOT_FOUND')`
- [x] 4.3 Si `week.isLocked` → `ConflictError('No se puede modificar una semana bloqueada', 'WEEK_LOCKED')`
- [x] 4.4 Si OK → `repo.updateStatus(entryId, status)` y retornar `HabitEntry` actualizada
- [x] 4.5 Tests `updateHabitEntry.test.ts`: happy path (US-10 S1), 409 locked (S2), completed→failed (S3), 404 inexistente, 404 ajeno (S5)

## 5. Ruta HTTP PATCH (DoD: 200 `{ id, status, updatedAt }`)

- [x] 5.1 En `createApp.ts`, instanciar `habitEntryRepository` con `createPrismaHabitEntryRepository(prisma)`
- [x] 5.2 Añadir `parseHabitEntryIdParam` (id no numérico → `HABIT_ENTRY_NOT_FOUND`)
- [x] 5.3 Registrar `PATCH /api/habit-entries/:id` con `validateBody(updateHabitEntrySchema)` + `asyncHandler`
- [x] 5.4 Respuesta `200` con `{ id, status, updatedAt: entry.updatedAt.toISOString() }`

## 6. Tests HTTP supertest (DoD: happy path + edge US-10 esc. 1–5)

- [x] 6.1 Ampliar `createApp.test.ts` con `vi.mock` de `updateHabitEntry`
- [x] 6.2 PATCH happy path: mock devuelve entry → `PATCH /api/habit-entries/42` body `{ status: "completed" }` → `200`
- [x] 6.3 PATCH 400: body `{ status: "done" }` → `400` `VALIDATION_ERROR` con `details` en `status` (sin invocar use case)
- [x] 6.4 PATCH 404: mock lanza `NotFoundError` → `404` `HABIT_ENTRY_NOT_FOUND`
- [x] 6.5 PATCH 409: mock lanza `ConflictError` `WEEK_LOCKED` → `409`
- [x] 6.6 PATCH id inválido (`abc`) → `404` sin invocar use case

## 7. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 7.1 `npm test -- backend/src/application/updateHabitEntry.test.ts`
- [x] 7.2 `npm test -- backend/src/presentation/http/createApp.test.ts`
- [x] 7.3 Confirmar tests T-09 sin regresión (`getCurrentWeek.test.ts`, `lockWeekAndTransition.test.ts`)
- [x] 7.4 Informe: `openspec/changes/t-10-01-patch-habit-entry/reports/YYYY-MM-DD-step-07-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 8. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 8.1 `npm test` — suite backend relevante PASS
- [x] 8.2 `npm run dev:api` — confirmar arranque sin errores TypeScript
- [x] 8.3 Informe: `openspec/changes/t-10-01-patch-habit-entry/reports/YYYY-MM-DD-step-08-verification.md`

## 9. curl → tasks-core §N+2 + templates/endpoint-testing.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 9.1 `npm run db:up` — PostgreSQL activo
- [x] 9.2 `npm run dev:api` — servidor en `http://localhost:3001`
- [x] 9.3 Obtener `entryId` desde `curl -s http://localhost:3001/api/weeks/current` → `habits[0].entries[0].id`
- [x] 9.4 Happy path: `curl -s -X PATCH http://localhost:3001/api/habit-entries/{entryId} -H "Content-Type: application/json" -d "{\"status\":\"completed\"}"` → `200` con `status: completed` y `updatedAt` (US-10 S1)
- [x] 9.5 Ciclo: repetir PATCH con `{ "status": "failed" }` → `200` (US-10 S3)
- [x] 9.6 Validación: `curl -s -X PATCH http://localhost:3001/api/habit-entries/{entryId} -H "Content-Type: application/json" -d "{\"status\":\"done\"}"` → `400` `VALIDATION_ERROR` (US-10 S4)
- [x] 9.7 404: `curl -s -X PATCH http://localhost:3001/api/habit-entries/99999 -H "Content-Type: application/json" -d "{\"status\":\"completed\"}"` → `404`
- [x] 9.8 409 semana bloqueada: obtener `entryId` de semana histórica vía `curl -s "http://localhost:3001/api/weeks?offset=-1"` (si existe) y PATCH → `409` `WEEK_LOCKED` (US-10 S2); documentar si no hay semana bloqueada en seed
- [x] 9.9 Restaurar BD: `npm run db:seed`
- [x] 9.10 Informe: `openspec/changes/t-10-01-patch-habit-entry/reports/YYYY-MM-DD-step-09-curl.md`

## 10. E2E → tasks-core §N+3 (N/A — documentado)

- [x] 10.1 **N/A:** ticket Backend Presentación HTTP sin cambios UI; E2E Playwright no aplica.

## 11. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 11.1 Actualizar `docs/api-spec.yml`: añadir `/api/habit-entries/{id}` con `patch`, schemas request/response, 200/400/404/409 (`WEEK_LOCKED`, `HABIT_ENTRY_NOT_FOUND`, `VALIDATION_ERROR`)
- [x] 11.2 Actualizar snippets en `docs/backend-standards.md` si incluyen lista de endpoints HTTP

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] C.1 Confirmar `tasks.md` completo e informes PASS
- [x] C.2 Obtener aceptación del usuario
- [ ] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`
- [ ] C.4 `git push -u origin feature/T-10-01-patch-habit-entry`
- [ ] C.5 Merge a `develop`
- [ ] C.6 `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-10-01-patch-habit-entry/`
- [ ] C.7 `npm run openspec:mark-ticket -- --change t-10-01-patch-habit-entry`
