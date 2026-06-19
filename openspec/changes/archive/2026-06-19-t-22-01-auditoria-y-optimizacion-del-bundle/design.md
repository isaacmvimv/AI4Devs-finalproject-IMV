# Design — T-22-01 · Auditoría y optimización del bundle frontend

## Context

ConRutina usa Vite 6.4 con React 18 y ~46 componentes shadcn/ui en `frontend/src/presentation/components/ui/`. De estos, solo 4 se importan realmente: `avatar`, `dialog`, `skeleton` y `sonner`. El `vite.config.ts` actual no tiene configuración de `build.rollupOptions`, por lo que Vite genera chunks automáticos sin separación explícita de vendor.

**Estado actual de `vite.config.ts`:** define `root`, `plugins` (react + tailwindcss), `resolve.alias`, `assetsInclude` y `server.proxy`. No tiene sección `build`.

**Componentes UI usados (4):**
- `avatar.tsx` — importado en `ImageWithFallback.tsx`
- `dialog.tsx` — importado en modales (`AddHabitModal`, `AddRewardModal`)
- `skeleton.tsx` — importado en `UserProfileCard.tsx`
- `sonner.tsx` — importado en `App.tsx`

**Componentes UI no usados (~42):** accordion, alert, alert-dialog, aspect-ratio, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, slider, switch, table, tabs, textarea, toggle, toggle-group, tooltip.

## Goals / Non-Goals

**Goals:**
- Separar vendor chunk (`react`, `react-dom`, `@radix-ui/*`) para mejor caché del navegador.
- Eliminar componentes UI no usados del código fuente para reducir bundle y facilitar mantenimiento.
- Instalar `rollup-plugin-visualizer` para auditoría visual del bundle.
- Alcanzar bundle < 300KB gzip y Lighthouse >= 85.

**Non-Goals:**
- Cambiar la funcionalidad de la aplicación.
- Implementar code splitting por rutas (no hay router).
- Optimizar queries de backend (ticket T-22-02).
- Desinstalar paquetes npm que aún se usen indirectamente.

## Decisions

### D1 — manualChunks en vite.config.ts

Añadir `build.rollupOptions.output.manualChunks` con una función que asigne a `vendor` los módulos que contengan `react`, `react-dom` o `@radix-ui` en su path.

**Alternativa descartada:** `splitVendorChunkPlugin` de Vite — deprecado en Vite 5+ y con menos control sobre qué se separa.

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (id.includes('node_modules')) {
          if (id.includes('react') || id.includes('react-dom') || id.includes('@radix-ui')) {
            return 'vendor';
          }
        }
      },
    },
  },
},
```

### D2 — Eliminación de componentes UI no usados

Borrar los ~42 ficheros `.tsx` del directorio `ui/` que no tienen imports. Mantener solo `avatar.tsx`, `dialog.tsx`, `skeleton.tsx`, `sonner.tsx` y el fichero de utilidad `utils.ts` (si existe, ya que `cn()` se usa en varios componentes).

**Verificación previa:** buscar imports transitivos dentro de los propios componentes UI retenidos para no romper dependencias internas.

### D3 — rollup-plugin-visualizer como devDependency

Instalar `rollup-plugin-visualizer` y añadirlo como plugin en `vite.config.ts` (con `open: false` para no abrir automáticamente). Generar `stats.html` en la raíz para inspección manual.

**Alternativa descartada:** `source-map-explorer` — requiere source maps habilitados en producción, menos conveniente con Vite.

### D4 — Limpieza de dependencias npm

Tras eliminar componentes, verificar si algún paquete `@radix-ui/*` ya no se importa en ningún fichero y desinstalarlo. Las dependencias usadas por los 4 componentes retenidos se mantienen.

## Risks / Trade-offs

- **[Riesgo] Dependencias internas entre componentes UI** → Mitigación: verificar imports transitivos dentro de `dialog.tsx`, `avatar.tsx`, `skeleton.tsx` y `sonner.tsx` antes de borrar.
- **[Riesgo] Componentes usados en tests pero no en producción** → Mitigación: buscar imports también en archivos `.test.tsx`.
- **[Trade-off] rollup-plugin-visualizer en prod config** → Se añade con condicional `process.env.ANALYZE` o se acepta overhead mínimo (plugin no genera output si no se configura `open`).

## Open Questions

_(Ninguna — el alcance del ticket es claro y las decisiones técnicas son estándar.)_
