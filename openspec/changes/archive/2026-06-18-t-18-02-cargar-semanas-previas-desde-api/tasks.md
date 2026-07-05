# Tasks — T-18-02 · Integrar historial: cargar semanas previas desde API en WeeklyCalendar

**Ticket:** T-18-02 · **User Story:** US-18 · **Change:** `t-18-02-cargar-semanas-previas-desde-api` · **Rama:** `feature/T-18-02-cargar-semanas-previas-desde-api`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=sí · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe: `git branch --list "feature/T-18-02-cargar-semanas-previas-desde-api"` y `git branch -r --list "origin/feature/T-18-02-cargar-semanas-previas-desde-api"`
- [x] 0.3 `git checkout -b feature/T-18-02-cargar-semanas-previas-desde-api`
- [x] 0.4 `git branch --show-current`

## 1. Estado de carga y manejo 404 en useHabitDashboard

- [x] 1.1 Añadir estados `weekLoading` (boolean) y `canGoBack` (boolean, default `true`) en `useHabitDashboard.ts`
- [x] 1.2 En `handleWeekNav`: activar `weekLoading=true` al inicio, desactivar en `finally`
- [x] 1.3 Detectar error 404 de `fetchWeekByOffset` → `setCanGoBack(false)`, revertir `weekOffset` al valor anterior, sin toast de error
- [x] 1.4 En navegación exitosa → `setCanGoBack(true)`; al navegar hacia adelante → restaurar `canGoBack=true`
- [x] 1.5 Exponer `weekLoading` y `canGoBack` en el return del hook

## 2. Skeleton en CalendarSection

- [x] 2.1 En `CalendarSection.tsx`, añadir prop `weekLoading: boolean`
- [x] 2.2 Cuando `weekLoading=true`, renderizar skeleton animado (`animate-pulse bg-gray-200 rounded`) en lugar de los `HabitRow`s (3-4 filas placeholder)
- [x] 2.3 Mantener visible `WeeklyCalendar` (cabecera) durante la carga

## 3. Deshabilitar navegación en WeeklyCalendar

- [x] 3.1 Añadir props `canGoBack: boolean` y `loading: boolean` a `WeeklyCalendarProps`
- [x] 3.2 Deshabilitar botón "‹" cuando `!canGoBack || loading`
- [x] 3.3 Deshabilitar botón "›" cuando `weekOffset === 0 || loading`

## 4. Integración en App.tsx

- [x] 4.1 Pasar `weekLoading` y `canGoBack` desde el hook a `CalendarSection` y `WeeklyCalendar`

## 5. Tests unitarios → tasks-by-type §N (OBLIGATORIO)

- [x] 5.1 Ampliar `useHabitDashboard.test.ts`: test que `weekLoading` cambia a `true` durante `handleWeekNav` y vuelve a `false`
- [x] 5.2 Test que 404 en `fetchWeekByOffset` → `canGoBack=false` y `weekOffset` revierte
- [x] 5.3 Test de race condition: dos navegaciones rápidas, solo la última aplica

## 6. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 6.1 `npm run dev` — comprobar compilación sin errores (typecheck frontend PASS)
- [x] 6.2 `npm test` — suite de tests relevantes pasa (10/10, change-only)
- [x] 6.3 Informe en `openspec/changes/t-18-02-cargar-semanas-previas-desde-api/reports/2026-06-18-step-06-verification.md`

## 7. curl → N/A

Ticket solo frontend, no altera endpoints API.

## 8. E2E → tasks-core §N+3 + templates/e2e-testing.md (OBLIGATORIO)

- [x] 8.1 Servidor frontend + backend activos (`npm run dev`, `npm run dev:api`)
- [x] 8.2 Navegar a semana anterior: verificar skeleton aparece, datos históricos se cargan, badge "Semana bloqueada 🔒" visible
- [x] 8.3 Navegar hasta que no haya más semanas: verificar botón "‹" deshabilitado
- [x] 8.4 Volver a semana actual: celdas interactivas, badge desaparece, botones de añadir visibles
- [x] 8.5 Informe en `openspec/changes/t-18-02-cargar-semanas-previas-desde-api/reports/2026-06-18-step-08-e2e-testing.md`

## 9. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 9.1 Actualizar `docs/frontend-standards.md` si hay cambios significativos en patrones de carga/skeleton (N/A — skeleton usa animate-pulse estándar de Tailwind, sin patrón nuevo significativo)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
