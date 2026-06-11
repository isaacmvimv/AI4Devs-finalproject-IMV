# Tasks — T-09-01 · Caso de uso: detectar semana actual y crear si no existe

**Ticket:** T-09-01 · **User Story:** US-09 · **Change:** `t-09-01-detectar-semana-actual-y-crear` · **Rama:** `feature/T-09-01-detectar-semana-actual-y-crear`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-09-01-detectar-semana-actual-y-crear"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-09-01-detectar-semana-actual-y-crear"`
- [x] 0.4 `git checkout -b feature/T-09-01-detectar-semana-actual-y-crear`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-09-01-detectar-semana-actual-y-crear`

## 1. Preparar entorno

- [x] 1.1 Confirmar modelos `Week`, `WeekHabit`, `HabitEntry` en `backend/prisma/schema.prisma` (T-03-02 ✅) — sin cambios de esquema
- [x] 1.2 Confirmar `HabitRepository.findActiveByUserId` en T-07-01 ✅
- [x] 1.3 Revisar patrón de referencia: `createHabit.ts`, `prismaHabitRepository.ts`, `createHabit.test.ts`
- [x] 1.4 Revisar flujo análogo en `backend/prisma/seed.ts` (creación semana + entries) como referencia de snapshots y `dayIndex`
- [x] 1.5 Verificar que no existen archivos `*week*` en `backend/src/` (greenfield acotado)

## 2. Utilidad getWeekBoundaries (DoD: función en dominio)

- [x] 2.1 Crear `backend/src/domain/week.ts` con tipos `Week`, `WeekHabit`, `HabitEntry`, `CompletionStatus`, `WeekWithDetails`
- [x] 2.2 Implementar `getWeekBoundaries(date): { startDate, endDate }` — lunes 00:00 UTC → domingo 23:59:59.999 UTC (ISO week)
- [x] 2.3 Exportar tipos y función desde el módulo de dominio

## 3. Puerto WeekRepository (DoD: findCurrentWeek, createWeek)

- [x] 3.1 Crear `backend/src/application/ports/WeekRepository.ts`
- [x] 3.2 Definir `findCurrentWeek(userId, startDate): Promise<WeekWithDetails | null>`
- [x] 3.3 Definir `createWeekWithHabitsAndEntries(userId, startDate, endDate, activeHabits): Promise<WeekWithDetails>` (transacción atómica según design.md)

## 4. Puerto WeekHabitRepository (DoD: createWeekHabits)

- [x] 4.1 Crear `backend/src/application/ports/WeekHabitRepository.ts`
- [x] 4.2 Definir `createWeekHabits(weekId, activeHabits[]): Promise<WeekHabit[]>` con snapshots del hábito maestro

## 5. Repositorios Prisma (DoD: transacción atómica)

- [x] 5.1 Crear `backend/src/infrastructure/prismaWeekRepository.ts` con factory `createPrismaWeekRepository(prisma)`
- [x] 5.2 Implementar `findCurrentWeek` — query por `userId` + `startDate`, `include` weekHabits + habitEntries
- [x] 5.3 Implementar `createWeekWithHabitsAndEntries` — `prisma.$transaction`: crear Week, WeekHabits (snapshots + order), 7 HabitEntry `pending` por hábito
- [x] 5.4 Crear `backend/src/infrastructure/prismaWeekHabitRepository.ts` — lógica de `createWeekHabits` reutilizable dentro de la transacción del paso 5.3
- [x] 5.5 Mapear filas Prisma a tipos de dominio (patrón `mapToHabit`)

## 6. Caso de uso getCurrentWeek (DoD + US-09 esc. 1–2)

- [x] 6.1 Crear `backend/src/application/getCurrentWeek.ts` — firma `(weekRepo, habitRepo, userId, now?)`
- [x] 6.2 Calcular `{ startDate, endDate } = getWeekBoundaries(now)`
- [x] 6.3 Si `findCurrentWeek` retorna semana → devolver sin crear (US-09 S2)
- [x] 6.4 Si no existe → `findActiveByUserId` + `createWeekWithHabitsAndEntries` (US-09 S1)
- [x] 6.5 Edge: sin hábitos activos → crear Week vacía (sin WeekHabits)

## 7. Tests unitarios getWeekBoundaries.test.ts (DoD + edge mes/año)

- [x] 7.1 Crear `backend/src/domain/getWeekBoundaries.test.ts`
- [x] 7.2 Caso: lunes en semana normal → boundaries correctos UTC
- [x] 7.3 Caso: domingo → misma semana ISO (lunes anterior)
- [x] 7.4 Caso edge: cambio de mes
- [x] 7.5 Caso edge: cambio de año

## 8. Tests unitarios getCurrentWeek.test.ts (DoD + US-09 esc. 1–2)

- [x] 8.1 Crear `backend/src/application/getCurrentWeek.test.ts` con mocks de `WeekRepository` y `HabitRepository`
- [x] 8.2 Caso happy path: sin week en BD → crea Week + WeekHabits + 7×pending por hábito activo (US-09 S1)
- [x] 8.3 Caso: semana existente → retorna misma week, no invoca create (US-09 S2)
- [x] 8.4 Caso edge: sin hábitos activos → week sin WeekHabits
- [x] 8.5 Caso atomicidad: mock de create que lanza error → error propagado (rollback documentado)

## 9. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 9.1 `npm test -- backend/src/domain/getWeekBoundaries.test.ts backend/src/application/getCurrentWeek.test.ts`
- [x] 9.2 Informe: `openspec/changes/t-09-01-detectar-semana-actual-y-crear/reports/YYYY-MM-DD-step-09-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 10. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 10.1 `npm test` — confirmar tests PASS del módulo afectado
- [x] 10.2 `npm run dev:api` — confirmar compilación/arranque sin errores TypeScript
- [x] 10.3 Informe: `openspec/changes/t-09-01-detectar-semana-actual-y-crear/reports/YYYY-MM-DD-step-10-verification.md`

## 11. curl → tasks-core §N+2 (N/A — ticket solo dominio/aplicación, sin endpoints HTTP)

- [x] 11.1 Documentar N/A: no hay rutas `/api/weeks/*` en este ticket (T-09-03); sin informe curl

## 12. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 12.1 Verificar `docs/data-model.md` — reglas de semana UTC y 7 entries; actualizar solo si falta mención a `getWeekBoundaries`
- [x] 12.2 Verificar `docs/backend-standards.md` — añadir snippets de puertos/caso de uso si la sección de semanas está vacía
- [x] 12.3 Informe: `openspec/changes/t-09-01-detectar-semana-actual-y-crear/reports/YYYY-MM-DD-step-12-docs.md`

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [ ] C.1 Confirmar `tasks.md` completo e informes PASS
- [ ] C.2 Confirmar aceptación del usuario
- [ ] C.3 Commit único en feature (viñetas) — solo en `/opsx:archive`
- [ ] C.4 Push y merge a `develop` — solo en `/opsx:archive`
- [ ] C.5 `npm run openspec:mark-ticket -- --change t-09-01-detectar-semana-actual-y-crear`
