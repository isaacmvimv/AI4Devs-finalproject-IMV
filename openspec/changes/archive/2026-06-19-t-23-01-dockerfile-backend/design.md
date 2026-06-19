# Design — T-23-01 · Dockerfile multi-stage para el backend

**Ticket:** T-23-01 · **User Story:** US-23

## Context

El backend de ConRutina es una API Express + Prisma escrita en TypeScript. En desarrollo se ejecuta con `tsx watch` (sin compilación previa). Para producción se necesita compilar a JavaScript con `tsc` y empaquetar en una imagen Docker mínima.

Estado actual del backend:
- `backend/tsconfig.json`: `target: ES2022`, `module: ESNext`, `moduleResolution: bundler`.
- `package.json` raíz: `"type": "module"`, dependencias mixtas (dev + prod).
- Prisma schema en `backend/prisma/schema.prisma`, migraciones en `backend/prisma/migrations/`.
- Imports usan extensión `.js` (convención ESM).
- No existe script `build` para el backend ni `backend/Dockerfile`.

## Goals / Non-Goals

**Goals:**
- Imagen Docker de producción funcional, mínima y reproducible para el backend.
- Migraciones Prisma automáticas al arrancar el contenedor.
- Compilación TypeScript dentro del build Docker (sin depender de artefactos locales).

**Non-Goals:**
- Dockerfile del frontend (T-23-02).
- docker-compose de producción (T-23-03).
- Pipeline CI/CD (T-23-04).
- Configuración de HTTPS o reverse proxy.
- Healthcheck de Docker (se añadirá en docker-compose.prod.yml).

## Decisions

### D1 — Imagen base: `node:20-alpine`

**Elección:** `node:20-alpine` para ambos stages.
**Alternativa descartada:** `node:20-slim` (Debian-based, ~80 MB más grande).
**Razón:** Alpine produce imágenes más pequeñas. Prisma publica binarios precompilados para `linux-musl` (Alpine), por lo que no hay incompatibilidad.

### D2 — Compilación con `tsc` en stage builder

**Elección:** Compilar con `tsc -p backend/tsconfig.json` dentro del contenedor. Crear un `backend/tsconfig.build.json` que extienda el tsconfig existente añadiendo `outDir: "./dist"` y `rootDir: "./src"`.
**Alternativa descartada:** Usar `tsx` en producción (sin compilar). Más pesado, más lento en arranque, no recomendado para producción.
**Razón:** `tsc` genera JavaScript estático que Node.js ejecuta directamente, sin overhead de transpilación en caliente.

### D3 — Prisma en el runner

**Elección:** Copiar `backend/prisma/` (schema + migraciones) al runner. Instalar `@prisma/client` como dependencia de producción y ejecutar `prisma generate` en el stage runner para generar el cliente nativo de la plataforma destino (linux-musl/alpine).
**Alternativa descartada:** Generar el cliente en el builder y copiarlo. Puede fallar si la plataforma del builder difiere de la del runner.
**Razón:** `prisma generate` en el runner asegura que los binarios nativos del engine coincidan con el sistema operativo final.

### D4 — Entrypoint con shell script inline

**Elección:** `CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]`.
**Alternativa descartada:** Script separado `docker-entrypoint.sh`. Más archivos por un solo comando simple.
**Razón:** El comando es suficientemente corto para un CMD inline. Si falla la migración, `&&` impide que arranque el servidor.

### D5 — Context de build = raíz del monorepo

**Elección:** El Dockerfile se ejecuta con context `.` (raíz), no `backend/`. El `COPY` referencia `backend/` y `package.json` raíz.
**Razón:** El `package.json` raíz define las dependencias del monorepo y la configuración de Prisma (`prisma.schema`). El `tsconfig.json` raíz es referenciado por `backend/tsconfig.json` vía `extends`.

## Risks / Trade-offs

- **[Prisma binaries en Alpine]** → Prisma soporta `linux-musl` oficialmente; si falla, cambiar a `node:20-slim`. Mitigación: verificar build en CI.
- **[Tamaño > 200 MB]** → Si `node_modules` de producción es demasiado grande, se puede usar `npm prune --omit=dev` tras la instalación. Mitigación: verificar tamaño de imagen tras build.
- **[tsconfig.build.json nuevo]** → Añade un archivo extra, pero evita modificar el tsconfig de desarrollo. Trade-off aceptable.

## Open Questions

_(ninguna — el alcance es claro y las decisiones técnicas están validadas por el estado del repo)_
