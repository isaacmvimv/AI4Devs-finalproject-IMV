## ADDED Requirements

### Requirement: Dockerfile multi-stage para compilación del backend

El backend DEBE tener un `backend/Dockerfile` con al menos dos stages: `builder` (compilación TypeScript) y `runner` (ejecución en producción con imagen mínima).

#### Scenario: Build exitoso de la imagen Docker

- **WHEN** se ejecuta `docker build -f backend/Dockerfile . -t ConRutina-api`
- **THEN** la imagen se construye sin errores
- **AND** el resultado es una imagen funcional basada en `node:20-alpine`

#### Scenario: Stage builder compila TypeScript

- **WHEN** se ejecuta el stage `builder`
- **THEN** se instalan todas las dependencias (incluyendo devDependencies)
- **AND** se ejecuta `tsc` para compilar el código fuente a `dist/`
- **AND** se genera el cliente Prisma con `prisma generate`

#### Scenario: Stage runner contiene solo lo necesario

- **WHEN** se construye el stage `runner`
- **THEN** la imagen contiene `dist/` (código compilado), `node_modules` de producción y `prisma/` (schema + migraciones)
- **AND** NO contiene código fuente TypeScript, devDependencies ni herramientas de build

### Requirement: Entrypoint ejecuta migraciones antes de arrancar

El entrypoint del contenedor DEBE ejecutar `prisma migrate deploy` antes de iniciar el servidor Node.js.

#### Scenario: Arranque con migración automática

- **WHEN** se inicia el contenedor con `docker run ConRutina-api`
- **THEN** se ejecuta `npx prisma migrate deploy` primero
- **AND** tras completar las migraciones, se inicia `node dist/main.js`

#### Scenario: Fallo en migración detiene el arranque

- **WHEN** se inicia el contenedor y `prisma migrate deploy` falla (p. ej. BD inaccesible)
- **THEN** el contenedor sale con código de error distinto de 0
- **AND** NO se inicia el servidor Node.js

### Requirement: Imagen final optimizada en tamaño

La imagen de producción DEBE ser lo más ligera posible.

#### Scenario: Tamaño de imagen menor a 200 MB

- **WHEN** se construye la imagen final
- **THEN** el tamaño total de la imagen es menor a 200 MB
