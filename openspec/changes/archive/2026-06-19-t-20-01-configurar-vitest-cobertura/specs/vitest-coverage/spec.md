## ADDED Requirements

### Requirement: Script test ejecuta todos los tests
El sistema DEBE ejecutar todos los tests del monorepo al invocar `npm run test` y finalizar con exit code 0 si todos pasan.

#### Scenario: Ejecución exitosa de npm run test
- **WHEN** se ejecuta `npm run test`
- **THEN** Vitest descubre y ejecuta todos los archivos `*.test.ts` / `*.test.tsx` en `backend/src/` y `frontend/src/`
- **AND** todos los tests pasan sin error

### Requirement: Script test:coverage genera reporte de cobertura
El sistema DEBE generar un reporte de cobertura de código en el directorio `coverage/` al ejecutar `npm run test:coverage`.

#### Scenario: Generación de reporte de cobertura
- **WHEN** se ejecuta `npm run test:coverage`
- **THEN** Vitest ejecuta todos los tests con el proveedor `@vitest/coverage-v8`
- **AND** se genera un directorio `coverage/` con los reportes

#### Scenario: Cobertura de dominio frontend cumple umbral
- **WHEN** se ejecuta `npm run test:coverage`
- **THEN** la cobertura de `frontend/src/domain/` es >= 80% en líneas

#### Scenario: Cobertura de dominio backend cumple umbral
- **WHEN** se ejecuta `npm run test:coverage`
- **THEN** la cobertura de `backend/src/domain/` es >= 80% en líneas

### Requirement: Script test:watch ejecuta tests en modo watch
El sistema DEBE ejecutar Vitest en modo watch al invocar `npm run test:watch`.

#### Scenario: Modo watch activo
- **WHEN** se ejecuta `npm run test:watch`
- **THEN** Vitest se inicia en modo interactivo y observa cambios en archivos

### Requirement: Descubrimiento automático de tests
El sistema DEBE descubrir automáticamente todos los archivos `*.test.ts` y `*.test.tsx` sin configuración adicional por parte del desarrollador.

#### Scenario: Nuevo archivo test descubierto
- **WHEN** se crea un nuevo archivo `example.test.ts` en `frontend/src/domain/`
- **THEN** `npm run test` lo incluye automáticamente en la ejecución

### Requirement: Directorio coverage excluido de git
El directorio `coverage/` NO DEBE ser versionado en el repositorio.

#### Scenario: coverage en gitignore
- **WHEN** se genera el reporte de cobertura
- **THEN** `coverage/` está listado en `.gitignore`
- **AND** `git status` no muestra archivos de `coverage/` como untracked
