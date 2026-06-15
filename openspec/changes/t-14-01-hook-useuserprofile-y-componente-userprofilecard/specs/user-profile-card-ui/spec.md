## ADDED Requirements

### Requirement: Carga del perfil de usuario vía hook

El hook `useUserProfile` SHALL gestionar los estados `loading`, `user` (datos del perfil, incluyendo `avatarUrl`) y `error` al obtener el perfil mediante `fetchUserProfile()` (`GET /api/profile`).

#### Scenario: Carga exitosa del perfil
- **WHEN** `fetchUserProfile()` responde `200` con `{ id, name: "Ana García", email: "ana@ejemplo.com", avatarUrl: null }`
- **THEN** `useUserProfile` expone `loading=false`, `user` con `name`, `email` y `avatarUrl: null`, y `error=null`

#### Scenario: Error de API al cargar el perfil
- **WHEN** `fetchUserProfile()` responde con error (p. ej. `503` o fallo de red)
- **THEN** `useUserProfile` expone `loading=false`, `user=null` y `error` con un mensaje no vacío

### Requirement: Tarjeta de perfil — estado de carga (skeleton)

`UserProfileCard` SHALL mostrar un skeleton de carga mientras `useUserProfile` reporta `loading=true`, sin mostrar valores vacíos ni `undefined`.

#### Scenario: Skeleton durante la carga
- **WHEN** `useUserProfile` reporta `loading=true`
- **THEN** `UserProfileCard` renderiza un skeleton (placeholders) en lugar del nombre, email y avatar
- **AND** no se muestra ningún texto vacío ni la cadena `"undefined"`

### Requirement: Tarjeta de perfil — estado de error

`UserProfileCard` SHALL mostrar el texto "Usuario desconocido" de forma no intrusiva cuando `useUserProfile` reporta un `error`, sin bloquear el resto del dashboard.

#### Scenario: Error de API al mostrar la tarjeta
- **WHEN** `useUserProfile` reporta `loading=false`, `user=null` y `error` no nulo
- **THEN** `UserProfileCard` muestra el texto "Usuario desconocido"
- **AND** el componente no lanza excepciones ni impide el renderizado del resto de la aplicación

### Requirement: Tarjeta de perfil — datos del usuario y fallback de nombre

Cuando la carga es exitosa, `UserProfileCard` SHALL mostrar el `name` y `email` del usuario; si `name` es `null`, SHALL mostrar el `email` como nombre visible.

#### Scenario: Perfil con nombre definido
- **WHEN** `useUserProfile` reporta `user = { id, name: "Ana García", email: "ana@ejemplo.com", avatarUrl: null }` y `error=null`
- **THEN** `UserProfileCard` muestra "Ana García" y "ana@ejemplo.com"

#### Scenario: Perfil sin nombre configurado
- **WHEN** `useUserProfile` reporta `user = { id, name: null, email: "ana@ejemplo.com", avatarUrl: null }` y `error=null`
- **THEN** `UserProfileCard` muestra "ana@ejemplo.com" como nombre visible
- **AND** no se produce ninguna excepción JavaScript por acceder a `name.split()` u operación similar sobre `null`

### Requirement: Tarjeta de perfil — avatar con fallback de iniciales

`UserProfileCard` SHALL renderizar la imagen de `avatarUrl` cuando no sea `null`; en caso contrario SHALL renderizar un avatar con las iniciales derivadas del nombre visible (`name`, o `email` si `name` es `null`).

#### Scenario: Avatar con URL disponible
- **WHEN** `useUserProfile` reporta `user.avatarUrl = "https://example.com/avatar.png"`
- **THEN** `UserProfileCard` renderiza una imagen de avatar con esa URL

#### Scenario: Avatar sin URL — fallback de iniciales
- **WHEN** `useUserProfile` reporta `user.avatarUrl = null` y `user.name = "Ana García"`
- **THEN** `UserProfileCard` renderiza un avatar con las iniciales "AG" (derivadas del nombre)

#### Scenario: Avatar sin URL y sin nombre — iniciales desde email
- **WHEN** `useUserProfile` reporta `user.avatarUrl = null` y `user.name = null`, con `user.email = "ana@ejemplo.com"`
- **THEN** `UserProfileCard` renderiza un avatar con iniciales derivadas del email (p. ej. "A")
