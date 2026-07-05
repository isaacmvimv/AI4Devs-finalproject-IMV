# Tasks — T-09-03 · Endpoint GET /api/weeks/current y GET /api/weeks?offset=n



**Ticket:** T-09-03 · **User Story:** US-09 · **Change:** `t-09-03-endpoint-get-api-weeks-current` · **Rama:** `feature/T-09-03-endpoint-get-api-weeks-current`



**Pasos aplicables:** unit=sí · curl=sí · e2e=N/A · docs=sí



## 0. Setup → tasks-core §0 (OBLIGATORIO)



- [x] 0.1 `git checkout develop` y `git pull origin develop`

- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-09-03-endpoint-get-api-weeks-current"`

- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-09-03-endpoint-get-api-weeks-current"`

- [x] 0.4 `git checkout -b feature/T-09-03-endpoint-get-api-weeks-current`

- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-09-03-endpoint-get-api-weeks-current`



## 1. Preparar entorno



- [x] 1.1 Revisar baseline: `getCurrentWeek` y `lockWeekAndTransition` (T-09-01/T-09-02 ✅), `createPrismaWeekRepository`, `createApp.ts` sin rutas weeks

- [x] 1.2 Confirmar seed demo con semana activa y entries `pending` para usuario `id=1` (`backend/prisma/seed.ts`)

- [x] 1.3 Revisar schema de respuesta en `readme-entrega-2.md` § `GET /api/weeks/current` y AC US-09 esc. 1–6



## 2. Dominio y repositorio (DoD: offset histórico + lastWeekPoints)



- [x] 2.1 Añadir `addUtcWeeks(startDate: Date, weeks: number): Date` en `backend/src/domain/week.ts` (+ test en `getWeekBoundaries.test.ts` o archivo dedicado)

- [x] 2.2 Ampliar `WeekRepository` con `findWeekByUserAndStartDate` y `findLastLockedWeekBefore`

- [x] 2.3 Implementar ambos métodos en `prismaWeekRepository.ts` con `include` de `weekHabits` + `habitEntries`



## 3. Stats y DTO en aplicación (DoD: cálculos fuera del endpoint)



- [x] 3.1 Crear `backend/src/application/calculateWeekStats.ts` con `WeekStats` y lógica `thisWeekPoints`/`penalties`/`maxStreak` desde snapshots + entries

- [x] 3.2 Crear helper `getCurrentDayIndex(weekStartDate, now)` (UTC, 0=lunes … 6=domingo) para `maxStreak`

- [x] 3.3 Crear `mapWeekToApiResponse.ts` (o equivalente) → `{ week, habits, stats, redemptions: [] }`

- [x] 3.4 Tests unitarios `calculateWeekStats.test.ts`: entries completed/failed, semana vacía → ceros (US-13 S5 edge)



## 4. Casos de uso HTTP (DoD: orquestación lock + respuesta)



- [x] 4.1 Crear `getCurrentWeekResponse.ts`: `lockWeekAndTransition` → `findLastLockedWeekBefore` → `calculateWeekStats` → mapper DTO; retry único de `getCurrentWeek` si aplica (design §7)

- [x] 4.2 Crear `getWeekByOffset.ts`: `offset=0` delega en `getCurrentWeekResponse`; `offset<0` carga semana por `startDate` sin `lockWeekAndTransition`; ausente → `NotFoundError('Semana no encontrada', 'WEEK_NOT_FOUND')`

- [x] 4.3 Crear `parseWeekOffsetQuery` para query `offset` (entero; default `0` si ausente; no numérico → `ValidationError`)

- [x] 4.4 Tests unitarios `getWeekByOffset.test.ts` y `getCurrentWeekResponse.test.ts` con mocks de repositorio (US-09 S3–S4)



## 5. Rutas HTTP (DoD: registrar en createApp.ts)



- [x] 5.1 Instanciar `weekRepository = createPrismaWeekRepository(prisma)` en `createApp.ts`

- [x] 5.2 Registrar `GET /api/weeks/current` → `getCurrentWeekResponse(weekRepository, habitRepository, 1)` → `200` JSON

- [x] 5.3 Registrar `GET /api/weeks` → `parseWeekOffsetQuery(req.query.offset)` → `getWeekByOffset(...)` → `200` JSON



## 6. Tests HTTP supertest (DoD: happy path + edge US-09 esc. 3–6)



- [x] 6.1 Ampliar `createApp.test.ts` con `vi.mock` de `getCurrentWeekResponse` y `getWeekByOffset`

- [x] 6.2 `GET /api/weeks/current` happy path → `200` con `week`, `habits`, `stats`, `redemptions: []` (US-09 S3)

- [x] 6.3 Dos `GET /api/weeks/current` consecutivos → mismo mock, sin error (US-09 S4)

- [x] 6.4 `GET /api/weeks?offset=-1` → `200` semana bloqueada con snapshots históricos (US-09 S5–6)

- [x] 6.5 `GET /api/weeks?offset=-5` → `404` `WEEK_NOT_FOUND` (US-09 S6)

- [x] 6.6 Propagación `ValidationError` en offset inválido → `400`



## 7. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)



- [x] 7.1 `npm test -- backend/src/application/calculateWeekStats.test.ts backend/src/application/getWeekByOffset.test.ts backend/src/application/getCurrentWeekResponse.test.ts`

- [x] 7.2 `npm test -- backend/src/presentation/http/createApp.test.ts`

- [x] 7.3 Confirmar tests T-09-01/T-09-02 sin regresión (`getCurrentWeek.test.ts`, `lockWeekAndTransition.test.ts`)

- [x] 7.4 Informe: `openspec/changes/t-09-03-endpoint-get-api-weeks-current/reports/YYYY-MM-DD-step-07-unit.md` (plantilla `docs/openspec/templates/verification.md`)



## 8. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)



- [x] 8.1 `npm test` — suite backend relevante PASS

- [x] 8.2 `npm run dev:api` — confirmar arranque sin errores TypeScript

- [x] 8.3 Informe: `openspec/changes/t-09-03-endpoint-get-api-weeks-current/reports/YYYY-MM-DD-step-08-verification.md`



## 9. curl → tasks-core §N+2 + templates/endpoint-testing.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)



- [x] 9.1 `npm run db:up` — PostgreSQL activo

- [x] 9.2 `npm run db:seed` — datos demo consistentes

- [x] 9.3 `npm run dev:api` — servidor en `http://localhost:3001`

