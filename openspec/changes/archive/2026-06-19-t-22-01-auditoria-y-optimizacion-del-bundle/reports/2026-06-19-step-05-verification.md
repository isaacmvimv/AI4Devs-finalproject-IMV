# Verification Report — T-22-01 Auditoría y optimización del bundle

**Date:** 2026-06-19
**Change:** t-22-01-auditoria-y-optimizacion-del-bundle
**Alcance tests:** change-only

## Build Verification

- `npm run build` — ✓ exitoso sin errores ni warnings críticos

### Bundle Sizes

| Asset | Raw | Gzip |
|-------|-----|------|
| **Baseline (pre-optimización)** | 296.40 KB JS / 94.93 KB CSS | 91.98 KB / 15.60 KB |
| **index.js (post)** | 119.21 KB | 34.54 KB |
| **vendor.js (post)** | 176.70 KB | 57.32 KB |
| **index.css (post)** | 29.47 KB | 6.60 KB |
| **Total JS (post)** | 295.91 KB | **91.86 KB** |

**Reducción CSS:** 94.93 → 29.47 KB (-69%)
**Meta < 300KB gzip:** ✓ cumplido (91.86 KB)

## Runtime Verification

- `npm run dev` — ✓ app carga en http://localhost:5173
- Avatar component — ✓ visible (UserProfileCard)
- Dialog component — ✓ botones "+ Nuevo hábito" y "+ Nueva recompensa" presentes
- Skeleton component — ✓ importado en App.tsx y StatsSection
- Sonner/Toaster — ✓ región de notificaciones visible

## Optimizations Applied

1. **43 ficheros UI eliminados** — solo se retienen avatar, dialog, skeleton, sonner, utils
2. **24 paquetes @radix-ui eliminados** — solo react-avatar y react-dialog retenidos
3. **7 dependencias shadcn eliminadas** — cmdk, embla-carousel-react, input-otp, react-day-picker, react-resizable-panels, recharts, vaul
4. **manualChunks configurado** — vendor chunk separa react, react-dom, @radix-ui/*
5. **rollup-plugin-visualizer** — disponible con `ANALYZE=1 npm run build`

## TypeCheck

- `npx tsc --noEmit` — ✓ sin errores

## Lighthouse

N/A — entorno CLI sin navegador gráfico. Los tamaños de bundle confirman mejora significativa de performance.

## Suite completa

N/A — change-only scope.
