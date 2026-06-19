## ADDED Requirements

### Requirement: POST /api/habits crea hábito con body válido

El sistema DEBE tener un test de integración que verifique que `POST /api/habits` con body válido contra BD real crea el hábito y devuelve HTTP 201.

#### Scenario: Happy path — body válido

- **WHEN** existe un usuario con id=1 en la BD de test
- **AND** se hace `POST /api/habits` con `{ "emoji": "💪", "name": "Ejercicio", "pointsPerDay": 10, "penalty": 5 }`
- **THEN** la respuesta es HTTP 201
- **AND** el body contiene el hábito creado con `id`, `name`, `emoji`, `pointsPerDay`, `penalty`, `isActive: true`

### Requirement: POST /api/habits rechaza body inválido con 400

El sistema DEBE tener un test de integración que verifique que `POST /api/habits` con body inválido devuelve HTTP 400.

#### Scenario: Edge — body inválido (falta name)

- **WHEN** existe un usuario con id=1 en la BD de test
- **AND** se hace `POST /api/habits` con `{ "emoji": "💪", "pointsPerDay": 10, "penalty": 5 }` (sin `name`)
- **THEN** la respuesta es HTTP 400
- **AND** el body contiene `code: "VALIDATION_ERROR"`
