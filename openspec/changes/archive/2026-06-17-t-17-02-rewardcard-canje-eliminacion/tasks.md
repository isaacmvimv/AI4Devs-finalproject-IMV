# Tasks — T-17-02 · Componente RewardCard con canje y eliminación

- **Ticket:** T-17-02
- **US:** US-17 — UI: sistema de recompensas en el dashboard
- **Change:** t-17-02-rewardcard-canje-eliminacion
- **Rama:** feature/T-17-02-rewardcard-canje-eliminacion
- **Pasos aplicables:** unit | e2e (curl N/A — sin cambios en API)

---

## Paso 0 — Rama feature (OBLIGATORIO)

- [x] Verificar que la rama no existe local ni remota:
  ```bash
  git fetch origin develop
  git branch --list "feature/T-17-02-rewardcard-canje-eliminacion"
  git branch -r --list "origin/feature/T-17-02-rewardcard-canje-eliminacion"
  ```
- [x] Crear la rama desde `develop`:
  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b feature/T-17-02-rewardcard-canje-eliminacion
  git branch --show-current
  ```

---

## Paso 1 — Implementación

- [x] **Refactorizar `frontend/src/presentation/components/RewardCard.tsx`:**
  - [x] DoD: añadir props `rewardId: number` y `weekId: number`; eliminar prop `onRedeem: () => void`; añadir `onRedeemSuccess?: (pointsSpent: number) => void`
  - [x] DoD: estado interno `isRedeeming` y `redeemed` con `useState`
  - [x] DoD: `currentPoints >= cost` → botón "Canjear" activo en `bg-yellow-400`
  - [x] DoD: `currentPoints < cost` → botón deshabilitado con texto "Faltan X pts" (`bg-gray-100 text-gray-400`)
  - [x] DoD: al hacer clic → spinner (`<Loader2 className="animate-spin" />`) mientras API responde; botón deshabilitado durante la petición
  - [x] DoD: éxito → estado `redeemed=true`, texto "¡Canjeada!", `toast.success(...)`, llamada a `onRedeemSuccess(result.pointsSpent)`
  - [x] DoD: error 422 → `toast.error('Puntos insuficientes para canjear esta recompensa')`; saldo no muta (no hay optimistic update local)
  - [x] DoD: botón de eliminar visible on-hover, llama a `onDelete()`

- [x] **Crear `frontend/src/presentation/components/RewardCard.test.tsx`:**
  - [x] Añadir `// @vitest-environment jsdom` como primera línea
  - [x] Test: `currentPoints < cost` → botón con "Faltan X pts" y `disabled`
  - [x] Test: `currentPoints >= cost` → botón con "Canjear" habilitado
  - [x] Test: canje exitoso → mock `redeemReward` resolve → `onRedeemSuccess` llamado con `pointsSpent`
  - [x] Test: error 422 → mock `redeemReward` reject `ApiError(422, 'INSUFFICIENT_POINTS')` → `onRedeemSuccess` no llamado
  - [x] Test: clic en eliminar → `onDelete` llamado
  - [x] `afterEach`: `cleanup()` + `vi.unstubAllGlobals()`

- [x] **Actualizar consumidor en `RewardsSection.tsx` o `App.tsx`** para pasar las nuevas props `rewardId` y `weekId` (y eliminar `onRedeem`).

---

## Paso N — Tests unitarios

- [x] Ejecutar tests del componente:
  ```bash
  npx vitest run frontend/src/presentation/components/RewardCard.test.tsx
  ```
- [x] Ejecutar suite completa para detectar regresiones:
  ```bash
  npx vitest run
  ```
- [x] Todos los tests PASS antes de continuar.

---

## Paso N+1 — Verificación (→ tasks-core §N+1)

- [x] Iniciar frontend:
  ```bash
  npm run dev
  ```
- [x] Abrir `http://localhost:5173` y verificar:
  - [ ] RewardCard con saldo insuficiente muestra "Faltan X pts" y botón deshabilitado
  - [ ] RewardCard con saldo suficiente muestra botón "Canjear" activo
  - [ ] (Con backend activo `npm run dev:api`) clic en "Canjear" muestra spinner → toast de éxito → "¡Canjeada!"
  - [ ] Sin backend: error de red → toast de error; botón vuelve a "Canjear"
  - [ ] Botón eliminar visible on-hover y funcional
- [x] `npm run build` completa sin errores TypeScript.
- [x] Crear informe: `openspec/changes/t-17-02-rewardcard-canje-eliminacion/reports/YYYY-MM-DD-step-N1-verification.md`

---

## Paso N+2 — curl (N/A)

Este ticket no modifica endpoints de la API. La integración HTTP se verifica mediante los tests unitarios con mocks y el flujo E2E. No se requieren pruebas curl independientes.

---

## Paso N+3 — E2E Playwright MCP (→ tasks-core §N+3)

- [x] Asegurar que frontend y backend están activos (`npm run dev` + `npm run dev:api` + `npm run docker:up`)
- [x] Navegar a `http://localhost:5173`
- [x] Verificar escenario de saldo insuficiente: tarjeta con botón deshabilitado y texto "Faltan X pts"
- [x] Verificar escenario de canje exitoso: clic → spinner → toast éxito → "¡Canjeada!" (requiere puntos suficientes en perfil)
- [x] Verificar eliminación: clic en × → tarjeta desaparece del catálogo
- [x] Capturar snapshots de estados relevantes
- [x] Crear informe: `openspec/changes/t-17-02-rewardcard-canje-eliminacion/reports/YYYY-MM-DD-step-N3-e2e.md`

---

## Paso N+4 — Documentación

- [x] Actualizar `docs/frontend-standards.md` si se introduce algún patrón nuevo (p. ej. patrón de componente con estado asíncrono interno). Si no hay novedad respecto a los patrones existentes, documentar como N/A. → **N/A**: el patrón `isRedeeming/redeemed` es extensión del patrón `isSubmitting + Loader2` ya documentado en §560.

---

## §Cierre (→ tasks-core §Cierre)

- [ ] Todos los pasos anteriores marcados `[x]` e informes PASS.
- [ ] Usuario acepta el change.
- [ ] Commit único en la rama feature (viñetas breves, sin commits intermedios).
- [ ] `git push -u origin feature/T-17-02-rewardcard-canje-eliminacion`
- [ ] Merge a `develop`.
- [ ] Archivar: `mv openspec/changes/t-17-02-rewardcard-canje-eliminacion openspec/changes/archive/YYYY-MM-DD-t-17-02-rewardcard-canje-eliminacion`
- [ ] `npm run openspec:mark-ticket -- --change t-17-02-rewardcard-canje-eliminacion` (no bloqueante si falla)
