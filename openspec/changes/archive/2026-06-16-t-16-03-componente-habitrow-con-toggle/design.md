# Design: T-16-03 — Componente HabitRow con toggle de estados y modo lectura

## Estado actual vs. objetivo

**Estado actual:** `frontend/src/presentation/components/HabitRow.tsx` existe con una implementación funcional básica que ya cubre el layout de 7 celdas, los estados de color y el modo `isReadOnly`. Sin embargo:

1. La firma usa `onToggleDay(habitId, dayIndex)` — el `habitId` dentro del callback es redundante porque el padre ya lo conoce al construir el handler.
2. No existe indicador visual de "día actual" (requiere `weekOffset` prop).
3. No existen tests unitarios (`HabitRow.test.tsx` ausente).

**Objetivo:** Alinear props al contrato esperado por `useHabitDashboard`, añadir el indicador de hoy y crear la suite de tests RTL.

## Arquitectura

Este componente vive en la capa **Presentación** siguiendo la Clean Architecture del frontend:

```
frontend/src/
  presentation/
    components/
      HabitRow.tsx          ← modificar
      HabitRow.test.tsx     ← crear (nuevo)
```

No toca capas de Aplicación, Dominio ni Infraestructura.

## Decisiones técnicas

### Firma de props

Cambiar callbacks para no exponer `habitId` internamente — el padre cierra sobre él:

```ts
interface HabitRowProps {
  emoji: string
  name: string
  streak?: number
  completionStatus: Array<'completed' | 'failed' | 'pending'>
  weekOffset?: number          // nuevo: 0 = semana actual, default 0
  onToggle: (dayIndex: number) => void   // antes: onToggleDay(id, idx)
  onDelete: () => void                   // antes: onDelete(id)
  isReadOnly?: boolean
}
```

> El cambio de `onToggleDay(id, idx)` → `onToggle(idx)` es un breaking change en la firma. Dado que `HabitRow` aún no está integrado en ningún consumidor real (el dashboard usa datos mock), el impacto es nulo fuera de los propios tests.

### Indicador de "hoy"

Calcular `todayIndex` = `getDay(new Date())` ajustado a lunes=0. Solo añadir clase visual diferenciadora cuando `weekOffset === 0 && index === todayIndex`. No requiere librería extra (solo `new Date()`).

### Tests — patrón RTL

Seguir el patrón de `UserProfileCard.test.tsx`:
- `// @vitest-environment jsdom`
- `import { render, screen, fireEvent } from '@testing-library/react'`
- `import { describe, it, expect, vi } from 'vitest'`
- Pasar props directamente (componente puro, sin dependencias externas).

### Sin cambios en

- Tailwind classes de colores (green-500, red-400, gray-100) — ya correctas.
- Layout `grid-cols-[1fr_repeat(7,48px)_24px]` — mantener.
- Iconos `Check` / `X` de lucide-react — mantener.

## Archivos afectados

| Ruta | Acción |
|------|--------|
| `frontend/src/presentation/components/HabitRow.tsx` | Modificar: firma de props + prop `weekOffset` + indicador de hoy |
| `frontend/src/presentation/components/HabitRow.test.tsx` | Crear: suite RTL |

## Dependencias

- T-16-02 (`useHabitDashboard`) define el shape de datos que alimenta `HabitRow`; la firma de props debe ser compatible.
- No hay dependencias de API ni de BD en este componente.
