# Tasks — T-13-02 · Implementar funciones puras del dominio: recompensas y semanas



**Ticket:** T-13-02 · **User Story:** US-13 · **Change:** `t-13-02-recompensas-y-semanas` · **Rama:** `feature/T-13-02-recompensas-y-semanas`

**Pasos aplicables:** unit=sí · curl=N/A · e2e=N/A · docs=según impacto



## 0. Setup → tasks-core §0 (OBLIGATORIO)



- [x] 0.1 `git checkout develop && git pull origin develop`

- [x] 0.2 Validar que no existe la rama `feature/T-13-02-recompensas-y-semanas` (local ni `origin/`)

- [x] 0.3 `git checkout -b feature/T-13-02-recompensas-y-semanas`

- [x] 0.4 `git branch --show-current` confirma la rama feature



## 1. Dominio recompensas (`frontend/src/domain/reward.ts`)



- [x] 1.1 Verificar/exportar interfaz `Reward` (`id`, `emoji`, `name`, `description`, `cost`)

- [x] 1.2 Añadir y exportar `RewardFormInput` (`emoji`, `name`, `description`, `cost`)

- [x] 1.3 Actualizar `createRewardFromFormInput(input: RewardFormInput, id: string)` para usar el tipo explícito

- [x] 1.4 Verificar que el módulo no importa React, fetch ni capas externas



## 2. Dominio semanas (`frontend/src/domain/week.ts`)



- [x] 2.1 Verificar tipos exportados `WeekDayLabel` y `WeekData`

- [x] 2.2 Verificar `buildWeekData(weekOffset, now?)`: 7 días Lun–Dom, fechas coherentes, `range` con mes en español

- [x] 2.3 Verificar `getCurrentDayIndexForWeek(weekOffset, now?)`: 0–6 si `weekOffset===0`; `-1` si no es semana actual

- [x] 2.4 Corregir solo si los tests (§3) revelan incumplimiento del spec



## 3. Tests unitarios



- [x] 3.1 Crear `frontend/src/domain/reward.test.ts`: mapeo `RewardFormInput → Reward` (happy path tabla ticket)

- [x] 3.2 Crear `frontend/src/domain/week.test.ts`: `buildWeekData(0)` con `now` fijo (miércoles 11 jun 2026) — 7 etiquetas y fechas

- [x] 3.3 `week.test.ts`: edge `buildWeekData(-1)` semana anterior

- [x] 3.4 `week.test.ts`: edge semana que cruza meses (opcional según spec)

- [x] 3.5 `week.test.ts`: `getCurrentDayIndexForWeek(0, now)` → índice 0–6 según día mockeado

- [x] 3.6 `week.test.ts`: `getCurrentDayIndexForWeek` con `weekOffset !== 0` → `-1`



## 4. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)



- [x] 4.1 Ejecutar tests focalizados: `npm test -- frontend/src/domain/reward.test.ts frontend/src/domain/week.test.ts` (EL AGENTE DEBE EJECUTAR)

- [x] 4.2 Ejecutar suite dominio: `npm test -- frontend/src/domain`

- [x] 4.3 Verificar compilación TypeScript: `npm run build` en frontend o `npm run dev` sin errores

- [x] 4.4 Crear informe PASS en `openspec/changes/t-13-02-recompensas-y-semanas/reports/YYYY-MM-DD-step-04-verification.md`



## 5. curl → tasks-core §N+2 (N/A)



- [x] 5.1 Documentar N/A: ticket solo dominio frontend puro, sin endpoints HTTP nuevos ni modificados



## 6. E2E → tasks-core §N+3 (N/A)



- [x] 6.1 Documentar N/A: ticket no altera UI ni flujos de usuario; validación vía tests unitarios



## 7. Documentación → tasks-core §N+4 (OBLIGATORIO)



- [x] 7.1 Revisar `frontend/src/domain/README.md`; actualizar solo si la lista de módulos exportados difiere

- [x] 7.2 No modificar `api-spec.yml`, `data-model.md` ni backend (fuera de alcance)



## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)



- [x] Confirmar `tasks.md` completo e informes PASS

- [x] Confirmar aceptación del usuario

- [x] Commit único en feature (viñetas) — solo en `/opsx:archive`

- [x] Push y merge a `develop` — solo en `/opsx:archive`

- [x] Archivar change y `npm run openspec:mark-ticket -- --change t-13-02-recompensas-y-semanas`

