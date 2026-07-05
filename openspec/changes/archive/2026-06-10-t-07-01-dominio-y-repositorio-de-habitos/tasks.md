# Tasks — T-07-01 · Dominio y repositorio de hábitos (crear, listar, desactivar)

**Ticket:** T-07-01 · **User Story:** US-07 · **Change:** `t-07-01-dominio-y-repositorio-de-habitos` · **Rama:** `feature/T-07-01-dominio-y-repositorio-de-habitos`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-07-01-dominio-y-repositorio-de-habitos"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-07-01-dominio-y-repositorio-de-habitos"`
- [x] 0.4 `git checkout -b feature/T-07-01-dominio-y-repositorio-de-habitos`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-07-01-dominio-y-repositorio-de-habitos`

## 1. Preparar entorno

- [x] 1.1 Confirmar modelo `Habit` en `backend/prisma/schema.prisma` (T-03-02 ✅) — sin cambios de esquema
- [x] 1.2 Confirmar `ValidationError` en `backend/src/domain/errors/appErrors.ts` (T-04-02 ✅)
- [x] 1.3 Revisar patrón de referencia: `getUserProfile.ts`, `prismaUserRepository.ts`, `getUserProfile.test.ts`
- [x] 1.4 Verificar que no existen archivos `*habit*` en `backend/src/` (greenfield acotado a capas backend)

## 2. Entidad Habit (DoD: tipo de dominio)

- [x] 2.1 Crear `backend/src/domain/habit.ts` con interface `Habit` (`id`, `userId`, `emoji`, `name`, `pointsPerDay`, `penalty`, `isActive`, `createdAt`)
- [x] 2.2 Añadir tipos `CreateHabitData` y `UpdateHabitData` según design.md

## 3. Puerto HabitRepository (DoD: create, findActiveByUserId, findById, update, softDelete)

- [x] 3.1 Crear `backend/src/application/ports/HabitRepository.ts` con las cinco firmas del DoD
- [x] 3.2 Importar tipos desde `domain/habit.ts`

## 4. Repositorio Prisma (DoD: PrismaHabitRepository)

- [x] 4.1 Crear `backend/src/infrastructure/prismaHabitRepository.ts` con factory `createPrismaHabitRepository(prisma)`
- [x] 4.2 Implementar `create` — insert con `isActive: true` por defecto, mapeo a `Habit`
- [x] 4.3 Implementar `findActiveByUserId` — `where: { userId, isActive: true }`, orden por `createdAt`
- [x] 4.4 Implementar `findById` — retorno `null` si no existe
- [x] 4.5 Implementar `update` — actualización parcial de campos permitidos
- [x] 4.6 Implementar `softDelete` — `isActive: false` sin borrado físico

## 5. Validación Zod (DoD: createHabit valida con Zod)

- [x] 5.1 Crear `backend/src/application/validation/habit.ts` con schema Zod para create (`name`, `emoji`, `pointsPerDay > 0`, `penalty >= 0`)
- [x] 5.2 Exportar `parseCreateHabitInput(input: unknown)` que lance `ValidationError` con `details: [{ field, message }]` en español (US-07 esc. 3–5)

## 6. Caso de uso createHabit (DoD + US-07 esc. 1, 3–5)

- [x] 6.1 Crear `backend/src/application/createHabit.ts` — firma `(repo, userId, input)`
- [x] 6.2 Validar con `parseCreateHabitInput`; construir `CreateHabitData` con `userId`
- [x] 6.3 Delegar a `repo.create` y retornar `Habit` creado con `isActive: true`

## 7. Caso de uso getActiveHabits (DoD + US-07 esc. 2)

- [x] 7.1 Crear `backend/src/application/getActiveHabits.ts` — firma `(repo, userId)`
- [x] 7.2 Delegar a `repo.findActiveByUserId(userId)` y retornar array (vacío si no hay activos)

## 8. Tests unitarios createHabit.test.ts (DoD + US-07 esc. 1, 3–5)

- [x] 8.1 Crear `backend/src/application/createHabit.test.ts` con mock de `HabitRepository`
- [x] 8.2 Caso happy path: input válido → `repo.create` llamado con `userId` y campos → retorna hábito (US-07 S1)
- [x] 8.3 Caso edge: `name` vacío/ausente → `ValidationError`, `create` no invocado (US-07 S3)
- [x] 8.4 Caso edge: `pointsPerDay <= 0` → `ValidationError` (US-07 S4)
- [x] 8.5 Caso edge: sin `emoji` → `ValidationError` (US-07 S5)
- [x] 8.6 Caso edge: `penalty < 0` → `ValidationError`

## 9. Tests unitarios getActiveHabits.test.ts (DoD + US-07 esc. 2)

- [x] 9.1 Crear `backend/src/application/getActiveHabits.test.ts` con mock de `HabitRepository`
- [x] 9.2 Caso happy path: repo devuelve hábitos activos → mismo array al caller
- [x] 9.3 Caso edge: repo devuelve `[]` → use case retorna `[]`

## 10. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 10.1 `npm test -- backend/src/application/createHabit.test.ts backend/src/application/getActiveHabits.test.ts`
- [x] 10.2 Ejecutar suite backend relevante si existe agrupación en `package.json`
- [x] 10.3 Informe: `openspec/changes/t-07-01-dominio-y-repositorio-de-habitos/reports/YYYY-MM-DD-step-10-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 11. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 11.1 `npm test` — confirmar tests PASS del módulo afectado
- [x] 11.2 `npm run dev:api` — confirmar compilación/arranque sin errores TypeScript
- [x] 11.3 Informe: `openspec/changes/t-07-01-dominio-y-repositorio-de-habitos/reports/YYYY-MM-DD-step-11-verification.md`

## 12. curl → tasks-core §N+2 (N/A — documentado)

- [x] 12.1 **N/A:** ticket Backend Dominio + Aplicación + Infraestructura sin cambios HTTP; `GET/POST /api/habits` se validan en T-07-02. No ejecutar curl en este change.

## 13. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 13.1 Actualizar snippets en `docs/backend-standards.md` donde falten `HabitRepository`, `createHabit`, `getActiveHabits` o validación Zod de hábitos
- [x] 13.2 Verificar `docs/data-model.md` — reglas de validación ya documentadas; anotar en informe si no requiere cambios
- [x] 13.3 Verificar que no se modifica `docs/api-spec.yml` (contrato HTTP = T-07-02)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] C.1 Confirmar `tasks.md` completo e informes PASS
- [ ] C.2 Obtener aceptación del usuario
- [ ] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`
- [ ] C.4 `git push -u origin feature/T-07-01-dominio-y-repositorio-de-habitos`
- [ ] C.5 Merge a `develop`
- [ ] C.6 `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-07-01-dominio-y-repositorio-de-habitos/`
- [ ] C.7 `npm run openspec:mark-ticket -- --change t-07-01-dominio-y-repositorio-de-habitos`
