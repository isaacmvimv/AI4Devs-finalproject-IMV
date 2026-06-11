# Tasks — T-09-02 · Caso de uso: bloquear semana anterior y transición semanal

**Ticket:** T-09-02 · **User Story:** US-09 · **Change:** `t-09-02-bloquear-semana-anterior-y-transicion` · **Rama:** `feature/T-09-02-bloquear-semana-anterior-y-transicion`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop` y `git pull origin develop`
- [x] 0.2 Validar rama no existe local: `git branch --list "feature/T-09-02-bloquear-semana-anterior-y-transicion"`
- [x] 0.3 Validar rama no existe remota: `git fetch origin develop` y `git branch -r --list "origin/feature/T-09-02-bloquear-semana-anterior-y-transicion"`
- [x] 0.4 `git checkout -b feature/T-09-02-bloquear-semana-anterior-y-transicion`
- [x] 0.5 `git branch --show-current` → debe mostrar `feature/T-09-02-bloquear-semana-anterior-y-transicion`

## 1. Preparar entorno

- [x] 1.1 Confirmar T-09-01 ✅: `getCurrentWeek.ts`, `WeekRepository`, `prismaWeekRepository.ts`, `domain/week.ts`
- [x] 1.2 Revisar patrón de referencia: `getCurrentWeek.test.ts` (mocks de repositorios)
- [x] 1.3 Revisar `docs/data-model.md` — totales en `Week`, snapshots al bloquear
- [x] 1.4 Confirmar sin cambios de esquema en `backend/prisma/schema.prisma`

## 2. Ampliar puerto WeekRepository (DoD: lockWeek)

- [x] 2.1 Añadir `findUnlockedWeekBefore(userId, beforeStartDate): Promise<WeekWithDetails | null>` en `backend/src/application/ports/WeekRepository.ts`
- [x] 2.2 Añadir `lockWeek(weekId): Promise<Week>` en el mismo puerto

## 3. Implementar lockWeek en Prisma (DoD: transacción + totales + snapshots)

- [x] 3.1 Implementar `findUnlockedWeekBefore` en `backend/src/infrastructure/prismaWeekRepository.ts` — query `isLocked: false`, `startDate < beforeStartDate`, `orderBy startDate desc`, include anidado
- [x] 3.2 Implementar `lockWeek` con `prisma.$transaction`: cargar week + weekHabits + habitEntries + habit maestro
- [x] 3.3 Early return idempotente si `isLocked === true` (DoD: no modifica, no error)
- [x] 3.4 Calcular `totalPointsEarned` = Σ(completados × `habit.pointsPerDay`) y `totalPenalties` = Σ(fallados × `habit.penalty`)
- [x] 3.5 Actualizar cada `WeekHabit` con snapshots definitivos desde `Habit` maestro (`name`, `pointsPerDay`, `penalty`)
- [x] 3.6 Actualizar `Week` con `isLocked: true`, totales calculados
- [x] 3.7 Edge: semana sin entries completados/fallados → totales 0, snapshots igualmente escritos

## 4. Caso de uso lockWeekAndTransition (DoD + US-09 esc. 3)

- [x] 4.1 Crear `backend/src/application/lockWeekAndTransition.ts` — firma `(weekRepo, habitRepo, userId, now?)`
- [x] 4.2 Calcular `startDate` con `getWeekBoundaries(now)`
- [x] 4.3 Si `findUnlockedWeekBefore` retorna semana → `lockWeek(staleWeek.id)`
- [x] 4.4 Delegar en `getCurrentWeek(weekRepo, habitRepo, userId, now)` y retornar resultado
- [x] 4.5 Si no hay semana stale → solo `getCurrentWeek` (sin llamar `lockWeek`)

## 5. Tests unitarios lockWeekAndTransition.test.ts (DoD + US-09 esc. 3–5)

- [x] 5.1 Crear `backend/src/application/lockWeekAndTransition.test.ts` con mocks de `WeekRepository` y `HabitRepository`
- [x] 5.2 Caso transición: semana stale desbloqueada → invoca `lockWeek` + `getCurrentWeek` devuelve semana nueva (US-09 S3)
- [x] 5.3 Caso idempotencia: segunda ejecución sin semana stale → no re-bloquea ni duplica (US-09 S4)
- [x] 5.4 Caso snapshots: tras bloqueo simulado, editar hábito maestro no altera `snapshotPoints` de semana bloqueada (US-09 S5)
- [x] 5.5 Caso edge: semana con solo entries `pending` → totales 0 en mock de `lockWeek`
- [x] 5.6 Caso sin semana anterior: solo delega `getCurrentWeek`

## 6. Tests unitarios → tasks-core §N + tasks-by-type (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 6.1 `npm test -- backend/src/application/lockWeekAndTransition.test.ts`
- [x] 6.2 Informe: `openspec/changes/t-09-02-bloquear-semana-anterior-y-transicion/reports/YYYY-MM-DD-step-06-unit.md` (plantilla `docs/openspec/templates/verification.md`)

## 7. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 7.1 `npm test` — confirmar tests PASS del módulo afectado y suite relevante
- [x] 7.2 `npm run dev:api` — confirmar compilación/arranque sin errores TypeScript
- [x] 7.3 Informe: `openspec/changes/t-09-02-bloquear-semana-anterior-y-transicion/reports/YYYY-MM-DD-step-07-verification.md`

## 8. curl → tasks-core §N+2 (N/A — ticket solo capa aplicación, sin HTTP)

- [x] 8.1 Documentar N/A: sin endpoints nuevos; pruebas HTTP en T-09-03
- [x] 8.2 Informe breve opcional en `reports/YYYY-MM-DD-step-08-curl-na.md` o nota en informe de verificación

## 9. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 9.1 Actualizar `docs/data-model.md` — flujo de bloqueo: cálculo de totales, snapshots definitivos, idempotencia
- [x] 9.2 Verificar alineación con `docs/backend-standards.md` si se documenta patrón transaccional
- [x] 9.3 Informe: `openspec/changes/t-09-02-bloquear-semana-anterior-y-transicion/reports/YYYY-MM-DD-step-09-docs.md`

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] Confirmar `tasks.md` completo e informes PASS
- [ ] Confirmar aceptación del usuario
- [ ] Commit único en feature → push → merge a `develop` → archive → `npm run openspec:mark-ticket -- --change t-09-02-bloquear-semana-anterior-y-transicion`
