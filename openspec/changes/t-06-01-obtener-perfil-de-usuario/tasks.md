# Tasks — T-06-01 · Implementar repositorio y caso de uso: obtener perfil de usuario

**Ticket:** T-06-01 · **User Story:** US-06 · **Change:** `t-06-01-obtener-perfil-de-usuario` · **Rama:** `feature/T-06-01-obtener-perfil-de-usuario`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-06-01-obtener-perfil-de-usuario"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-06-01-obtener-perfil-de-usuario"`
- [x] 0.4 `git checkout -b feature/T-06-01-obtener-perfil-de-usuario`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-06-01-obtener-perfil-de-usuario`

## 1. Preparar entorno

- [x] 1.1 Revisar baseline en repo: `userProfile.ts`, `UserReadRepository.ts`, `prismaUserRepository.ts`, `getUserProfile.ts` (implementación parcial existente)
- [x] 1.2 Confirmar `NotFoundError` en `backend/src/domain/errors/appErrors.ts` (T-04-02 ✅)
- [x] 1.3 Confirmar columna `avatarUrl` en `backend/prisma/schema.prisma` (T-03-02 ✅)

## 2. Entidad UserProfile (DoD: tipo con avatarUrl)

- [x] 2.1 Añadir `avatarUrl: string | null` a `backend/src/domain/userProfile.ts`
- [x] 2.2 Mantener `name: string | null` y `email: string` según US-06 esc. 2

## 3. Puerto UserReadRepository (DoD: interfaz findById)

- [x] 3.1 Verificar `backend/src/application/ports/UserReadRepository.ts` expone `findById(id: number): Promise<UserProfile | null>`
- [x] 3.2 Ajustar imports/types si cambió `UserProfile`

## 4. Repositorio Prisma (DoD: prisma.user.findUnique)

- [x] 4.1 Actualizar `backend/src/infrastructure/prismaUserRepository.ts` para mapear `avatarUrl: user.avatarUrl`
- [x] 4.2 Preservar `null` cuando el usuario no existe (retorno `null`, sin throw)

## 5. Caso de uso getUserProfileById (DoD: NotFoundError)

- [x] 5.1 Refactorizar `backend/src/application/getUserProfile.ts`: retorno `Promise<UserProfile>`
- [x] 5.2 Si `repo.findById(id)` → `null`, lanzar `new NotFoundError('Usuario no encontrado')` (`USER_NOT_FOUND`)
- [x] 5.3 No modificar `createApp.ts` ni rutas HTTP (alcance T-06-02)

## 6. Tests unitarios getUserProfile.test.ts (DoD + US-06 esc. 1, 3)

- [x] 6.1 Crear `backend/src/application/getUserProfile.test.ts` con mock de `UserReadRepository`
- [x] 6.2 Caso happy path: repo devuelve perfil → mismo DTO al caller (incl. `avatarUrl`)
- [x] 6.3 Caso edge: repo devuelve `null` → `NotFoundError` con `code === 'USER_NOT_FOUND'`
- [x] 6.4 Caso edge: perfil con `name: null`, `avatarUrl: null` → valores preservados (US-06 esc. 2 — capa dominio)

## 7. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 7.1 `npm test -- backend/src/application/getUserProfile.test.ts`
- [x] 7.2 Ejecutar suite backend relevante si existe agrupación en `package.json`
- [x] 7.3 Informe: `openspec/changes/t-06-01-obtener-perfil-de-usuario/reports/2026-06-10-step-07-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 8. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 8.1 `npm test` — confirmar tests PASS del módulo afectado
- [x] 8.2 `npm run dev:api` — confirmar compilación/arranque sin errores TypeScript
- [x] 8.3 Informe: `openspec/changes/t-06-01-obtener-perfil-de-usuario/reports/2026-06-10-step-08-verification.md`

## 9. curl → tasks-core §N+2 (N/A — documentado)

- [x] 9.1 **N/A:** ticket Backend Dominio + Aplicación sin cambios HTTP; `GET /api/profile` y contrato REST se validan en T-06-02. No ejecutar curl en este change.

## 10. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 10.1 Actualizar snippets en `docs/backend-standards.md` donde `UserProfile` o `getUserProfileById` omitan `avatarUrl` o `NotFoundError`
- [x] 10.2 Verificar que no se modifica `docs/api-spec.yml` (contrato HTTP = T-06-02)
- [x] 10.3 Informe breve en el paso 8 o nota en verification si no hubo cambios docs

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] C.1 Confirmar `tasks.md` completo e informes PASS
- [ ] C.2 Obtener aceptación del usuario
- [ ] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`
- [ ] C.4 `git push -u origin feature/T-06-01-obtener-perfil-de-usuario`
- [ ] C.5 Merge a `develop`
- [ ] C.6 `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-06-01-obtener-perfil-de-usuario/`
- [ ] C.7 `npm run openspec:mark-ticket -- --change t-06-01-obtener-perfil-de-usuario`
