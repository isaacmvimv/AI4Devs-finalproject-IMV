# Tasks — T-08-01 · Endpoints PATCH y DELETE /api/habits/:id

**Ticket:** T-08-01 · **User Story:** US-08 · **Change:** `t-08-01-endpoints-patch-delete-habits` · **Rama:** `feature/T-08-01-endpoints-patch-delete-habits`

**Pasos aplicables:** unit=sí · curl=sí · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-08-01-endpoints-patch-delete-habits"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-08-01-endpoints-patch-delete-habits"`
- [x] 0.4 `git checkout -b feature/T-08-01-endpoints-patch-delete-habits`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-08-01-endpoints-patch-delete-habits`

## 1. Preparar entorno

- [x] 1.1 Revisar baseline: `HabitRepository` con `findById`/`update`/`softDelete` (T-07-01 ✅), GET/POST HTTP (T-07-02 ✅), `NotFoundError`/`ValidationError` (T-04-02 ✅)
- [x] 1.2 Confirmar seed con hábitos demo y `WeekHabit` para usuario `id=1` en `backend/prisma/seed.ts`
- [x] 1.3 Revisar `docs/api-spec.yml` sección `/api/habits/{id}` (PUT/DELETE planificados → objetivo PATCH/DELETE)

## 2. Validación Zod parcial (DoD: campos mutables emoji, name, pointsPerDay, penalty)

- [x] 2.1 En `backend/src/application/validation/habit.ts`, añadir `updateHabitSchema` parcial y `parseUpdateHabitInput(input: unknown)`
- [x] 2.2 Rechazar body vacío `{}` con `ValidationError` (campo `input`)
- [x] 2.3 Tests unitarios de validación: campo válido parcial, `pointsPerDay: 0`, body vacío → `ValidationError`

## 3. Casos de uso de aplicación (DoD: ownership + lógica de negocio)

- [x] 3.1 Crear helper de ownership (p. ej. `assertHabitOwnedByUser`) o lógica equivalente: `findById` + comparar `userId` → `NotFoundError('Hábito no encontrado', 'HABIT_NOT_FOUND')`
- [x] 3.2 Crear `backend/src/application/updateHabit.ts`: ownership → `parseUpdateHabitInput` → `repo.update`
- [x] 3.3 Crear `backend/src/application/deactivateHabit.ts`: ownership → `repo.softDelete`
- [x] 3.4 Tests unitarios `updateHabit.test.ts`: happy path, 404 ajeno, 404 inexistente, validación
- [x] 3.5 Tests unitarios `deactivateHabit.test.ts`: happy path (`isActive=false`), 404 ajeno; verificar que no se mutan snapshots `WeekHabit` (invariante: repo solo toca `Habit`)

## 4. Rutas HTTP PATCH y DELETE (DoD: 200/204/404)

- [x] 4.1 En `backend/src/presentation/http/createApp.ts`, importar `updateHabit` y `deactivateHabit`
- [x] 4.2 Añadir helper `parseHabitIdParam` (id no numérico → `NotFoundError` `HABIT_NOT_FOUND`)
- [x] 4.3 Registrar `PATCH /api/habits/:id` → `updateHabit(habitRepository, 1, habitId, req.body)` → `200` JSON
- [x] 4.4 Registrar `DELETE /api/habits/:id` → `deactivateHabit(habitRepository, 1, habitId)` → `204` sin body

## 5. Tests HTTP supertest (DoD: happy path + edge US-08 esc. 1–3)

- [x] 5.1 Ampliar `backend/src/presentation/http/createApp.test.ts` con `vi.mock` de `updateHabit` y `deactivateHabit`
- [x] 5.2 PATCH happy path: mock devuelve hábito actualizado → `PATCH /api/habits/5` → `200`
- [x] 5.3 PATCH 400: mock lanza `ValidationError` → `400` `VALIDATION_ERROR`
- [x] 5.4 PATCH 404: mock lanza `NotFoundError` → `404` `HABIT_NOT_FOUND`
- [x] 5.5 PATCH id inválido (`abc`) → `404` sin invocar use case
- [x] 5.6 DELETE happy path: mock resuelve → `DELETE /api/habits/5` → `204`, body vacío
- [x] 5.7 DELETE 404: mock lanza `NotFoundError` → `404` `HABIT_NOT_FOUND`

## 6. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 6.1 `npm test -- backend/src/application/updateHabit.test.ts backend/src/application/deactivateHabit.test.ts`
- [x] 6.2 `npm test -- backend/src/presentation/http/createApp.test.ts`
- [x] 6.3 Confirmar tests T-07-01/T-07-02 sin regresión (`createHabit.test.ts`, `getActiveHabits.test.ts`)
- [x] 6.4 Informe: `openspec/changes/t-08-01-endpoints-patch-delete-habits/reports/YYYY-MM-DD-step-06-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 7. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 7.1 `npm test` — suite backend relevante PASS
- [x] 7.2 `npm run dev:api` — confirmar arranque sin errores TypeScript
- [x] 7.3 Informe: `openspec/changes/t-08-01-endpoints-patch-delete-habits/reports/YYYY-MM-DD-step-07-verification.md`

## 8. curl → tasks-core §N+2 + templates/endpoint-testing.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 8.1 `npm run db:up` — PostgreSQL activo
- [x] 8.2 `npm run dev:api` — servidor en `http://localhost:3001`
- [x] 8.3 Obtener id de hábito seed: `curl -s http://localhost:3001/api/habits` → anotar `id`
- [x] 8.4 `curl -s -X PATCH http://localhost:3001/api/habits/{id} -H "Content-Type: application/json" -d "{\"pointsPerDay\":15}"` — validar `200` con `pointsPerDay:15`
- [x] 8.5 `curl -s -X PATCH http://localhost:3001/api/habits/99999 -H "Content-Type: application/json" -d "{\"pointsPerDay\":15}"` — validar `404` `HABIT_NOT_FOUND`
- [x] 8.6 Crear hábito de prueba vía POST, luego `curl -s -X DELETE http://localhost:3001/api/habits/{id}` — validar `204`; GET list ya no lo incluye
- [x] 8.7 Verificar snapshots intactos: consultar `WeekHabit` del seed (psql o Prisma Studio) tras DELETE — `snapshotName`/`snapshotPoints`/`snapshotPenalty` sin cambios (DoD US-08 S4)
- [x] 8.8 Restaurar BD: `npm run db:seed`
- [x] 8.9 Informe: `openspec/changes/t-08-01-endpoints-patch-delete-habits/reports/YYYY-MM-DD-step-08-curl.md`

## 9. E2E → tasks-core §N+3 (N/A — documentado)

- [x] 9.1 **N/A:** ticket Backend Presentación HTTP sin cambios UI; E2E Playwright no aplica.

## 10. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 10.1 Actualizar `docs/api-spec.yml`: `/api/habits/{id}` con `patch` (sustituir `put` planificado) y `delete` implementados; respuestas 200/204/404/400; `HABIT_NOT_FOUND`; schema `HabitApi`
- [x] 10.2 Actualizar snippets en `docs/backend-standards.md` si incluyen handlers `/api/habits/:id`

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] C.1 Confirmar `tasks.md` completo e informes PASS
- [ ] C.2 Obtener aceptación del usuario
- [ ] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`
- [ ] C.4 `git push -u origin feature/T-08-01-endpoints-patch-delete-habits`
- [ ] C.5 Merge a `develop`
- [ ] C.6 `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-08-01-endpoints-patch-delete-habits/`
- [ ] C.7 `npm run openspec:mark-ticket -- --change t-08-01-endpoints-patch-delete-habits`
