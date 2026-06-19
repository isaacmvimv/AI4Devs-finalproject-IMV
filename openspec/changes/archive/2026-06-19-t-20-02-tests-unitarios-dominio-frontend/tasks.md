# Tasks — T-20-02 · Tests unitarios de funciones de dominio frontend

**Ticket:** T-20-02 · **User Story:** US-20 · **Change:** `t-20-02-tests-unitarios-dominio-frontend` · **Rama:** `feature/T-20-02-tests-unitarios-dominio-frontend`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe (local/remoto)
- [x] 0.3 `git checkout -b feature/T-20-02-tests-unitarios-dominio-frontend`
- [x] 0.4 `git branch --show-current`

## 1. Tests edge cases — habit.test.ts

- [x] 1.1 `toggleHabitDayCompletion`: toggle en día pasado verificando recálculo de streak
- [x] 1.2 `calculateHabitStats`: caso todos los días fallados (thisWeekPoints=0, penalties=total)
- [x] 1.3 `calculateHabitStats`: caso con hábitos que tienen streak > 0 para verificar maxStreak
- [x] 1.4 `calculateTodayProgressPercent`: 1 de 3 completados → 33.33
- [x] 1.5 `calculateTodayProgressPercent`: todos completados → 100
- [x] 1.6 `computeStreakFromStatus`: racha de 3 días consecutivos
- [x] 1.7 `computeStreakFromStatus`: interrupción en medio (failed entre completed)
- [x] 1.8 `totalPointsFromStats`: resultado negativo (penalties > points)
- [x] 1.9 `totalPointsFromStats`: resultado cero (penalties == points)

## 2. Revisión — reward.test.ts y week.test.ts

- [x] 2.1 Revisar cobertura de `reward.test.ts` — añadir edge cases solo si cobertura < 80% (cobertura 100%, no requiere cambios)
- [x] 2.2 Revisar cobertura de `week.test.ts` — añadir edge cases solo si cobertura < 80% (cobertura 100%/87.5% branches, no requiere cambios)

## 3. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 3.1 Ejecutar `npm test` — todos los tests pasan sin error (OBLIGATORIO)
- [x] 3.2 Ejecutar `npm test -- --coverage` — cobertura ≥80% en `frontend/src/domain/` (OBLIGATORIO)
- [x] 3.3 Crear informe en `openspec/changes/t-20-02-tests-unitarios-dominio-frontend/reports/2026-06-19-step-03-verification.md`

## 4. curl → tasks-core §N+2 (N/A)

- [x] 4.1 N/A — ticket de testing de dominio frontend, sin endpoints HTTP

## 5. E2E → tasks-core §N+3 (N/A)

- [x] 5.1 N/A — ticket de testing unitario, sin interacción con UI

## 6. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 6.1 Verificar que `docs/frontend-standards.md` sección de testing refleja las convenciones usadas (ya refleja Vitest + co-located tests + dominio)
- [x] 6.2 Actualizar `docs/development_guide.md` si se añaden nuevos scripts de test (no se añadieron scripts nuevos, sin cambios)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
