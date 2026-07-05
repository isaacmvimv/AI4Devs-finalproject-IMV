## ADDED Requirements

### Requirement: Dockerfile multi-stage para build del frontend

El frontend DEBE tener un `frontend/Dockerfile` con al menos dos stages: `builder` (generación del bundle Vite) y `runner` (servidor nginx que sirve los estáticos).

#### Scenario: Build exitoso de la imagen Docker

- **WHEN** se ejecuta `docker build -f frontend/Dockerfile . -t ConRutina-web` desde la raíz del monorepo
- **THEN** la imagen se construye sin errores
- **AND** el stage runner está basado en `nginx:alpine`

#### Scenario: Stage builder genera el bundle Vite

- **WHEN** se ejecuta el stage `builder`
- **THEN** se ejecuta `npm ci` para instalar dependencias
- **AND** se ejecuta `npm run build` (Vite) que genera el directorio `frontend/dist/`
- **AND** el directorio `frontend/dist/` contiene `index.html` y assets estáticos

#### Scenario: Stage runner sirve estáticos sin código fuente

- **WHEN** se construye el stage `runner`
- **THEN** los archivos de `frontend/dist/` se copian a `/usr/share/nginx/html`
- **AND** la imagen NO contiene código fuente TypeScript, `node_modules` ni herramientas de build

### Requirement: nginx configurado para SPA y proxy de API

El contenedor DEBE incluir un `frontend/nginx.conf` montado o copiado en la imagen con soporte para rutas del lado del cliente y proxy inverso hacia el backend.

#### Scenario: Rutas SPA con try_files

- **WHEN** nginx recibe una petición GET a una ruta del cliente que no corresponde a un archivo estático existente
- **THEN** nginx responde con `index.html` (directiva `try_files`)
- **AND** la SPA puede renderizar la ruta en el navegador

#### Scenario: Proxy de peticiones API al servicio backend

- **WHEN** nginx recibe una petición cuya ruta comienza con `/api`
- **THEN** nginx reenvía la petición a `http://api:3001` mediante `proxy_pass`
- **AND** las cabeceras de host y forwarding se preservan para que Express procese la petición correctamente

#### Scenario: Puerto de escucha del contenedor web

- **WHEN** el contenedor `web` arranca en el stack de producción
- **THEN** nginx escucha en el puerto 80
- **AND** los archivos estáticos son accesibles desde ese puerto

### Requirement: Contexto de build desde la raíz del monorepo

El Dockerfile DEBE construirse con contexto `.` (raíz del monorepo), igual que el Dockerfile del backend.

#### Scenario: Build con contexto monorepo

- **WHEN** se ejecuta `docker build -f frontend/Dockerfile .`
- **THEN** el Dockerfile copia `package.json`, `package-lock.json`, `vite.config.ts`, `frontend/` y archivos de configuración necesarios desde la raíz
- **AND** el build no requiere artefactos pregenerados en el host
