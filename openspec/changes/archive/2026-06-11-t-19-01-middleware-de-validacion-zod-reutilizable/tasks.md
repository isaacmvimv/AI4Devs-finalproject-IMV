# Tasks — T-19-01 · Middleware de validación Zod reutilizable

**Ticket:** T-19-01 · **User Story:** US-19 · **Change:** `t-19-01-middleware-de-validacion-zod-reutilizable` · **Rama:** `feature/T-19-01-middleware-de-validacion-zod-reutilizable`

**Pasos aplicables:** unit=sí · curl=sí · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-19-01-middleware-de-validacion-zod-reutilizable"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-19-01-middleware-de-validacion-zod-reutilizable"`
- [x] 0.4 `git checkout -b feature/T-19-01-middleware-de-validacion-zod-reutilizable`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-19-01-middleware-de-validacion-zod-reutilizable`

## 1. Preparar entorno

- [x] 1.1 Revisar baseline: `ValidationError` + `errorHandler` (T-04-02 ✅), `application/validation/habit.ts` (T-07-01 ✅), rutas POST/PATCH hábitos (T-07-02/T-08-01 ✅)
- [x] 1.2 Confirmar que no existe `validateBody.ts` en `backend/src/presentation/http/middleware/`
- [x] 1.3 Confirmar ausencia de `POST /api/rewards` en `createApp.ts` (cableado recompensas diferido a T-11-02)

## 2. Exportar schemas Zod reutilizables (DoD: schemas para middleware)

- [x] 2.1 En `backend/src/application/validation/habit.ts`, exportar `createHabitSchema` y `updateHabitSchema` (mantener `parseCreateHabitInput` / `parseUpdateHabitInput` usando los mismos schemas)
- [x] 2.2 Crear `backend/src/application/validation/reward.ts` con `createRewardSchema` (`emoji`, `name`, `description`, `cost` entero positivo) alineado US-11 S1/S4
- [x] 2.3 Verificar que `npm test -- backend/src/application/validation/habit.test.ts` sigue PASS sin regresión

## 3. Implementar validateBody (DoD: factory middleware Express)

- [x] 3.1 Crear `backend/src/presentation/http/middleware/validateBody.ts` con factory `validateBody(schema: ZodSchema)`
- [x] 3.2 En fallo Zod: mapear `issues` a `[{ field, message }]` con `path.join('.') || 'input'` y llamar `next(new ValidationError('Datos inválidos', details))`
- [x] 3.3 En éxito: asignar `req.body = result.data` e invocar `next()`

## 4. Cablear middleware en rutas hábitos (DoD: aplicado POST/PATCH hábitos)

- [x] 4.1 Importar `validateBody`, `createHabitSchema`, `updateHabitSchema` en `createApp.ts`
- [x] 4.2 Registrar `validateBody(createHabitSchema)` antes de `asyncHandler` en `POST /api/habits`
- [x] 4.3 Registrar `validateBody(updateHabitSchema)` antes de `asyncHandler` en `PATCH /api/habits/:id`

## 5. Preparar integración recompensas (DoD: aplicado en recompensas — schema + test)

- [x] 5.1 Añadir en `validateBody.test.ts` caso con `createRewardSchema`: body `{ cost: 0 }` → `ValidationError` con `field: "cost"`
- [x] 5.2 Documentar en comentario o `backend-standards.md` que T-11-02 debe registrar `validateBody(createRewardSchema)` en `POST /api/rewards`

## 6. Tests unitarios validateBody (DoD: validateBody.test.ts)

- [x] 6.1 Crear `backend/src/presentation/http/middleware/validateBody.test.ts` con mocks de `req`, `res`, `next`
- [x] 6.2 Happy path: body válido → `next()` sin argumentos de error
- [x] 6.3 Edge: un campo inválido → `next` recibe `ValidationError` con `details` de un elemento
- [x] 6.4 Edge: varios campos inválidos → `details` con múltiples entradas
- [x] 6.5 Ampliar `createApp.test.ts` con al menos un caso supertest real (sin mock de validación en use case) que envíe body inválido a `POST /api/habits` y espere 400 `VALIDATION_ERROR`

## 7. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 7.1 `npm test -- backend/src/presentation/http/middleware/validateBody.test.ts`
- [x] 7.2 `npm test -- backend/src/presentation/http/createApp.test.ts`
- [x] 7.3 Confirmar suite relevante (`errorHandler.test.ts`, `habit.test.ts`) sin regresión
- [x] 7.4 Informe: `openspec/changes/t-19-01-middleware-de-validacion-zod-reutilizable/reports/YYYY-MM-DD-step-07-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 8. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 8.1 `npm test` — suite backend relevante PASS
- [x] 8.2 `npm run dev:api` — confirmar arranque sin errores TypeScript
- [x] 8.3 Informe: `openspec/changes/t-19-01-middleware-de-validacion-zod-reutilizable/reports/YYYY-MM-DD-step-08-verification.md`

## 9. curl → tasks-core §N+2 + templates/endpoint-testing.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 9.1 `npm run db:up` — PostgreSQL activo
- [x] 9.2 `npm run dev:api` — servidor en `http://localhost:3001`
- [x] 9.3 `curl -s -X POST http://localhost:3001/api/habits -H "Content-Type: application/json" -d "{\"emoji\":\"🏃\"}"` — validar 400 `VALIDATION_ERROR` con `details` para `name` y `pointsPerDay` (US-19 S2)
- [x] 9.4 `curl -s -X POST http://localhost:3001/api/habits -H "Content-Type: application/json" -d "{\"emoji\":\"🏃\",\"name\":\"\",\"pointsPerDay\":10,\"penalty\":5}"` — validar 400 con detail `name`
- [x] 9.5 `curl -s -X PATCH http://localhost:3001/api/habits/1 -H "Content-Type: application/json" -d "{}"` — validar 400 con detail `input`
- [x] 9.6 Restaurar BD si hubo mutaciones de prueba: `npm run db:seed`
- [x] 9.7 Informe: `openspec/changes/t-19-01-middleware-de-validacion-zod-reutilizable/reports/YYYY-MM-DD-step-09-curl.md`

## 10. E2E → tasks-core §N+3 (N/A — documentado)

- [x] 10.1 **N/A:** ticket Backend Presentación HTTP sin cambios UI; E2E Playwright no aplica.

## 11. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 11.1 Actualizar `docs/backend-standards.md` sección "Patrones de validación" con ejemplo `validateBody(schema)` y orden middleware → `asyncHandler`
- [x] 11.2 Revisar `docs/api-spec.yml`: confirmar que respuestas 400 de POST/PATCH hábitos siguen documentadas (sin cambio de contrato)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] C.1 Confirmar `tasks.md` completo e informes PASS
- [ ] C.2 Obtener aceptación del usuario
- [ ] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`
- [ ] C.4 `git push -u origin feature/T-19-01-middleware-de-validacion-zod-reutilizable`
- [ ] C.5 Merge a `develop`
- [ ] C.6 `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-19-01-middleware-de-validacion-zod-reutilizable/`
- [ ] C.7 `npm run openspec:mark-ticket -- --change t-19-01-middleware-de-validacion-zod-reutilizable`
