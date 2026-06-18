# Tasks — T-18-01 · Componentes StatCard y ProgressBar con datos reales de API

**Ticket:** T-18-01 · **User Story:** US-18 · **Change:** `t-18-01-statcard-progressbar-datos-reales` · **Rama:** `feature/T-18-01-statcard-progressbar-datos-reales`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=sí · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe: `git branch --list "feature/T-18-01-statcard-progressbar-datos-reales"` y `git branch -r --list "origin/feature/T-18-01-statcard-progressbar-datos-reales"`
- [x] 0.3 `git checkout -b feature/T-18-01-statcard-progressbar-datos-reales`
- [x] 0.4 `git branch --show-current`

## 1. Verificar y ajustar StatCard

- [x] 1.1 Verificar que `StatCard.tsx` renderiza correctamente los 4 contadores desde `App.tsx` con datos de `stats.*`
- [x] 1.2 Verificar que `lastWeekPoints = 0` se muestra sin error (valor `+0`)
- [x] 1.3 Ajustar formateo si es necesario (ej. no mostrar `+` para penalizaciones negativas — ya funciona con `value >= 0 ? +${value} : value`)

## 2. Verificar y ajustar ProgressBar

- [x] 2.1 Verificar que `ProgressBar.tsx` recibe `todayProgress` desde `App.tsx` y renderiza porcentaje correctamente
- [x] 2.2 Verificar que con 0 hábitos no produce `NaN` (comprobar `calculateTodayProgressPercent` con array vacío)

## 3. Tests unitarios — StatCard.test.tsx

- [x] 3.1 Crear `frontend/src/presentation/components/StatCard.test.tsx`
- [x] 3.2 Test: renderiza valor positivo con prefijo `+` (happy path)
- [x] 3.3 Test: renderiza valor 0 sin error (edge case — lastWeekPoints sin semana anterior)
- [x] 3.4 Test: renderiza valor negativo sin prefijo `+` (penalizaciones)
- [x] 3.5 Test: muestra icono, label y bgColor correctos

## 4. Tests unitarios — ProgressBar.test.tsx

- [x] 4.1 Crear `frontend/src/presentation/components/ProgressBar.test.tsx`
- [x] 4.2 Test: renderiza porcentaje acorde a props (ej. 67%)
- [x] 4.3 Test: renderiza 0% sin NaN cuando progress=0
- [x] 4.4 Test: barra interna tiene width acorde al porcentaje

## 5. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 5.1 `npm test -- --run StatCard.test ProgressBar.test` — todos PASS (EL AGENTE DEBE EJECUTAR)
- [x] 5.2 `npm run dev` — verificar que los 4 StatCards muestran datos reales y ProgressBar se actualiza al hacer toggle
- [x] 5.3 Informe en `openspec/changes/t-18-01-statcard-progressbar-datos-reales/reports/2026-06-18-step-05-verification.md`

## 6. curl → tasks-core §N+2 (N/A)

- [x] 6.1 N/A — ticket solo frontend, sin endpoints modificados

## 7. E2E → tasks-core §N+3 (OBLIGATORIO)

- [x] 7.1 Playwright MCP: navegar a `http://localhost:5173`, verificar 4 StatCards visibles con valores numéricos (EL AGENTE DEBE EJECUTAR)
- [x] 7.2 Playwright MCP: hacer toggle en una celda y verificar que ProgressBar cambia de porcentaje
- [x] 7.3 Informe en `openspec/changes/t-18-01-statcard-progressbar-datos-reales/reports/2026-06-18-step-07-e2e.md`

## 8. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 8.1 Verificar que `frontend-standards.md` ya lista `StatCard.tsx` y `ProgressBar.tsx` en la estructura — sin cambios necesarios

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
