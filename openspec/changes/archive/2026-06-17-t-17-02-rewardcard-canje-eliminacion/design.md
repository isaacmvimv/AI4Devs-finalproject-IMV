# Design — T-17-02 · Componente RewardCard con canje y eliminación

## Contexto y estado actual

`frontend/src/presentation/components/RewardCard.tsx` ya existe como componente funcional básico (68 líneas). Muestra emoji, nombre, descripción, barra de progreso y un botón "Canjear" que llama a `onRedeem()` sin ningún estado asíncrono. No hay gestión de carga, error 422 ni feedback visual de canje completado.

El cliente HTTP de la infraestructura ya está completo (T-17-01):
- `redeemReward(weekId, rewardId)` → `POST /api/weeks/:weekId/redemptions` — lanza `ApiError(422, 'INSUFFICIENT_POINTS')` en caso de saldo insuficiente.
- `deleteReward(id)` → `DELETE /api/rewards/:id`

## Decisiones de diseño

### 1. El componente gestiona internamente el estado del canje

`RewardCard` pasa de componente puramente presentacional a componente con lógica de interacción (estado `isRedeeming`, `redeemed`). Esta decisión es coherente con el patrón ya seguido en `AddHabitModal.tsx` (gestión de `isSubmitting` interna) y evita que el padre necesite duplicar ese estado por cada tarjeta.

**Props añadidas:**
```typescript
weekId: number          // necesario para POST /api/weeks/:weekId/redemptions
rewardId: number        // id de la recompensa en BD
```

**Props eliminadas / cambiadas:**
- `onRedeem: () => void` → se elimina; la llamada a API se hace internamente.
- `onRedeemSuccess?: (pointsSpent: number) => void` → callback opcional al padre para que actualice el saldo visible en el dashboard.

### 2. Optimistic update del saldo lo gestiona el padre

`RewardCard` no conoce el saldo total del usuario. Tras éxito del canje, llama a `onRedeemSuccess(pointsSpent)` para que el padre (hook `useHabitDashboard` o similar) reste los puntos del estado global. Esto mantiene la separación de capas.

### 3. Rollback ante 422

Si la API devuelve `ApiError(422, 'INSUFFICIENT_POINTS')`, `RewardCard` simplemente muestra un toast de error. El saldo no se modificó localmente (no hay optimistic update del saldo en el componente), así que no hay rollback local necesario.

### 4. Toast con `sonner`

Se usa `toast` de `sonner` (ya instalada, wrapper en `ui/sonner.tsx`, `<Toaster />` en `App.tsx`).

## Estructura de archivos

```
frontend/src/presentation/components/
├── RewardCard.tsx          ← MODIFICAR (refactorizar)
└── RewardCard.test.tsx     ← CREAR (nuevo)
```

## Interfaz del componente (objetivo)

```typescript
interface RewardCardProps {
  rewardId: number
  weekId: number
  emoji: string
  name: string
  description: string
  cost: number
  currentPoints: number
  onRedeemSuccess?: (pointsSpent: number) => void
  onDelete: () => void
}
```

## Lógica interna (pseudocódigo)

```typescript
const [isRedeeming, setIsRedeeming] = useState(false)
const [redeemed, setRedeemed] = useState(false)

const canAfford = currentPoints >= cost
const missingPoints = cost - currentPoints

async function handleRedeem() {
  if (!canAfford || isRedeeming || redeemed) return
  setIsRedeeming(true)
  try {
    const result = await redeemReward(weekId, rewardId)
    setRedeemed(true)
    toast.success('¡Recompensa canjeada!')
    onRedeemSuccess?.(result.pointsSpent)
  } catch (err) {
    if (err instanceof ApiError && err.status === 422) {
      toast.error('Puntos insuficientes para canjear esta recompensa')
    } else {
      toast.error('Error al canjear. Inténtalo de nuevo.')
    }
  } finally {
    setIsRedeeming(false)
  }
}
```

## Comportamiento del botón

| Estado | Texto | Estilo | Deshabilitado |
|--------|-------|--------|---------------|
| `!canAfford` | "Faltan X pts" | `bg-gray-100 text-gray-400` | sí |
| `canAfford && !isRedeeming && !redeemed` | "Canjear" | `bg-yellow-400 text-yellow-900` | no |
| `isRedeeming` | `<Loader2 animate-spin />` | `bg-yellow-400 opacity-70` | sí |
| `redeemed` | "¡Canjeada!" | `bg-green-100 text-green-700` | sí |

## Tests unitarios (`RewardCard.test.tsx`)

Entorno: `// @vitest-environment jsdom`

| Caso | Descripción |
|------|-------------|
| botón deshabilitado | `currentPoints < cost` → botón con "Faltan X pts" y `disabled` |
| canje exitoso | mock `redeemReward` → resolve → toast éxito, callback `onRedeemSuccess` llamado |
| error 422 | mock `redeemReward` → reject `ApiError(422)` → toast error, saldo no cambia |
| botón eliminar | click → `onDelete` llamado |

## Dependencias

- `rewardApi.ts` (T-17-01, implementado) — `redeemReward`, `deleteReward`
- `sonner` — ya instalada
- `lucide-react` — `Loader2`, `Lock` ya disponibles
- `@testing-library/react` + Vitest + jsdom — configuración existente
