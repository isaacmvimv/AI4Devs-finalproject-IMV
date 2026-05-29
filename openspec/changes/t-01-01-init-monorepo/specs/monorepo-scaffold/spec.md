# monorepo-scaffold

Especificación derivada del ticket **T-01-01** y escenarios relevantes de **US-01**.

## ADDED Requirements

### Requirement: Repositorio Git inicializado con estructura monorepo

El repositorio ConRutina MUST estar bajo control de versiones Git y MUST exponer en la raíz los directorios `frontend/` y `backend/` como subproyectos del monorepo.

#### Scenario: Estructura de directorios presente

- **WHEN** un desarrollador inspecciona la raíz del repositorio clonado
- **THEN** existe el directorio `frontend/` con código de la aplicación React
- **AND** existe el directorio `backend/` con código del API Express
- **AND** existe el fichero `LICENSE` con licencia MIT en la raíz

### Requirement: Exclusiones de control de versiones

El fichero `.gitignore` en la raíz MUST excluir del seguimiento Git los patrones definidos en el DoD del ticket.

#### Scenario: Patrones obligatorios en .gitignore

- **WHEN** se revisa `.gitignore` en la raíz
- **THEN** incluye la exclusión de `node_modules/`
- **AND** incluye la exclusión de `dist/`
- **AND** incluye la exclusión de `.env`
- **AND** incluye la exclusión de `coverage/`
- **AND** incluye la exclusión de `*.local`

### Requirement: Scripts npm raíz para desarrollo y calidad

El `package.json` raíz MUST definir los scripts `dev`, `build`, `test` y `lint` ejecutables desde la raíz del monorepo.

#### Scenario: Scripts declarados en package.json

- **WHEN** se lee `package.json` en la raíz
- **THEN** el script `dev` está definido
- **AND** el script `build` está definido
- **AND** el script `test` está definido
- **AND** el script `lint` está definido

#### Scenario: Instalación limpia sin errores

- **WHEN** un desarrollador clona el repositorio por primera vez
- **AND** ejecuta `npm install` en la raíz
- **THEN** todas las dependencias se instalan sin errores ni conflictos fatales

### Requirement: Arranque simultáneo frontend y backend con npm run dev

El script `dev` MUST arrancar el servidor de desarrollo del frontend (Vite) y el servidor del backend (Express vía `tsx watch`) de forma concurrente en un único comando desde la raíz.

#### Scenario: Happy path — desarrollo local en un comando

- **WHEN** un desarrollador ejecuta `npm run dev` tras `npm install`
- **THEN** el frontend queda accesible en el puerto de desarrollo de Vite (por defecto 5173)
- **AND** el backend queda escuchando en el puerto configurado para la API (por defecto 3001)
- **AND** ambos procesos permanecen activos en la misma sesión de terminal

#### Scenario: Edge case — puerto ocupado

- **WHEN** el puerto del frontend o del backend ya está en uso por otro proceso
- **AND** el desarrollador ejecuta `npm run dev`
- **THEN** el proceso falla con un mensaje de error explícito que indica el conflicto de puerto
- **AND** el fallo no es silencioso (código de salida distinto de 0 o mensaje visible en consola)

### Requirement: Workspace del monorepo

El proyecto MUST declarar un workspace de paquetes compatible con pnpm en la raíz del repositorio.

#### Scenario: Configuración de workspace presente

- **WHEN** se inspecciona la raíz del repositorio
- **THEN** existe `pnpm-workspace.yaml` (o configuración de workspace equivalente documentada)
- **AND** el workspace incluye la raíz del monorepo como paquete participante

### Requirement: Documentación mínima de arranque

El fichero `README.md` en la raíz MUST incluir las secciones mínimas para que un desarrollador nuevo pueda poner en marcha el proyecto.

#### Scenario: Secciones obligatorias del README

- **WHEN** se lee `README.md` en la raíz
- **THEN** contiene una sección de descripción del proyecto
- **AND** contiene una sección de requisitos previos
- **AND** contiene una sección de instalación
- **AND** contiene una sección de arranque en desarrollo
- **AND** documenta que `npm run dev` levanta frontend y backend simultáneamente
