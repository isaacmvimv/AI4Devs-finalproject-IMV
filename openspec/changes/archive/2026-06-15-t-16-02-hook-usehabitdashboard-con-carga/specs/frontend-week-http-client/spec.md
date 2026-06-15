## ADDED Requirements

### Requirement: `fetchCurrentWeek` obtiene la semana activa
`frontend/src/infrastructure/weekApi.ts` SHALL exponer `fetchCurrentWeek(): Promise<WeekResponseDto>` que realiza `GET /api/weeks/current` y devuelve el payload `WeekResponse` (`week`, `habits` con `weekHabit`+`entries`, `stats`, `redemptions`) tal como define `docs/api-spec.yml`.

#### Scenario: Carga correcta de la semana activa
- **WHEN** se llama a `fetchCurrentWeek()` y el backend responde `200` con un `WeekResponse`
- **THEN** la función resuelve con ese objeto, preservando `week.id`, `week.isLocked`, `week.totalPointsEarned`, `week.totalPenalties`, el array `habits` (cada elemento con `weekHabit` y `entries` de 7 días) y `stats`

#### Scenario: Error interno del servidor
- **WHEN** se llama a `fetchCurrentWeek()` y el backend responde `500` con `{code, message}`
- **THEN** `fetchCurrentWeek` propaga un `ApiError` con `status=500` y el `code`/`message` recibidos

### Requirement: `fetchWeekByOffset` obtiene una semana por desplazamiento
`weekApi.ts` SHALL exponer `fetchWeekByOffset(offset: number): Promise<WeekResponseDto>` que realiza `GET /api/weeks?offset=<offset>` y devuelve el mismo payload `WeekResponse` que `fetchCurrentWeek` para `offset=0`.

#### Scenario: Semana histórica encontrada
- **WHEN** se llama a `fetchWeekByOffset(-1)` y el backend responde `200` con un `WeekResponse` de una semana bloqueada (`week.isLocked=true`)
- **THEN** la función resuelve con ese `WeekResponse`

#### Scenario: Semana no encontrada en el offset solicitado
- **WHEN** se llama a `fetchWeekByOffset(offset)` y el backend responde `404` con `{code: "WEEK_NOT_FOUND"}`
- **THEN** `fetchWeekByOffset` propaga un `ApiError` con `status=404` y `code="WEEK_NOT_FOUND"`
