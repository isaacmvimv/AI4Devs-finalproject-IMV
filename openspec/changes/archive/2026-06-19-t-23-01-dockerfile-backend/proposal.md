# Proposal — T-23-01 · Dockerfile multi-stage para el backend

**Ticket:** T-23-01 · **User Story:** US-23 · **Sprint:** 5

## Why

El proyecto ConRutina necesita un Dockerfile de producción para el backend que permita desplegar la API Express de forma reproducible y eficiente. Sin este artefacto, no es posible orquestar el stack completo con `docker-compose.prod.yml` (T-23-03) ni configurar el pipeline de CI/CD (T-23-04). El Dockerfile multi-stage garantiza imágenes mínimas (node:20-alpine) y ejecuta las migraciones Prisma automáticamente al arrancar.

## What Changes

- Crear `backend/Dockerfile` con build multi-stage (builder + runner).
- Stage `builder`: instala dependencias, compila TypeScript con `tsc`, genera el cliente Prisma.
- Stage `runner`: imagen `node:20-alpine`, copia solo `dist/`, `node_modules` de producción y `prisma/` (schema + migraciones).
- Entrypoint ejecuta `prisma migrate deploy` antes de arrancar el servidor (`node dist/main.js`).
- Imagen final < 200 MB.

## Capabilities

### New Capabilities

- `docker-backend-build`: Dockerfile multi-stage para compilar y empaquetar el backend Express/Prisma en una imagen de producción optimizada.

### Modified Capabilities

_(ninguna)_

## Non-goals

- No se crea el Dockerfile del frontend (T-23-02).
- No se crea `docker-compose.prod.yml` (T-23-03).
- No se configura CI/CD (T-23-04).
- No se modifica el `docker-compose.yml` de desarrollo existente.
- No se implementa autenticación real ni HTTPS en el contenedor.

## Impact

- **Archivos nuevos:** `backend/Dockerfile`.
- **Dependencias:** ninguna nueva; usa `node:20-alpine` como imagen base.
- **Documentación:** actualizar `development_guide.md` con instrucciones de build Docker del backend.

## Acceptance Criteria (referencia)

Derivados del Gherkin de US-23, Scenario 1:

```gherkin
Given existe "backend/Dockerfile" multi-stage
When se construye la imagen: "docker build -f backend/Dockerfile . -t ConRutina-api"
Then la imagen se construye sin errores
And arranca el servidor y ejecuta "prisma migrate deploy" antes de escuchar peticiones
And la imagen usa node:20-alpine (imagen mínima)
```
