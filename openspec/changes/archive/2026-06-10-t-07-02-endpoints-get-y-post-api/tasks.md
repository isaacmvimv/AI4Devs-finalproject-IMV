# Tasks — T-07-02 · Endpoints GET y POST /api/habits

**Ticket:** T-07-02 · **User Story:** US-07 · **Change:** `t-07-02-endpoints-get-y-post-api` · **Rama:** `feature/T-07-02-endpoints-get-y-post-api`

**Pasos aplicables:** unit=sí · curl=sí · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-07-02-endpoints-get-y-post-api"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-07-02-endpoints-get-y-post-api"`
- [x] 0.4 `git checkout -b feature/T-07-02-endpoints-get-y-post-api`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-07-02-endpoints-get-y-post-api`

## 1. Preparar entorno

- [x] 1.1 Revisar baseline: `createHabit`, `getActiveHabits`, `parseCreateHabitInput` (T-07-01 ✅), `errorHandler` (T-04-02 ✅), `createApp.test.ts` patrón T-06-02
- [x] 1.2 Confirmar `supertest` ya instalado en `package.json` raíz
- [x] 1.3 Confirmar seed con hábitos demo para usuario `id=1` en `backend/prisma/seed.ts`

## 2. Cablear repositorio y rutas HTTP (DoD: GET 200 + POST 201)

- [x] 2.1 En `backend/src/presentation/http/createApp.ts`, importar `createPrismaHabitRepository`, `createHabit`, `getActiveHabits`
- [x] 2.2 Instanciar `habitRepository = createPrismaHabitRepository(prisma)` junto a `userRepository`
- [x] 2.3 Registrar `GET /api/habits` con `asyncHandler` → `getActiveHabits(habitRepository, 1)` → `res.status(200).json(habits)`
- [x] 2.4 Registrar `POST /api/habits` con `asyncHandler` → `createHabit(habitRepository, 1, req.body)` → `res.status(201).json(habit)`

## 3. Tests HTTP supertest (DoD: happy path + validación US-07 esc. 1, 3–5)

- [x] 3.1 Ampliar `backend/src/presentation/http/createApp.test.ts` con `vi.mock` de `createHabit` y `getActiveHabits`
- [x] 3.2 GET happy path: mock devuelve array de hábitos → `GET /api/habits` → 200 con elementos `{ id, emoji, name, pointsPerDay, penalty, isActive, createdAt }`
- [x] 3.3 GET edge: mock devuelve `[]` → 200 con array vacío
- [x] 3.4 POST happy path: mock devuelve hábito creado → `POST /api/habits` con body válido → 201 con cuerpo completo incl. `userId`, `isActive: true`
- [x] 3.5 POST 400 name: mock lanza `ValidationError` con detail `name` → 400 `{ code: "VALIDATION_ERROR", details }`
- [x] 3.6 POST 400 pointsPerDay: mock lanza `ValidationError` con detail `pointsPerDay` → 400
- [x] 3.7 POST 400 emoji: mock lanza `ValidationError` con detail `emoji` → 400

## 4. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 4.1 `npm test -- backend/src/presentation/http/createApp.test.ts`
- [x] 4.2 Confirmar que `backend/src/application/createHabit.test.ts` y `getActiveHabits.test.ts` siguen PASS (sin regresión T-07-01)
- [x] 4.3 Informe: `openspec/changes/t-07-02-endpoints-get-y-post-api/reports/YYYY-MM-DD-step-04-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 5. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 5.1 `npm test` — suite backend relevante PASS
- [x] 5.2 `npm run dev:api` — confirmar arranque sin errores TypeScript
- [x] 5.3 Informe: `openspec/changes/t-07-02-endpoints-get-y-post-api/reports/YYYY-MM-DD-step-05-verification.md`

## 6. curl → tasks-core §N+2 + templates/endpoint-testing.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 6.1 `npm run db:up` — PostgreSQL activo
- [x] 6.2 `npm run dev:api` — servidor en `http://localhost:3001`
- [x] 6.3 `curl -s http://localhost:3001/api/habits` — validar 200 con array (solo activos del seed)
- [x] 6.4 `curl -s -X POST http://localhost:3001/api/habits -H "Content-Type: application/json" -d "{\"emoji\":\"🏃\",\"name\":\"Test curl\",\"pointsPerDay\":10,\"penalty\":5}"` — validar 201
- [x] 6.5 `curl -s -X POST ... -d "{\"emoji\":\"🏃\",\"name\":\"\",\"pointsPerDay\":10,\"penalty\":5}"` — validar 400 `VALIDATION_ERROR` + `details`
- [x] 6.6 Restaurar BD: eliminar hábito de prueba o `npm run db:seed`
- [x] 6.7 Informe: `openspec/changes/t-07-02-endpoints-get-y-post-api/reports/YYYY-MM-DD-step-06-curl.md`

## 7. E2E → tasks-core §N+3 (N/A — documentado)

- [x] 7.1 **N/A:** ticket Backend Presentación HTTP sin cambios UI; E2E Playwright no aplica.

## 8. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 8.1 Actualizar `docs/api-spec.yml`: `/api/habits` GET/POST implementados; POST 400 con `ApiErrorResponse`; schema de respuesta alineado con persistencia (`id`, `userId`, `isActive`, `createdAt`)
- [x] 8.2 Actualizar snippets en `docs/backend-standards.md` si incluyen ejemplo de handler `/api/habits`

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] C.1 Confirmar `tasks.md` completo e informes PASS
- [ ] C.2 Obtener aceptación del usuario
- [ ] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`
- [ ] C.4 `git push -u origin feature/T-07-02-endpoints-get-y-post-api`
- [ ] C.5 Merge a `develop`
- [ ] C.6 `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-07-02-endpoints-get-y-post-api/`
- [ ] C.7 `npm run openspec:mark-ticket -- --change t-07-02-endpoints-get-y-post-api`
