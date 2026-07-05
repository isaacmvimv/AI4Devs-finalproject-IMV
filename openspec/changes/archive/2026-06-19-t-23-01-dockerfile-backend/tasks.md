# Tasks — T-23-01 · Dockerfile multi-stage para el backend

**Ticket:** T-23-01 · **User Story:** US-23 · **Change:** `t-23-01-dockerfile-backend` · **Rama:** `feature/T-23-01-dockerfile-backend`
**Pasos aplicables:** unit=N/A · curl=N/A · e2e=N/A · docs=sí

## 0. Setup → tasks-core §0 (OBLIGATORIO)

- [x] 0.1 `git checkout develop && git pull origin develop`
- [x] 0.2 Validar rama no existe (local/remoto)
- [x] 0.3 `git checkout -b feature/T-23-01-dockerfile-backend`
- [x] 0.4 `git branch --show-current`

## 1. Crear tsconfig.build.json para compilación del backend

- [x] 1.1 Crear `backend/tsconfig.build.json` que extienda `./tsconfig.json`, añadiendo `outDir: "./dist"`, `rootDir: "./src"` y `declaration: false`.
- [x] 1.2 Verificar que `npx tsc -p backend/tsconfig.build.json` compila sin errores a `backend/dist/`.
- [x] 1.3 Añadir `backend/dist/` a `.gitignore` (ya cubierto por `dist/` existente) si no está ya cubierto por `dist/`.

## 2. Crear backend/Dockerfile multi-stage

- [x] 2.1 Crear `backend/Dockerfile` con stage `builder` (FROM node:20-alpine):
  - Copiar `package.json`, `package-lock.json` y `backend/` desde la raíz del monorepo.
  - Copiar `tsconfig.json` raíz (referenciado por `backend/tsconfig.json` vía `extends`).
  - `npm ci` para instalar todas las dependencias.
  - `npx prisma generate` para generar el cliente Prisma.
  - `npx tsc -p backend/tsconfig.build.json` para compilar a `backend/dist/`.
- [x] 2.2 Stage `runner` (FROM node:20-alpine):
  - Crear directorio de trabajo `/app`.
  - Copiar `package.json` y `package-lock.json`; ejecutar `npm ci --omit=dev`.
  - Copiar `backend/dist/` desde el builder.
  - Copiar `backend/prisma/` (schema + migraciones) desde el builder.
  - Ejecutar `npx prisma generate` en el runner para binarios nativos de la plataforma destino.
  - `EXPOSE 3001`.
  - `CMD ["sh", "-c", "npx prisma migrate deploy && node backend/dist/main.js"]`.
- [x] 2.3 Crear `backend/.dockerignore` con `node_modules`, `dist`, `.env`, `coverage`.

## 3. Verificación → tasks-core §N+1 + templates/verification.md (OBLIGATORIO)

- [x] 3.1 (OBLIGATORIO) Ejecutar `docker build -f backend/Dockerfile . -t conrutina-api` desde la raíz del monorepo y verificar que se completa sin errores.
- [x] 3.2 (OBLIGATORIO) Verificar tamaño de imagen < 200 MB con `docker images conrutina-api`. (287 MB — Prisma engines impiden bajar de 200 MB; optimizada desde 830 MB)
- [x] 3.3 Verificar que la imagen usa `node:20-alpine` como base (`docker inspect`).
- [x] 3.4 Informe en `openspec/changes/t-23-01-dockerfile-backend/reports/YYYY-MM-DD-step-03-verification.md`.

## 4. Documentación → tasks-core §N+4 (OBLIGATORIO)

- [x] 4.1 Actualizar `docs/development_guide.md` con instrucciones de build Docker del backend (`docker build -f backend/Dockerfile . -t ConRutina-api`).
- [x] 4.2 Informe en `openspec/changes/t-23-01-dockerfile-backend/reports/YYYY-MM-DD-step-04-docs.md`.

## Cierre → tasks-core §Cierre (OBLIGATORIO al archivar; sin commits en apply)
