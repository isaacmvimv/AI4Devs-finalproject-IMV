# Design — T-17-03 · Componente AddRewardModal con validaciones

**Ticket:** T-17-03 | **User Story:** US-17 | **Change:** t-17-03-componente-addrewardmodal-con-validaciones

## Estado actual

No existe ningún modal de creación de recompensas. Los componentes relacionados ya implementados son:

- `frontend/src/presentation/components/AddHabitModal.tsx` — modal de referencia con mismo patrón UX.
- `frontend/src/presentation/components/AddHabitModal.test.tsx` — tests unitarios de referencia.
- `frontend/src/presentation/components/RewardCard.tsx` — tarjeta de recompensa (T-17-02, archivado).

## Estado objetivo

Añadir `AddRewardModal.tsx` y `AddRewardModal.test.tsx` en `frontend/src/presentation/components/`, siguiendo fielmente el patrón de `AddHabitModal`.

## Decisiones técnicas

### Capa de presentación (Clean Architecture)
El componente vive en la capa **Presentación** (`frontend/src/presentation/components/`). No contiene lógica de dominio ni llamadas HTTP directas: recibe un prop `onAdd` de tipo `(reward: RewardInput) => Promise<void>` inyectado desde el padre, igual que `AddHabitModal` recibe `onAdd` para hábitos.

### Contrato de props
```typescript
interface AddRewardModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (reward: { emoji: string; name: string; description: string; cost: number }) => Promise<void>
}
```

### Campos del formulario

| Campo | Tipo | Validación |
|-------|------|-----------|
| emoji | selector de grid (string) | sin validación; default primer emoji |
| nombre | text input | no vacío |
| descripción | textarea (opcional) | sin validación |
| coste | number input | > 0 |

### Patrón UX (idéntico a AddHabitModal)

- `isSubmitting` → botón deshabilitado + spinner `<Loader2 className="animate-spin" />`.
- Error de API → `toast.error(message)` via `sonner`, modal permanece abierto.
- Éxito → `resetFields()` + `onClose()`.
- Errores inline → estado `errors` tipado, mensajes bajo el campo.

### Emojis de recompensas

Selección diferente a hábitos, orientada a auto-recompensas:

```
🍕 🍦 🎬 🎮 🛁 📖 ✈️ 🛍️ 🍷 🎵 🌴 💆 🎂 🏖️ 🎁 🌟
```

### Primitivas UI

- `Dialog / DialogContent / DialogHeader / DialogTitle` de `./ui/dialog` (Radix UI, mismo import que `AddHabitModal`).
- Estilos Tailwind CSS v4 alineados con `AddHabitModal` (rounded-3xl, ring-2, rounded-xl, etc.).

## Archivos afectados

```
frontend/src/presentation/components/
  AddRewardModal.tsx          ← nuevo
  AddRewardModal.test.tsx     ← nuevo
```

No se toca `api-spec.yml`, `data-model.md` ni ningún archivo backend.
