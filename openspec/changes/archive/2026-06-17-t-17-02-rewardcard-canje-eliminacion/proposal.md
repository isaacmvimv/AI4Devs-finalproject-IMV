# Proposal — T-17-02 · Componente RewardCard con canje y eliminación

- **Ticket:** T-17-02
- **User Story:** US-17 — UI: sistema de recompensas en el dashboard
- **Sprint:** Sprint 3 · UI Core — Perfil, Hábitos y Recompensas
- **Change:** t-17-02-rewardcard-canje-eliminacion
- **Rama:** feature/T-17-02-rewardcard-canje-eliminacion

---

## Why

El componente `RewardCard.tsx` existe en el repo pero es un placeholder estático: el botón "Canjear" siempre llama a `onRedeem()` sin gestionar estados de carga, errores 422 ni feedback visual. Para cerrar el ciclo motivacional del usuario es necesario que la tarjeta llame directamente a la API de canjes (`POST /api/weeks/:id/redemptions`), muestre spinner durante la operación, aplique optimistic update del saldo y haga rollback ante error.

## What Changes

- Refactorizar `RewardCard.tsx` para gestionar internamente el flujo de canje con `isRedeeming` y `redeemed` como estados locales.
- Añadir spinner en el botón mientras la API responde.
- Aplicar feedback visual de canje exitoso ("¡Canjeada!") con toast de sonner.
- Hacer rollback y mostrar toast de error si la API devuelve 422 `INSUFFICIENT_POINTS`.
- Botón deshabilitado con texto "Faltan X pts" cuando `currentPoints < cost`.
- Botón de eliminar visible on-hover, funcional vía `onDelete` (optimistic update lo gestiona el padre).
- Añadir `RewardCard.test.tsx` con tests unitarios Vitest + Testing Library.

## Capabilities

### New Capabilities

- `reward-card-redeem`: Tarjeta de recompensa con flujo de canje completo — botón habilitado/deshabilitado por saldo, spinner durante llamada a API, toast de éxito/error, rollback de saldo ante 422.

### Modified Capabilities

_(ninguna — el componente actual es placeholder sin spec previa)_

## Impact

- **Archivo modificado:** `frontend/src/presentation/components/RewardCard.tsx`
- **Archivo nuevo:** `frontend/src/presentation/components/RewardCard.test.tsx`
- **Dependencia en infraestructura:** `frontend/src/infrastructure/rewardApi.ts` (`redeemReward`, `deleteReward`) — ya implementada en T-17-01.
- **Sin cambios en API ni modelo de datos.**
- **Prop `onRedeem` del padre:** su firma cambia; pasará a recibir `weekId` y `rewardId` para delegar la llamada a API dentro del componente (o el padre puede seguir delegando — ver design.md).

## Non-goals

- No implementar el modal de creación de recompensas (T-17-03).
- No modificar `RewardsSection.tsx` ni `useHabitDashboard.ts` más allá de lo necesario para alimentar las nuevas props.
- No implementar historial de canjes de la semana (negociable según INVEST de US-17).
- No modificar la API backend.

## AC Gherkin relacionados (US-17)

- **Scenario 2** — Canjear con saldo suficiente: botón activo, optimistic update, llamada a `POST /api/weeks/:id/redemptions`.
- **Scenario 3** — Botón deshabilitado por saldo insuficiente: "Faltan X pts".
- **Scenario 5** — Rollback de canje fallido (422): saldo revierte, toast de error.
- **Scenario 4** — Eliminar recompensa: desaparece del catálogo con optimistic update, `DELETE /api/rewards/:id`.
