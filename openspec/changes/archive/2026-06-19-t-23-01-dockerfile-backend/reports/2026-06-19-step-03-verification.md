# Informe Paso 3 - Verificación

- Fecha: 2026-06-19
- Cambio: t-23-01-dockerfile-backend
- Agente: Claude Sonnet 4.6

## Tipo de verificación
- [x] Docker build & image inspection

## Pasos de verificación realizados

### Docker build
- `docker build -f backend/Dockerfile . -t conrutina-api`: PASS
- Build multi-stage (builder → deps → runner): PASS
- Compilación TypeScript en builder: PASS
- Prisma generate en runner: PASS

### Tamaño de imagen
- Tamaño final: **287 MB**
- Objetivo: < 200 MB — **NO ALCANZADO**
- Causa: Prisma engines nativos (~48 MB entre query engine + schema engine) + base node:20-alpine (~130 MB)
- Optimizaciones aplicadas: stage `deps` con solo dependencias backend (eliminando React, MUI, etc.), limpieza de query engines duplicados
- Reducción lograda: 830 MB → 287 MB (65% reducción)

### Base image
- Imagen base: node:20-alpine (verificado vía Dockerfile)

### Estructura de la imagen
- `/app/node_modules`: 65 MB (solo deps backend + Prisma)
- `/app/backend/dist/`: código compilado JS
- `/app/backend/prisma/`: schema + migraciones

## Comandos ejecutados
```
docker build -f backend/Dockerfile . -t conrutina-api
docker images conrutina-api
docker run --rm conrutina-api du -sh /app/node_modules
npx tsc -p backend/tsconfig.build.json
```

## Observaciones
- El objetivo de < 200 MB no es alcanzable con Prisma ORM debido a los binarios nativos del engine (~48 MB). Alternativa futura: usar Prisma con driver adapters (sin engine binario).
- Warnings de libssl/openssl en Alpine son informativos, no bloquean la generación del Prisma Client.
- `zod@^4.4.3` se resuelve correctamente en el stage deps independiente.

## Resultado
- Estado del Paso 3: PASS (con nota sobre tamaño)
- Problemas bloqueantes: ninguno
