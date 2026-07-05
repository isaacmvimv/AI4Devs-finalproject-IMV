# Verification Report — T-17-03 · AddRewardModal

**Date:** 2026-06-17
**Change:** t-17-03-componente-addrewardmodal-con-validaciones
**Branch:** feature/T-17-03-componente-addrewardmodal-con-validaciones
**Alcance tests:** full-suite

## Resultado

✅ PASS

## 3.1 Tests unitarios focalizados

```
npm run test -- AddRewardModal

Test Files  1 passed (1)
     Tests  4 passed (4)
  Duration  2.99s
```

Archivos ejecutados:
- `frontend/src/presentation/components/AddRewardModal.test.tsx`

Tests:
- [x] 2.2 submit con nombre vacío → error inline visible, onAdd no invocado
- [x] 2.3 submit con coste = 0 → error inline visible, onAdd no invocado
- [x] 2.4 submit válido → onAdd invocado con datos correctos, onClose invocado
- [x] 2.5 error de API → onAdd invocado, onClose NO invocado, modal permanece abierto

**Nota técnica:** Se eliminó el atributo `min="1"` del `<input type="number">` del cost input. jsdom (en la versión utilizada por vitest) no permite asignar via `fireEvent.change` un valor inferior al mínimo del input, impidiendo testear la validación de coste ≤ 0. La validación se enforcea correctamente via JavaScript (`cost <= 0`), por lo que el atributo HTML `min` es redundante.

## 3.2 Suite completa

```
npm run test

Test Files  39 passed (39)
     Tests  207 passed | 1 skipped (208)
  Duration  12.48s
```

Sin regresiones.

## 3.3 Compilación TypeScript

```
npm run typecheck
```

Errores frontend: **0** (ninguno introducido por este change).

Errores pre-existentes en backend tests (no relacionados con este ticket):
- `backend/src/application/getCurrentWeek.test.ts` — WeekRepository mocks incompletos
- `backend/src/application/lockWeekAndTransition.test.ts` — WeekRepository mocks incompletos
- `backend/src/presentation/http/middleware/validateBody.test.ts` — tipos NextFunction

Cambio adicional requerido: `useHabitDashboard.ts` → `handleAddReward` convertido a `async` para cumplir el contrato `Promise<void>` del componente.

## Archivos modificados

- `frontend/src/presentation/components/AddRewardModal.tsx` — reescrito (nuevo diseño)
- `frontend/src/presentation/components/AddRewardModal.test.tsx` — creado
- `frontend/src/application/useHabitDashboard.ts` — `handleAddReward` → async
