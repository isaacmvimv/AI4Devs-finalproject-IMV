# Tasks — T-20-01 · Configurar Vitest con cobertura de código

**Ticket:** T-20-01 · **User Story:** US-20 · **Change:** `t-20-01-configurar-vitest-cobertura` · **Rama:** `feature/T-20-01-configurar-vitest-cobertura`
**Pasos aplicables:** unit=sí (existen) · curl=N/A · e2e=N/A · docs=sí si cambia setup

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe (local/remoto): `git branch --list "feature/T-20-01-configurar-vitest-cobertura"` y `git branch -r --list "origin/feature/T-20-01-configurar-vitest-cobertura"`
- [x] 0.3 `git checkout -b feature/T-20-01-configurar-vitest-cobertura`
- [x] 0.4 `git branch --show-current`

## 1. Instalar dependencia de cobertura

- [x] 1.1 Instalar `@vitest/coverage-v8` como devDependency: `npm install -D @vitest/coverage-v8`
- [x] 1.2 Verificar que la versión instalada es compatible con vitest v4 (`npm ls @vitest/coverage-v8`)

## 2. Configurar cobertura en vitest.config.ts

- [x] 2.1 Añadir sección `coverage` en `vitest.config.ts`: proveedor `v8`, directorio de salida `coverage/`, reporters `['text', 'html', 'lcov']`
- [x] 2.2 Configurar `coverage.include` para abarcar `frontend/src/domain/**` y `backend/src/domain/**`
- [x] 2.3 Configurar `coverage.thresholds` con 80% en líneas para los directorios de dominio

## 3. Añadir script test:coverage

- [x] 3.1 Añadir script `"test:coverage": "vitest run --coverage"` en `package.json`
- [x] 3.2 Verificar que los scripts `test` y `test:watch` ya existen y son correctos

## 4. Verificar .gitignore

- [x] 4.1 Confirmar que `coverage/` está en `.gitignore`; añadir si falta

## 5. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 5.1 Ejecutar `npm run test` — todos los tests DEBEN pasar (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)
- [x] 5.2 Ejecutar `npm run test:coverage` — DEBE generar directorio `coverage/` con reportes (OBLIGATORIO — EL AGENTE DEBE EJECUTAR)
- [x] 5.3 Verificar que la cobertura reportada de `frontend/src/domain/` y `backend/src/domain/` aparece en el output
- [x] 5.4 Ejecutar `npm run test:watch` brevemente y confirmar que inicia en modo watch
- [x] 5.5 Crear informe en `openspec/changes/t-20-01-configurar-vitest-cobertura/reports/YYYY-MM-DD-step-05-verification.md`

## 6. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 6.1 Actualizar sección "Pruebas" en `docs/development_guide.md` para reflejar que Vitest + cobertura están configurados y documentar los tres scripts (`test`, `test:watch`, `test:coverage`)

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
