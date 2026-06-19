## ADDED Requirements

### Requirement: Vendor chunk separation

El sistema de build DEBE separar las dependencias `react`, `react-dom` y `@radix-ui/*` en un vendor chunk independiente mediante `build.rollupOptions.output.manualChunks` en `vite.config.ts`.

#### Scenario: Build genera vendor chunk separado
- **WHEN** se ejecuta `npm run build`
- **THEN** el output contiene un chunk de vendor separado con `react`, `react-dom` y paquetes `@radix-ui/*`
- **AND** el chunk de la aplicación no incluye estas dependencias

### Requirement: Bundle size bajo umbral

El bundle JS principal (vendor + app) DEBE pesar menos de 300KB gzip tras el build de producción.

#### Scenario: Bundle total bajo 300KB gzip
- **WHEN** se ejecuta `npm run build`
- **THEN** la suma de los chunks JS principales (vendor + app) es inferior a 300KB gzip

#### Scenario: Tree-shaking de componentes no usados
- **WHEN** se ejecuta `npm run build`
- **THEN** los módulos de componentes shadcn/ui eliminados del proyecto no aparecen en el bundle
- **AND** solo se incluyen los componentes efectivamente importados (`avatar`, `dialog`, `skeleton`, `sonner`)

### Requirement: Eliminación de componentes UI no usados

Los componentes de `frontend/src/presentation/components/ui/` que no estén importados en ningún módulo del proyecto DEBEN ser eliminados del código fuente.

#### Scenario: Componentes no importados eliminados
- **WHEN** se revisa el directorio `frontend/src/presentation/components/ui/`
- **THEN** solo existen los ficheros de componentes que tienen al menos un import en el código fuente
- **AND** los componentes eliminados no generan errores de compilación en `npm run build`

### Requirement: Lighthouse Performance Score

La aplicación DEBE alcanzar un Lighthouse Performance Score >= 85 en modo desktop tras las optimizaciones de bundle.

#### Scenario: Lighthouse desktop pasa umbral
- **WHEN** se ejecuta un audit Lighthouse en desktop sobre el build de producción
- **THEN** el Performance Score es >= 85
- **AND** First Contentful Paint <= 1.5s
- **AND** Time to Interactive <= 3s
