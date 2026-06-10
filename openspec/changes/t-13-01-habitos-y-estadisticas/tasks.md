# Tasks — T-13-01 · Implementar funciones puras del dominio: hábitos y estadísticas

**Ticket:** T-13-01 · **User Story:** US-13 · **Change:** `t-13-01-habitos-y-estadisticas` · **Rama:** `feature/T-13-01-habitos-y-estadisticas`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=N/A · docs=según impacto

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar que no existe la rama `feature/T-13-01-habitos-y-estadisticas` (local ni `origin/`)
- [x] 0.3 `git checkout -b feature/T-13-01-habitos-y-estadisticas`
- [x] 0.4 `git branch --show-current` confirma la rama feature

## 1. Tipos del dominio

- [x] 1.1 Exportar `CompletionStatus`, `Habit`, `HabitStats` en `frontend/src/domain/habit.ts` (verificar/alinear con spec)
- [x] 1.2 Añadir y exportar interfaz `HabitFormInput` (`emoji`, `name`, `pointsPerDay`, `penalty`)
- [x] 1.3 Actualizar `createHabitFromFormInput` para usar `HabitFormInput` como tipo del primer argumento

## 2. Funciones puras — implementación y alineación US-13

- [x] 2.1 `toggleHabitDayCompletion`: ciclo pending→completed→failed→pending; guard `dayIndex` fuera de 0–6 devuelve hábito sin cambios; inmutabilidad
- [x] 2.2 `computeStreakFromStatus(statuses, currentDayIndex)`: racha hacia atrás desde `currentDayIndex`; 0 si índice inválido o todos pending
- [x] 2.3 Integrar nueva firma de racha en `toggleHabitDayCompletion` (recalcular `streak` tras toggle)
- [x] 2.4 `calculateHabitStats`: sumar `pointsPerDay`×completed y `penalty`×failed; `maxStreak` = max de `habit.streak`; `lastWeekPoints=0`; array vacío → ceros sin throw
- [x] 2.5 `calculateTodayProgressPercent`: decimal con 2 decimales (p. ej. 66.67); 0 hábitos → 0%
- [x] 2.6 `totalPointsFromStats`: `thisWeekPoints + lastWeekPoints - penalties`
- [x] 2.7 Verificar que ninguna función importa React, fetch ni módulos de `application/`, `infrastructure/` o `presentation/`

## 3. Tests unitarios (`frontend/src/domain/habit.test.ts`)

- [x] 3.1 Crear `habit.test.ts` con helper local para construir `Habit` de prueba
- [x] 3.2 `toggleHabitDayCompletion`: happy path US-13 S1 (3 toggles) + edge `dayIndex` fuera de rango
- [x] 3.3 `calculateHabitStats`: happy path US-13 S2 + edge `habits=[]` US-13 S5
- [x] 3.4 `calculateTodayProgressPercent`: happy path US-13 S3 (66.67) + edge 0 hábitos
- [x] 3.5 `computeStreakFromStatus`: happy path US-13 S4 + edge todos pending
- [x] 3.6 `createHabitFromFormInput`: 7× pending, streak 0
- [x] 3.7 `totalPointsFromStats`: caso con penalizaciones

## 4. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 4.1 Ejecutar tests focalizados: `npm test -- frontend/src/domain/habit.test.ts` (EL AGENTE DEBE EJECUTAR)
- [x] 4.2 Ejecutar suite frontend/domain si existe: `npm test -- frontend/src/domain`
- [x] 4.3 Verificar compilación: `npm run dev` o build del frontend sin errores TypeScript
- [x] 4.4 Crear informe PASS en `openspec/changes/t-13-01-habitos-y-estadisticas/reports/2026-06-10-step-04-verification.md`

## 5. curl → tasks-core §N+2 (N/A)

- [x] 5.1 Documentar N/A: ticket solo dominio frontend puro, sin endpoints HTTP nuevos ni modificados

## 6. E2E → tasks-core §N+3 (N/A)

- [x] 6.1 Documentar N/A: ticket no altera UI ni flujos de usuario; validación vía tests unitarios

## 7. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 7.1 Revisar `frontend/src/domain/README.md`; actualizar solo si la lista de funciones exportadas difiere del estado final
- [x] 7.2 No modificar `api-spec.yml`, `data-model.md` ni backend (fuera de alcance)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

- [x] Confirmar `tasks.md` completo e informes PASS
- [x] Confirmar aceptación del usuario
- [x] Commit único en feature (viñetas) — solo en `/opsx:archive`
- [x] Push y merge a `develop` — solo en `/opsx:archive`
- [x] Archivar change y `npm run openspec:mark-ticket -- --change t-13-01-habitos-y-estadisticas`
