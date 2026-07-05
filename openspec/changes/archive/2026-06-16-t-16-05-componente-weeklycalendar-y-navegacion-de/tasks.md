# Tasks — T-16-05 · Componente WeeklyCalendar y navegación de semanas

**Ticket:** T-16-05 · **User Story:** US-16, US-18 · **Change:** `t-16-05-componente-weeklycalendar-y-navegacion-de` · **Rama:** `feature/T-16-05-componente-weeklycalendar-y-navegacion-de`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=sí · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar que la rama no existe local ni remoto:
  ```bash
  git branch --list "feature/T-16-05-componente-weeklycalendar-y-navegacion-de"
  git branch -r --list "origin/feature/T-16-05-componente-weeklycalendar-y-navegacion-de"
  ```
- [x] 0.3 `git checkout -b feature/T-16-05-componente-weeklycalendar-y-navegacion-de`
- [x] 0.4 `git branch --show-current` (confirmar que muestra la rama correcta)

## 1. Actualizar interfaz de props de WeeklyCalendar

- [x] 1.1 En `frontend/src/presentation/components/WeeklyCalendar.tsx`, reemplazar la interfaz de props por:
  ```typescript
  interface WeeklyCalendarProps {
    weekOffset: number        // 0 = semana actual; negativo = semanas pasadas
    isWeekLocked: boolean
    onWeekNav: (delta: number) => void
  }
  ```
- [x] 1.2 Calcular internamente `weekDates` y `weekRange` a partir de `weekOffset` usando `date-fns` (funciones `startOfWeek`, `addDays`, `addWeeks`, `format`).
- [x] 1.3 Calcular `todayIndex` internamente siguiendo el estándar T-16-03:
  ```typescript
  const todayIndex = (() => {
    const day = new Date().getDay()
    return day === 0 ? 6 : day - 1
  })()
  ```

## 2. Implementar controles de navegación según DoD

- [x] 2.1 Botón "‹" llama a `onWeekNav(-1)`. (DoD: "Botón ‹ llama a `handleWeekNav(offset-1)`")
- [x] 2.2 Botón "›" llama a `onWeekNav(+1)` y tiene `disabled` cuando `weekOffset === 0`. (DoD: "Botón › se deshabilita cuando `weekOffset=0`")
- [x] 2.3 Badge "Semana bloqueada 🔒" visible solo cuando `isWeekLocked === true`. (DoD: "Badge `Semana bloqueada 🔒` visible cuando `isWeekLocked=true`")
- [x] 2.4 El día actual recibe estilos `ring-2 ring-blue-400` solo cuando `weekOffset === 0` e `index === todayIndex`. (DoD: "El día actual tiene estilos destacados cuando se visualiza la semana actual")

## 3. Crear tests unitarios (WeeklyCalendar.test.tsx)

- [x] 3.1 Crear `frontend/src/presentation/components/WeeklyCalendar.test.tsx` con `// @vitest-environment jsdom` como primera línea.
- [x] 3.2 Test: clic en "‹" invoca `onWeekNav(-1)`.
- [x] 3.3 Test: clic en "›" invoca `onWeekNav(+1)`.
- [x] 3.4 Test: "›" tiene `disabled` cuando `weekOffset === 0`.
- [x] 3.5 Test: "›" NO tiene `disabled` cuando `weekOffset === -1`.
- [x] 3.6 Test: badge "Semana bloqueada 🔒" visible cuando `isWeekLocked=true`.
- [x] 3.7 Test: badge no visible cuando `isWeekLocked=false`.

## 4. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 4.1 Ejecutar tests del componente:
  ```bash
  npm run test -- WeeklyCalendar
  ```
- [x] 4.2 Typecheck:
  ```bash
  npx tsc --noEmit
  ```
- [x] 4.3 Build sin errores:
  ```bash
  npm run build
  ```
- [x] 4.4 Crear informe en `openspec/changes/t-16-05-componente-weeklycalendar-y-navegacion-de/reports/YYYY-MM-DD-step-04-verification.md`

## 5. curl → tasks-core §N+2 — N/A

Este ticket no toca endpoints HTTP. No se ejecutan curls.

## 6. E2E → tasks-core §N+3 (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 6.1 Arrancar frontend: `npm run dev` (en otra terminal o background)
- [x] 6.2 Con Playwright MCP, navegar a `http://localhost:5173`
- [x] 6.3 Verificar que los botones "‹" y "›" son visibles en el calendario semanal
- [x] 6.4 Verificar que "›" está deshabilitado en la semana actual
- [x] 6.5 Clicar "‹" y verificar que la semana cambia (rango de fechas actualizado)
- [x] 6.6 Verificar que "›" se habilita al navegar a una semana pasada
- [x] 6.7 Crear informe en `openspec/changes/t-16-05-componente-weeklycalendar-y-navegacion-de/reports/YYYY-MM-DD-step-06-e2e.md`

> **Nota:** el E2E puede requerir que `CalendarSection.tsx` pase las nuevas props `weekOffset` e `isWeekLocked`. Si `CalendarSection` no está actualizado, verificar el componente de forma aislada con un harness temporal o documentar la limitación en el informe y diferir la integración a T-16-06.

## 7. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 7.1 Actualizar `docs/frontend-standards.md` si la nueva interfaz de props del componente establece un nuevo patrón (por analogía con el patrón T-16-03 ya documentado).
- [x] 7.2 Si no hay nuevo patrón que documentar, registrar "N/A — sin cambio en standards" en el informe de verificación.

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)

Ver `docs/openspec/tasks-core.md §Cierre` para la secuencia completa de commit, push y merge.
