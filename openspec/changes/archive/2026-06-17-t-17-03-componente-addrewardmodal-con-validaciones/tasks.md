# Tasks — T-17-03 · Componente AddRewardModal con validaciones

**Ticket:** T-17-03 · **User Story:** US-17 · **Change:** `t-17-03-componente-addrewardmodal-con-validaciones` · **Rama:** `feature/T-17-03-componente-addrewardmodal-con-validaciones`
**Pasos aplicables:** unit=sí · curl=N/A · e2e=sí · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar que la rama no existe (local ni remoto): `git branch --list "feature/T-17-03-componente-addrewardmodal-con-validaciones"` y `git branch -r --list "origin/feature/T-17-03-componente-addrewardmodal-con-validaciones"`
- [x] 0.3 `git checkout -b feature/T-17-03-componente-addrewardmodal-con-validaciones`
- [x] 0.4 `git branch --show-current`

## 1. Implementar AddRewardModal.tsx (DoD)

- [x] 1.1 Crear `frontend/src/presentation/components/AddRewardModal.tsx` con campos: emoji (selector grid), nombre (text), descripción (textarea), coste (number).
- [x] 1.2 Implementar validaciones inline: nombre no vacío → error "El nombre es obligatorio"; coste ≤ 0 → error "El coste debe ser mayor que 0".
- [x] 1.3 Implementar patrón UX de `AddHabitModal`: `isSubmitting` con `<Loader2 animate-spin />`, toast de error via `sonner`, `resetFields()` + `onClose()` en éxito.
- [x] 1.4 Reutilizar primitivas `Dialog / DialogContent / DialogHeader / DialogTitle` de `./ui/dialog`.

## 2. Implementar AddRewardModal.test.tsx (DoD)

- [x] 2.1 Crear `frontend/src/presentation/components/AddRewardModal.test.tsx` con `@vitest-environment jsdom`.
- [x] 2.2 Test: submit con nombre vacío → error inline visible, `onAdd` no invocado.
- [x] 2.3 Test: submit con coste = 0 → error inline visible, `onAdd` no invocado.
- [x] 2.4 Test: submit válido → `onAdd` invocado con datos correctos, `onClose` invocado.
- [x] 2.5 Test: error de API → `onAdd` invocado, `onClose` NO invocado, modal permanece abierto.

## 3. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 3.1 Ejecutar tests unitarios focalizados: `npm run test --prefix frontend -- AddRewardModal`
- [x] 3.2 Ejecutar suite completa de frontend: `npm run test --prefix frontend`
- [x] 3.3 Compilación TypeScript sin errores: `npm run build --prefix frontend` (o `tsc --noEmit`)
- [x] 3.4 Crear informe en `openspec/changes/t-17-03-componente-addrewardmodal-con-validaciones/reports/YYYY-MM-DD-step-03-verification.md`

## 4. E2E → tasks-core §N+3 (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)

- [x] 4.1 Arrancar frontend: `npm run dev --prefix frontend` → `http://localhost:5173`
- [x] 4.2 Navegar hasta el modal de nueva recompensa y verificar que el formulario se renderiza correctamente.
- [x] 4.3 Probar submit con nombre vacío → verificar error inline visible.
- [x] 4.4 Probar submit con coste = 0 → verificar error inline visible.
- [x] 4.5 Probar submit válido → verificar cierre del modal y feedback visual.
- [x] 4.6 Crear informe en `openspec/changes/t-17-03-componente-addrewardmodal-con-validaciones/reports/YYYY-MM-DD-step-04-e2e.md`

## 5. Documentación → tasks-core §N+4

- [x] 5.1 No se modifica `api-spec.yml` ni `data-model.md` (ticket solo presentación).
- [x] 5.2 Verificar si `docs/frontend-standards.md` requiere actualización (patrón de modal ya documentado; probablemente N/A).

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
