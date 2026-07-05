## ADDED Requirements

### Requirement: PATCH /api/habit-entries/:id actualiza entrada en semana activa

El sistema DEBE tener un test de integración que verifique que `PATCH /api/habit-entries/:id` con semana no bloqueada actualiza el status y devuelve HTTP 200.

#### Scenario: Happy path — semana activa

- **WHEN** existe una semana no bloqueada con un habit entry en status `pending`
- **AND** se hace `PATCH /api/habit-entries/:id` con `{ "status": "completed" }`
- **THEN** la respuesta es HTTP 200
- **AND** el body contiene `id`, `status: "completed"`, `updatedAt`

### Requirement: PATCH /api/habit-entries/:id rechaza con 409 si semana bloqueada

El sistema DEBE tener un test de integración que verifique que `PATCH /api/habit-entries/:id` con semana bloqueada devuelve HTTP 409.

#### Scenario: Edge — semana bloqueada

- **WHEN** existe una semana con `isLocked: true` y un habit entry
- **AND** se hace `PATCH /api/habit-entries/:id` con `{ "status": "completed" }`
- **THEN** la respuesta es HTTP 409
- **AND** el body contiene `code: "WEEK_LOCKED"`
