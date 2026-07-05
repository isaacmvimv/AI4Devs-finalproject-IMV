## Requirements

### Requirement: Cliente HTTP `apiRequest` con errores tipados `ApiError`
`httpClient.ts` SHALL exponer un helper `apiRequest<T>(method, path, body?)` que realice peticiones a `/api` + `path` con los verbos `GET`, `POST`, `PATCH`, `DELETE`, y SHALL lanzar una instancia de `ApiError { status, code, message, details? }` cuando la respuesta HTTP no sea 2xx, parseando el cuerpo `ApiErrorResponse` (`{code, message, details?}`) devuelto por el backend.

#### Scenario: Respuesta de error con código y detalles
- **WHEN** el backend responde con status `400` y cuerpo `{code: "VALIDATION_ERROR", message: "Datos inválidos", details: [...]}`
- **THEN** `apiRequest` lanza `ApiError` con `status=400`, `code="VALIDATION_ERROR"`, `message="Datos inválidos"` y `details` igual al array recibido

#### Scenario: Fallo de red sin respuesta del servidor
- **WHEN** `fetch` rechaza la promesa (servidor no disponible)
- **THEN** `apiRequest` lanza `ApiError` con `status=0` y un `code`/`message` que indiquen falta de conexión

#### Scenario: Respuesta `204 No Content`
- **WHEN** el backend responde `204` sin cuerpo (p. ej. `DELETE /api/habits/:id`)
- **THEN** `apiRequest` no intenta parsear JSON y resuelve sin error

### Requirement: `fetchHabits` obtiene la lista de hábitos
`frontend/src/infrastructure/habitApi.ts` SHALL exponer `fetchHabits(): Promise<HabitApiDto[]>` que realiza `GET /api/habits` y devuelve el array de hábitos del usuario.

#### Scenario: Listado correcto de hábitos
- **WHEN** se llama a `fetchHabits()` y el backend responde `200` con un array de hábitos
- **THEN** la función resuelve con ese array, preservando `id, userId, emoji, name, pointsPerDay, penalty, isActive, createdAt`

### Requirement: `createHabit` crea un nuevo hábito
`habitApi.ts` SHALL exponer `createHabit(input: CreateHabitInput): Promise<HabitApiDto>` que realiza `POST /api/habits` con `{emoji, name, pointsPerDay, penalty}` y devuelve el hábito creado.

#### Scenario: Creación correcta de hábito
- **WHEN** se llama a `createHabit({emoji:"🧘", name:"Meditar", pointsPerDay:10, penalty:5})` y el backend responde `201` con el `HabitApi` creado
- **THEN** la función resuelve con el hábito creado, incluyendo su `id` asignado por el backend

#### Scenario: Error de validación al crear hábito
- **WHEN** se llama a `createHabit` con datos inválidos (p. ej. nombre vacío) y el backend responde `400` con `{code: "VALIDATION_ERROR", details: [...]}`
- **THEN** `createHabit` propaga un `ApiError` con `code="VALIDATION_ERROR"` y `details` con los campos inválidos

### Requirement: `deleteHabit` elimina un hábito
`habitApi.ts` SHALL exponer `deleteHabit(id: number): Promise<void>` que realiza `DELETE /api/habits/:id`.

#### Scenario: Eliminación correcta de hábito
- **WHEN** se llama a `deleteHabit(id)` y el backend responde `204`
- **THEN** la función resuelve sin valor (`void`) y sin error

#### Scenario: Hábito inexistente
- **WHEN** se llama a `deleteHabit(id)` y el backend responde `404` con `{code: "HABIT_NOT_FOUND"}`
- **THEN** `deleteHabit` propaga un `ApiError` con `code="HABIT_NOT_FOUND"`

### Requirement: `updateHabitEntry` actualiza el estado de una entrada diaria
`frontend/src/infrastructure/habitEntryApi.ts` SHALL exponer `updateHabitEntry(entryId: number, status: 'pending'|'completed'|'failed'): Promise<HabitEntryApiDto>` que realiza `PATCH /api/habit-entries/:id` con `{status}` y devuelve la entrada actualizada (`id, status, updatedAt`).

#### Scenario: Actualización correcta de entrada
- **WHEN** se llama a `updateHabitEntry(entryId, "completed")` y el backend responde `200` con `{id, status:"completed", updatedAt}`
- **THEN** la función resuelve con esa entrada actualizada

#### Scenario: Semana bloqueada (WEEK_LOCKED)
- **WHEN** se llama a `updateHabitEntry(entryId, status)` sobre una entrada de una semana bloqueada y el backend responde `409` con `{code: "WEEK_LOCKED", message: "No se puede modificar una semana bloqueada"}`
- **THEN** `updateHabitEntry` propaga un `ApiError` con `status=409` y `code="WEEK_LOCKED"`, permitiendo a la capa de aplicación hacer rollback del optimistic update y mostrar el mensaje
