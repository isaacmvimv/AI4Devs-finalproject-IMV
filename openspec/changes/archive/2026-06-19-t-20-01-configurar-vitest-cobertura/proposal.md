## T-20-01 · Configurar Vitest con cobertura de código

**Ticket:** T-20-01 · **User Story:** US-20 — Testing automatizado · **Sprint:** 4

## Why

El monorepo ya cuenta con Vitest configurado y 225+ tests unitarios pasando, pero no tiene habilitada la generación de reportes de cobertura de código. Sin cobertura, no es posible medir objetivamente qué porcentaje de la lógica de dominio está cubierta ni establecer umbrales mínimos que prevengan regresiones. Este ticket cierra esa brecha instalando `@vitest/coverage-v8` y configurando scripts y umbrales.

Criterios de aceptación vinculados al Scenario 1 de US-20 (Gherkin): Vitest configurado con `@vitest/coverage-v8`, `npm run test` pasa, cobertura ≥ 80% en `frontend/src/domain/` y `backend/src/domain/`.

## What Changes

- Instalar `@vitest/coverage-v8` como dependencia de desarrollo.
- Añadir configuración de `coverage` en `vitest.config.ts`: proveedor `v8`, umbral 80% en `frontend/src/domain/` y `backend/src/domain/`, directorio de salida `coverage/`.
- Verificar/ajustar scripts en `package.json`: `test` (vitest run), `test:watch` (vitest), `test:coverage` (vitest run --coverage).
- Asegurar que `coverage/` está en `.gitignore`.
- Verificar que los tests `*.test.ts` se descubren automáticamente (ya funciona).

## Capabilities

### New Capabilities
- `vitest-coverage`: Configuración de cobertura de código con `@vitest/coverage-v8`, umbrales por directorio y scripts npm dedicados.

### Modified Capabilities
_(ninguna — no cambian requisitos de specs existentes)_

## Impact

- **Dependencias:** nueva devDependency `@vitest/coverage-v8`.
- **Configuración:** `vitest.config.ts` (sección `coverage`), `package.json` (scripts `test:watch`, `test:coverage`).
- **Archivos generados:** directorio `coverage/` (excluido de git).
- **CI (futuro):** los umbrales permitirán que un pipeline falle si la cobertura cae por debajo del 80%.

## Non-goals

- Escribir tests unitarios nuevos (eso es T-20-02).
- Configurar tests de integración de API (T-20-03).
- Configurar pipeline CI/CD.
- Cambiar el framework de testing o la estructura de tests existente.
