# Tasks — T-06-02 · Endpoint GET /api/profile



**Ticket:** T-06-02 · **User Story:** US-06 · **Change:** `t-06-02-endpoint-get-api-profile` · **Rama:** `feature/T-06-02-endpoint-get-api-profile`

**Pasos aplicables:** unit=sí · curl=sí · e2e=N/A · docs=sí



## 0. Setup → tasks-core §0 (OBLIGATORIO)



- [x] 0.1 `git checkout develop` y `git pull origin develop`

- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-06-02-endpoint-get-api-profile"`

- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-06-02-endpoint-get-api-profile"`

- [x] 0.4 `git checkout -b feature/T-06-02-endpoint-get-api-profile`

- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-06-02-endpoint-get-api-profile`



## 1. Preparar entorno



- [x] 1.1 Revisar baseline: `createApp.ts` (handler legacy), `getUserProfileById` (T-06-01 ✅), `errorHandler` (T-04-02 ✅)

- [x] 1.2 Confirmar seed con usuario `id=1` en `backend/prisma/seed.ts`

- [x] 1.3 Instalar devDependencies: `supertest` y `@types/supertest` en `package.json` raíz



## 2. Refactorizar handler GET /api/profile (DoD: 200 con DTO completo)



- [x] 2.1 En `backend/src/presentation/http/createApp.ts`, eliminar rama `if (!user)` y respuesta 404 legacy `{ error: "..." }`

- [x] 2.2 Mantener `asyncHandler` y llamada `getUserProfileById(userRepository, 1)` con `userId` hardcodeado

- [x] 2.3 Responder `res.json(user)` serializando `{ id, name, email, avatarUrl }` sin mapeo manual



## 3. Tests HTTP supertest (DoD: happy path + 404 US-06 esc. 1, 3)



- [x] 3.1 Crear `backend/src/presentation/http/createApp.test.ts` (o `profileRoute.test.ts`)

- [x] 3.2 Mockear `getUserProfileById` con `vi.mock`; instanciar `createApp` con Prisma stub

- [x] 3.3 Caso happy path: mock devuelve perfil → `GET /api/profile` → 200 con `{ id, name, email, avatarUrl }`

- [x] 3.4 Caso edge 404: mock lanza `NotFoundError` → 404 con `{ code: "USER_NOT_FOUND", message: "Usuario no encontrado" }`

- [x] 3.5 Caso edge `name: null`: mock devuelve perfil con `name: null` → 200 preservando `name: null`



## 4. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)



- [x] 4.1 `npm test -- backend/src/presentation/http/createApp.test.ts` (o ruta del archivo creado)

- [x] 4.2 Confirmar que `backend/src/application/getUserProfile.test.ts` sigue PASS (sin regresión T-06-01)

- [x] 4.3 Informe: `openspec/changes/t-06-02-endpoint-get-api-profile/reports/2026-06-10-step-04-unit.md` (plantilla `docs/openspec/templates/verification.md`)



## 5. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)



- [x] 5.1 `npm test` — suite backend relevante PASS

- [x] 5.2 `npm run dev:api` — confirmar arranque sin errores TypeScript

- [x] 5.3 Informe: `openspec/changes/t-06-02-endpoint-get-api-profile/reports/2026-06-10-step-05-verification.md`



## 6. curl → tasks-core §N+2 + templates/endpoint-testing.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)



- [x] 6.1 `npm run db:up` — PostgreSQL activo

- [x] 6.2 `npm run dev:api` — servidor en `http://localhost:3001`

- [x] 6.3 `curl -s http://localhost:3001/api/profile` — validar 200 con datos del seed (`id`, `name`, `email`, `avatarUrl`)

- [x] 6.4 (Opcional) Simular 404: eliminar usuario id=1 temporalmente o documentar mock test como cobertura de 404

- [x] 6.5 Informe: `openspec/changes/t-06-02-endpoint-get-api-profile/reports/2026-06-10-step-06-curl.md`



## 7. E2E → tasks-core §N+3 (N/A — documentado)



- [x] 7.1 **N/A:** ticket Backend Presentación HTTP sin cambios UI; E2E Playwright no aplica.



## 8. Documentación → tasks-core §N+4 (OBLIGATORIO)



- [x] 8.1 Actualizar `docs/api-spec.yml`: `/api/profile` 200 con `avatarUrl`; 404 con `ApiErrorResponse` (`USER_NOT_FOUND`)

- [x] 8.2 Actualizar snippets legacy en `docs/backend-standards.md` (handler `/api/profile`, formato 404)

- [x] 8.3 Añadir `avatarUrl` al schema `UserProfile` en `api-spec.yml` si falta



## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)



- [x] C.1 Confirmar `tasks.md` completo e informes PASS

- [x] C.2 Obtener aceptación del usuario

- [x] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`

- [ ] C.4 `git push -u origin feature/T-06-02-endpoint-get-api-profile`

- [ ] C.5 Merge a `develop`

- [ ] C.6 `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-06-02-endpoint-get-api-profile/`

- [ ] C.7 `npm run openspec:mark-ticket -- --change t-06-02-endpoint-get-api-profile`

