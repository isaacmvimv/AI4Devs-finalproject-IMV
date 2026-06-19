## ADDED Requirements

### Requirement: GET /api/profile devuelve perfil del usuario existente

El sistema DEBE tener un test de integración que verifique que `GET /api/profile` contra una BD real con un usuario seedeado devuelve HTTP 200 con los campos `id`, `name`, `email` y `avatarUrl`.

#### Scenario: Happy path — usuario existente

- **WHEN** existe un usuario con id=1 en la BD de test
- **AND** se hace `GET /api/profile`
- **THEN** la respuesta es HTTP 200
- **AND** el body contiene `id`, `name`, `email`, `avatarUrl` del usuario seedeado

### Requirement: GET /api/profile devuelve 404 si usuario no existe

El sistema DEBE tener un test de integración que verifique que `GET /api/profile` devuelve HTTP 404 cuando no existe el usuario con id=1 en BD.

#### Scenario: Edge — usuario no existe

- **WHEN** la BD de test está vacía (sin usuarios)
- **AND** se hace `GET /api/profile`
- **THEN** la respuesta es HTTP 404
- **AND** el body contiene `code: "USER_NOT_FOUND"`
