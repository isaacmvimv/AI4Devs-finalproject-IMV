# Proposal — T-15-01 · Integración final del Dashboard: App.tsx completo

**Ticket:** T-15-01 · **User Story:** US-15 · **Sprint:** 4 — UI Estadísticas, Historial y Dashboard Final

## Why

`App.tsx` ya integra todos los componentes principales (Header, UserProfileCard, ProgressBar, StatCards, WeeklyCalendar, HabitRow, RewardCard y modales), pero carece de estados vacíos, skeletons de carga inicial y manejo de errores parciales. El usuario ve contenido en blanco o errores silenciosos cuando no tiene datos o la API falla parcialmente. Este ticket completa la experiencia del dashboard como pantalla principal de la app.

## What Changes

- Añadir **estado vacío de hábitos**: placeholder "Añade tu primer hábito" con CTA "+ Nuevo hábito" cuando `habits` esté vacío.
- Añadir **estado vacío de recompensas**: placeholder "Crea tu primera recompensa" cuando `rewards` esté vacío.
- Añadir **skeletons de carga global**: mientras la API no ha respondido en la carga inicial, mostrar skeletons en cada sección (stats, calendario, recompensas), no pantalla en blanco.
- Asegurar que el **Toaster de Sonner** esté activo para mensajes de error/éxito de toda la app (ya presente, verificar).
- Gestionar **errores parciales**: si un endpoint falla (p. ej. recompensas) pero otro funciona (hábitos), mostrar error no intrusivo en la sección afectada sin romper las demás.
- Validar que `npm run build` compila sin errores TypeScript.

## Non-goals

- No se implementan tests unitarios (el ticket lo excluye explícitamente).
- No se añaden nuevas rutas ni sub-vistas.
- No se modifica la lógica de negocio de hábitos, recompensas ni estadísticas.
- No se tocan endpoints del backend ni el data model.

## Capabilities

### New Capabilities
- `dashboard-empty-states`: Placeholders y CTAs cuando no hay hábitos o recompensas.
- `dashboard-loading-skeletons`: Skeletons de carga global para todas las secciones del dashboard.
- `dashboard-partial-error`: Manejo de errores parciales por sección sin afectar al resto del dashboard.

### Modified Capabilities
_(ninguna — no se modifican requisitos de capabilities existentes)_

## Impact

- **Código afectado:** `frontend/src/presentation/App.tsx`, componentes layout (`CalendarSection`, `RewardsSection`, `StatsSection`), posiblemente `AppLayout.tsx`.
- **Hook:** `useHabitDashboard` — exponer `loading` y `error` (ya existentes pero no consumidos en App.tsx).
- **APIs / dependencias:** Sin cambios. Solo consumo de estados ya expuestos.
- **Build:** Verificar `npm run build` sin errores TS.

## Acceptance Criteria (de US-15)

Los escenarios Gherkin de la US-15 aplican directamente:
1. **Happy path** — dashboard carga con todas las secciones visibles.
2. **Estado vacío sin hábitos** — placeholder + CTA + ProgressBar 0% + StatCards en 0.
3. **Estado de carga** — skeletons en cada sección.
4. **Error parcial** — sección con error muestra mensaje, el resto funciona.
