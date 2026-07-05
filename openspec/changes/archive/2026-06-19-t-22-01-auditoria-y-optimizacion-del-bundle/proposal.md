# Proposal — T-22-01 · Auditoría y optimización del bundle frontend

**Ticket:** T-22-01 · **User Story:** US-22 · **Sprint:** 5

## Why

El bundle de producción de ConRutina no tiene configuración de chunking manual y arrastra ~42 componentes shadcn/ui que no se usan en ningún lugar del código. Esto incrementa el tamaño del bundle innecesariamente y degrada el rendimiento percibido (First Contentful Paint, Time to Interactive). El ticket aborda el AC de US-22 Scenario 2 (bundle JS < 300KB gzip, tree-shaking de shadcn/ui no usados) y contribuye al Scenario 1 (Lighthouse Performance >= 85).

## What Changes

- Configurar `build.rollupOptions.output.manualChunks` en `vite.config.ts` para separar `react`, `react-dom` y `@radix-ui/*` en un vendor chunk independiente.
- Eliminar ~42 componentes de `frontend/src/presentation/components/ui/` que no se importan en ningún módulo (solo se usan: `avatar`, `dialog`, `skeleton`, `sonner`).
- Verificar que el bundle JS principal resultante pesa < 300KB gzip.
- Verificar Lighthouse Performance Score >= 85 en desktop.

## Capabilities

### New Capabilities

- `bundle-optimization`: Configuración de manualChunks y limpieza de componentes UI no usados para optimizar el tamaño del bundle de producción.

### Modified Capabilities

_(Sin cambios en requisitos de capabilities existentes.)_

## Impact

- **Código:** `vite.config.ts` (nueva sección `build.rollupOptions`), eliminación de ~42 ficheros en `frontend/src/presentation/components/ui/`.
- **Dependencias:** posible desinstalación de paquetes `@radix-ui/*` cuyas primitivas ya no se importen. Instalación de `rollup-plugin-visualizer` como devDependency para auditoría.
- **Build:** el output de `npm run build` cambiará la estructura de chunks (vendor separado).
- **Sin impacto en API ni base de datos.**

## Non-goals

- Optimización de queries PostgreSQL (T-22-02 / US-22 Scenario 3).
- Lazy loading de rutas o componentes (no hay router en el MVP actual).
- Mejoras de rendimiento en el backend.
- Cambios funcionales en la UI.

## Criterios de aceptación (referencia)

Vinculados a US-22 Gherkin AC:
- **Scenario 2 — Bundle size:** bundle JS principal < 300KB gzip; módulos shadcn/ui no usados excluidos del bundle.
- **Scenario 1 — Performance frontend:** Lighthouse Performance >= 85, FCP <= 1.5s, TTI <= 3s (contribución parcial desde este ticket).
