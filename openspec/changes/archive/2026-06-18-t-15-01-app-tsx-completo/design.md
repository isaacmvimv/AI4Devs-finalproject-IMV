# Design — T-15-01 · Integración final del Dashboard: App.tsx completo

## Context

`App.tsx` ya integra todos los componentes del dashboard: Header, UserProfileCard, ProgressBar, 4 StatCards, WeeklyCalendar con HabitRows, RewardCards y modales (AddHabitModal, AddRewardModal). También incluye `<Toaster />` de Sonner y componentes layout (AppLayout, StatsSection, CalendarSection, RewardsSection).

El hook `useHabitDashboard` ya expone `loading` y `error` pero App.tsx no los consume. Los estados vacíos (sin hábitos, sin recompensas) no tienen tratamiento visual. CalendarSection ya tiene skeletons para `weekLoading` pero no para la carga inicial global.

## Goals / Non-Goals

**Goals:**
- Consumir `loading` y `error` de `useHabitDashboard` en App.tsx para manejar carga inicial y errores.
- Renderizar estados vacíos cuando `habits.length === 0` o `rewards.length === 0`.
- Mostrar skeletons en todas las secciones durante `loading === true`.
- Manejar errores parciales mostrando mensaje en la sección afectada.

**Non-Goals:**
- No se crean tests unitarios (excluido por el ticket).
- No se modifica la lógica de negocio ni los hooks existentes.
- No se tocan endpoints del backend.

## Decisions

### D1 — Skeletons de carga inicial en App.tsx

**Decisión:** Cuando `loading === true`, App.tsx renderiza skeletons inline en StatsSection (4 StatCard skeletons), CalendarSection (ya tiene skeletons vía `weekLoading`) y RewardsSection (2 tarjetas skeleton). Se reutiliza el componente `Skeleton` de `ui/skeleton.tsx` ya disponible en el proyecto.

**Alternativa descartada:** Crear un componente `DashboardSkeleton` separado — innecesario para un solo punto de uso.

**Implementación:** Pasar `loading` como condición al renderizar cada sección. En StatsSection, renderizar 4 divs con `Skeleton` en lugar de StatCards. En RewardsSection, renderizar 2 cards con `Skeleton`.

### D2 — Estados vacíos como bloques condicionales en App.tsx

**Decisión:** Renderizar placeholders directamente en App.tsx con condicionales `{habits.length === 0 ? <EmptyHabits /> : <HabitRows />}`. Los placeholders son bloques simples con texto e icono, sin crear componentes separados (son únicos al dashboard).

**Implementación:**
- Hábitos vacíos: dentro de CalendarSection children, un div centrado con emoji 📋, texto "Añade tu primer hábito" y botón que llama a `setIsHabitModalOpen(true)`.
- Recompensas vacías: dentro de RewardsSection children, un div centrado con emoji 🎁, texto "Crea tu primera recompensa".

### D3 — Manejo de errores parciales

**Decisión:** El error actual de `useHabitDashboard` cubre la carga de la semana (hábitos + stats). Las recompensas usan estado local (`INITIAL_REWARDS`), así que no fallan por API. Por tanto, el manejo de error parcial se implementa mostrando un mensaje en la zona del calendario cuando `error !== null && !loading`, dejando header y stats en 0 visible.

**Nota:** Cuando las recompensas migren a API (futuro ticket), se añadirá error independiente. Por ahora, el error del dashboard ya cubre el caso principal.

### D4 — Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `frontend/src/presentation/App.tsx` | Consumir `loading`/`error`, estados vacíos, skeletons, error parcial |
| `frontend/src/presentation/components/layout/StatsSection.tsx` | Aceptar prop `loading` para renderizar skeletons de stats |
| `frontend/src/presentation/components/layout/RewardsSection.tsx` | Sin cambios (estado vacío se gestiona desde App.tsx children) |

## Risks / Trade-offs

- **[Acoplamiento de skeletons a App.tsx]** → Los skeletons podrían encapsularse en cada sección layout, pero para un dashboard único, el control centralizado en App.tsx es más simple y evita props innecesarias. Mitigación: si crece la complejidad, extraer a componentes.
- **[Recompensas locales]** → Las recompensas no vienen de API aún (usan `INITIAL_REWARDS`), así que el error parcial de recompensas es teórico. Mitigación: el patrón queda preparado en el layout para cuando migren a API.

## Open Questions

_(ninguna — el alcance está bien definido por el DoD del ticket)_
