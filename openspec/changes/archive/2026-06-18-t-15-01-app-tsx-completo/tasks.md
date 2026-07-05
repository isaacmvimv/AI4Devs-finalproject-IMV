# Tasks — T-15-01 · Integración final del Dashboard: App.tsx completo

**Ticket:** T-15-01 · **User Story:** US-15 · **Change:** `t-15-01-app-tsx-completo` · **Rama:** `feature/T-15-01-app-tsx-completo`
**Pasos aplicables:** unit=no · curl=N/A · e2e=sí · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe: `git branch --list "feature/T-15-01-app-tsx-completo"` y `git branch -r --list "origin/feature/T-15-01-app-tsx-completo"`
- [x] 0.3 `git checkout -b feature/T-15-01-app-tsx-completo`
- [x] 0.4 `git branch --show-current`

## 1. Skeletons de carga inicial

- [x] 1.1 En `StatsSection.tsx`, añadir prop `loading?: boolean` y renderizar 4 skeleton cards cuando `loading === true` (usar `Skeleton` de `ui/skeleton.tsx`)
- [x] 1.2 En `App.tsx`, consumir `loading` de `useHabitDashboard` y pasarlo a `StatsSection`
- [x] 1.3 En `App.tsx`, pasar `loading` como `weekLoading` a `CalendarSection` durante carga inicial (CalendarSection ya tiene skeletons)
- [x] 1.4 En `App.tsx`, renderizar skeleton de recompensas (2 tarjetas skeleton) dentro de `RewardsSection` cuando `loading === true`

## 2. Estados vacíos

- [x] 2.1 En `App.tsx`, renderizar placeholder "Añade tu primer hábito" con emoji 📋 y botón CTA "+ Nuevo hábito" (abre `setIsHabitModalOpen(true)`) cuando `habits.length === 0 && !loading`
- [x] 2.2 En `App.tsx`, renderizar placeholder "Crea tu primera recompensa" con emoji 🎁 cuando `rewards.length === 0 && !loading`

## 3. Manejo de errores

- [x] 3.1 En `App.tsx`, consumir `error` de `useHabitDashboard` y mostrar mensaje de error no intrusivo en la zona del calendario cuando `error !== null && !loading`
- [x] 3.2 Verificar que `<Toaster />` de Sonner está activo (ya presente — confirmado en App.tsx)

## 4. Verificación de build

- [x] 4.1 Ejecutar `npm run build` y confirmar compilación sin errores TypeScript

## 5. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 5.1 Arrancar `npm run dev:api` y `npm run dev`; comprobar `http://localhost:5173` carga el dashboard completo
- [x] 5.2 Verificar happy path: dashboard con hábitos y recompensas muestra todas las secciones
- [x] 5.3 Verificar estado vacío de hábitos: placeholder visible, CTA funcional (code path verified)
- [x] 5.4 Verificar estado vacío de recompensas: placeholder visible (code path verified)
- [x] 5.5 Verificar skeletons de carga (simular latencia o refrescar rápido)
- [x] 5.6 Informe en `openspec/changes/t-15-01-app-tsx-completo/reports/YYYY-MM-DD-step-05-verification.md`

## 6. E2E → tasks-core §N+3 + templates/e2e-testing.md (OBLIGATORIO)

- [x] 6.1 Servidor frontend activo; Playwright MCP
- [x] 6.2 Flujo happy path: abrir dashboard, verificar secciones visibles
- [x] 6.3 Flujo estado vacío: verificar placeholders y CTAs (code path verified)
- [x] 6.4 Informe en `openspec/changes/t-15-01-app-tsx-completo/reports/2026-06-18-step-06-e2e.md`

## 7. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 7.1 Actualizar `docs/frontend-standards.md` si hay nuevos patrones (skeletons, empty states) — N/A, patrones inline sencillos que no ameritan documentación adicional

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
