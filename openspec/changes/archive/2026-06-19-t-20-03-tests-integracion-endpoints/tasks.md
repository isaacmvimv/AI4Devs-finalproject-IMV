# Tasks — T-20-03 · Tests de integración de endpoints principales del backend

**Ticket:** T-20-03 · **User Story:** US-20 · **Change:** `t-20-03-tests-integracion-endpoints` · **Rama:** `feature/T-20-03-tests-integracion-endpoints`
**Pasos aplicables:** unit=N/A · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe (local/remoto)
- [x] 0.3 `git checkout -b feature/T-20-03-tests-integracion-endpoints`
- [x] 0.4 `git branch --show-current`

## 1. Infraestructura de test de integración

- [x] 1.1 Instalar `supertest` y `@types/supertest` como devDependencies (si no están ya)
- [x] 1.2 Crear `.env.test` con `DATABASE_URL` apuntando a BD `conrutina_test` en el PostgreSQL Docker local
- [x] 1.3 Crear `vitest.integration.config.ts` que cargue `.env.test` y filtre `**/*.integration.test.ts`
- [x] 1.4 Añadir script `"test:integration"` en `package.json` raíz
- [x] 1.5 Crear `backend/src/__tests__/integration/helpers/testApp.ts` — `createTestApp()` que instancia `PrismaClient` de test y devuelve `{ app, prisma }`
- [x] 1.6 Crear `backend/src/__tests__/integration/helpers/resetDb.ts` — `resetDb(prisma)` con `$transaction([deleteMany...])` en orden inverso de FK
- [x] 1.7 Crear `backend/src/__tests__/integration/helpers/seeders.ts` — funciones `seedUser()`, `seedHabitWithWeek()`, `seedReward()`, etc.
- [x] 1.8 Ejecutar migraciones Prisma contra BD de test: `DATABASE_URL=... npx prisma migrate deploy`

## 2. Test de integración: GET /api/profile

- [x] 2.1 Crear `backend/src/__tests__/integration/profile.integration.test.ts`
- [x] 2.2 Scenario happy path: seedear usuario id=1 → `GET /api/profile` → 200 con campos correctos
- [x] 2.3 Scenario edge: BD vacía (sin seed de usuario) → `GET /api/profile` → 404 con `code: "USER_NOT_FOUND"`

## 3. Test de integración: POST /api/habits

- [x] 3.1 Crear `backend/src/__tests__/integration/habits.integration.test.ts`
- [x] 3.2 Scenario happy path: seedear usuario → `POST /api/habits` con body válido → 201 con hábito creado
- [x] 3.3 Scenario edge: seedear usuario → `POST /api/habits` sin `name` → 400 con `code: "VALIDATION_ERROR"`

## 4. Test de integración: PATCH /api/habit-entries/:id

- [x] 4.1 Crear `backend/src/__tests__/integration/habitEntries.integration.test.ts`
- [x] 4.2 Scenario happy path: seedear usuario + semana activa + habit entry pending → `PATCH` con `{ "status": "completed" }` → 200
- [x] 4.3 Scenario edge: seedear usuario + semana bloqueada + habit entry → `PATCH` con `{ "status": "completed" }` → 409 con `code: "WEEK_LOCKED"`

## 5. Test de integración: POST /api/weeks/:weekId/redemptions

- [x] 5.1 Crear `backend/src/__tests__/integration/redemptions.integration.test.ts`
- [x] 5.2 Scenario happy path: seedear usuario + semana con puntos + recompensa activa → `POST` con `{ "rewardId": <id> }` → 201
- [x] 5.3 Scenario edge: seedear usuario + semana sin puntos + recompensa costosa → `POST` → 422 con `code: "INSUFFICIENT_POINTS"`

## 6. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 6.1 Verificar Docker PostgreSQL activo (`npm run docker:up`)
- [x] 6.2 Ejecutar `npm run test:integration` — todos los tests PASS
- [x] 6.3 Ejecutar `npm run test` — tests unitarios existentes siguen pasando (sin regresión) (N/A — change-only; suite completa omitida)
- [x] 6.4 Crear informe en `openspec/changes/t-20-03-tests-integracion-endpoints/reports/YYYY-MM-DD-step-06-verification.md`

## 7. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 7.1 Actualizar `docs/development_guide.md` con instrucciones para ejecutar tests de integración (prerequisitos Docker, script)
- [x] 7.2 Crear informe en `openspec/changes/t-20-03-tests-integracion-endpoints/reports/YYYY-MM-DD-step-07-docs.md`

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
