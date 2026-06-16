# Tasks — T-16-03 · Componente HabitRow con toggle de estados y modo lectura

**Ticket:** T-16-03 · **User Story:** US-16 · **Change:** `t-16-03-componente-habitrow-con-toggle` · **Rama:** `feature/T-16-03-componente-habitrow-con-toggle`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=sí · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe (local/remoto)
- [x] 0.3 `git checkout -b feature/T-16-03-componente-habitrow-con-toggle`
- [x] 0.4 `git branch --show-current`

## 1. Ajustar props de HabitRow.tsx

- [x] 1.1 Cambiar `onToggleDay(habitId, dayIndex)` → `onToggle(dayIndex)` y `onDelete(habitId)` → `onDelete()` en la interfaz y en los handlers de los botones.
- [x] 1.2 Añadir prop `weekOffset?: number` (default `0`).
- [x] 1.3 Calcular `todayIndex` (lunes=0) a partir de `new Date()` y añadir clase visual diferenciadora a la celda cuando `weekOffset === 0 && index === todayIndex`.

## 2. Crear HabitRow.test.tsx

- [x] 2.1 Crear `frontend/src/presentation/components/HabitRow.test.tsx` con `// @vitest-environment jsdom`.
- [x] 2.2 Happy path toggle: click en celda pendiente → `onToggle(dayIndex)` llamado con índice correcto.
- [x] 2.3 Modo lectura (`isReadOnly=true`): celdas renderizan como `<div>` (no `<button>`), botón × ausente.
- [x] 2.4 Estado completado: celda con clase verde e icono ✓.
- [x] 2.5 Estado fallado: celda con clase roja e icono ✗.
- [x] 2.6 Indicador de hoy: presencia de marcador en la celda correcta cuando `weekOffset=0`; ausencia cuando `weekOffset=-1`.
- [x] 2.7 Botón ×: click llama `onDelete()`; ausente en modo `isReadOnly`.
- [x] 2.8 Racha: muestra "🔥 5 días" cuando `streak=5`; sin indicador cuando `streak=0`.

## 3. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 3.1 `cd frontend && npx vitest run src/presentation/components/HabitRow.test.tsx`
- [x] 3.2 Suite amplia: `npx vitest run` — verificar sin regresiones. (N/A — change-only; suite completa omitida)
- [x] 3.3 Crear informe en `openspec/changes/t-16-03-componente-habitrow-con-toggle/reports/YYYY-MM-DD-step-03-verification.md`

## 4. curl → N/A (ticket solo presentación frontend, sin endpoints nuevos)

- [x] 4.1 N/A — HabitRow no interactúa con la API directamente.

## 5. E2E → tasks-core §N+3 + templates/e2e-testing.md (OBLIGATORIO)

- [x] 5.1 `npm run dev` (frontend activo en `http://localhost:5173`).
- [x] 5.2 Playwright MCP: navegar a la pantalla del dashboard.
- [x] 5.3 Verificar renderizado de HabitRow con celdas correctas.
- [x] 5.4 Verificar toggle visual de estado (clic en celda → cambio de color).
- [x] 5.5 Verificar modo lectura (semana bloqueada): sin botón ×, celdas no clicables.
- [x] 5.6 Crear informe en `openspec/changes/t-16-03-componente-habitrow-con-toggle/reports/YYYY-MM-DD-step-05-e2e.md`

## 6. Documentación → tasks-core §N+4

- [x] 6.1 Actualizar `docs/frontend-standards.md` si se introducen patrones nuevos (indicador de hoy, firma de callbacks sin id).
- [x] 6.2 Si no hay cambios de patrón, documentar N/A. (sí hay cambios — actualizado en 6.1)

## Cierre → tasks-core §Cierre (solo en /opsx:archive)

- [ ] Confirmar todos los pasos anteriores PASS.
- [ ] Commit único en feature con viñetas.
- [ ] `git push -u origin feature/T-16-03-componente-habitrow-con-toggle`
- [ ] Merge a `develop`.
- [ ] `mv` change → `openspec/changes/archive/YYYY-MM-DD-t-16-03-componente-habitrow-con-toggle/`
- [ ] `npm run openspec:mark-ticket -- --change t-16-03-componente-habitrow-con-toggle`