- [x] 9.4 `curl -s http://localhost:3001/api/weeks/current` — validar `200`, estructura `week`/`habits`/`stats`/`redemptions: []` (US-09 S1–S2)

- [x] 9.5 Segundo `curl` a `/api/weeks/current` — mismo `week.id`, sin duplicados (US-09 S4)

- [x] 9.6 `curl -s "http://localhost:3001/api/weeks?offset=0"` — equivalente a current (`200`)

- [x] 9.7 `curl -s "http://localhost:3001/api/weeks?offset=-5"` — validar `404` `WEEK_NOT_FOUND` (US-09 S6)

- [x] 9.8 (Opcional si hay semana bloqueada en BD) `curl -s "http://localhost:3001/api/weeks?offset=-1"` — `isLocked=true` y snapshots inmutables; documentar en informe si seed solo tiene 1 semana

- [x] 9.9 Restaurar BD: `npm run db:seed`

- [x] 9.10 Informe: `openspec/changes/t-09-03-endpoint-get-api-weeks-current/reports/YYYY-MM-DD-step-09-curl.md`



## 10. E2E → tasks-core §N+3 (N/A — documentado)



- [x] 10.1 **N/A:** ticket Backend Presentación HTTP sin cambios UI; E2E Playwright no aplica.



## 11. Documentación → tasks-core §N+4 (OBLIGATORIO)



- [x] 11.1 Actualizar `docs/api-spec.yml`: paths `/api/weeks/current` y `/api/weeks` con query `offset`, schema de respuesta, `404 WEEK_NOT_FOUND`

- [x] 11.2 Actualizar `docs/data-model.md`: stats expuestos vía API; nota de reemplazo de navegación frontend provisional

- [x] 11.3 Informe: `openspec/changes/t-09-03-endpoint-get-api-weeks-current/reports/YYYY-MM-DD-step-11-docs.md`



## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)



- [x] C.1 Confirmar `tasks.md` completo e informes PASS

- [x] C.2 Obtener aceptación del usuario

- [x] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`

- [x] C.4 `git push -u origin feature/T-09-03-endpoint-get-api-weeks-current`

- [x] C.5 Merge a `develop`

- [x] C.6 `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-09-03-endpoint-get-api-weeks-current/`

- [x] C.7 `npm run openspec:mark-ticket -- --change t-09-03-endpoint-get-api-weeks-current`

