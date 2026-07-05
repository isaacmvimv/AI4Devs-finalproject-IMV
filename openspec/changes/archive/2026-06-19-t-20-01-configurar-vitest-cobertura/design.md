## Context

El monorepo ConRutina ya tiene Vitest v4.1.7 configurado en `vitest.config.ts` con 225+ tests pasando (41 archivos). Los scripts `test` y `test:watch` existen en `package.json`. Falta:
1. La dependencia `@vitest/coverage-v8` para instrumentación de cobertura.
2. La sección `coverage` en `vitest.config.ts` con umbrales por directorio.
3. El script `test:coverage` en `package.json`.

Estado actual de `vitest.config.ts`:
- Include: `backend/src/**/*.test.ts`, `frontend/src/**/*.test.ts`, `frontend/src/**/*.test.tsx`
- Environment: `node`
- Setup: `vitest.setup.ts`

## Goals / Non-Goals

**Goals:**
- Instalar `@vitest/coverage-v8` y configurar cobertura con proveedor `v8`.
- Establecer umbral de 80% (líneas) en `frontend/src/domain/` y `backend/src/domain/`.
- Añadir script `test:coverage` que ejecute `vitest run --coverage`.
- Confirmar que `coverage/` está en `.gitignore`.

**Non-Goals:**
- Escribir tests nuevos (T-20-02).
- Configurar tests de integración (T-20-03).
- Configurar CI/CD.
- Cambiar la estructura de tests existente.

## Decisions

### D1: Proveedor de cobertura — `v8` sobre `istanbul`

`@vitest/coverage-v8` usa la instrumentación nativa de V8, más rápida y sin transformación de código adicional. Es el proveedor recomendado por Vitest para proyectos TypeScript.

**Alternativa descartada:** `@vitest/coverage-istanbul` — más lento, requiere instrumentación AST; solo necesario si se requieren features específicas de istanbul (no aplica aquí).

### D2: Umbrales por directorio con `thresholds`

Vitest permite configurar umbrales globales y por glob pattern dentro de `coverage.thresholds`. Se usará `'frontend/src/domain/**'` y `'backend/src/domain/**'` con 80% en líneas, tal como pide el DoD.

### D3: Directorio de salida `coverage/`

Directorio estándar. Ya figura en `.prettierignore` del proyecto. Verificar que esté en `.gitignore`.

### D4: No modificar scripts existentes

`test` ya es `vitest run` y `test:watch` ya es `vitest`. Solo se añade `test:coverage`.

## Risks / Trade-offs

- **[Cobertura < 80%]** → Si los tests existentes no cubren el 80% del dominio, `test:coverage` reportará el fallo. Mitigación: T-20-02 añadirá tests para alcanzar el umbral; en este ticket solo se configura la herramienta, no se fuerza fallo del proceso con `thresholds` estrictos aún (se configuran como reporte, no como fallo de CI).
- **[Versión de @vitest/coverage-v8]** → Debe coincidir con la major de vitest (v4). Mitigación: instalar sin fijar versión menor (`@vitest/coverage-v8@^4`).
