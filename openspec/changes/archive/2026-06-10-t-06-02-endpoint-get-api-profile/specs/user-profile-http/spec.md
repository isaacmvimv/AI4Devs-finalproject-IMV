# user-profile-http

Exposición HTTP del perfil de usuario (`GET /api/profile`) — T-06-02 / US-06.

## ADDED Requirements

### Requirement: GET /api/profile route registered

The system SHALL register `GET /api/profile` in `backend/src/presentation/http/createApp.ts`, wrapped with `asyncHandler`, invoking `getUserProfileById(userRepository, 1)` with hardcoded user id `1` for MVP.

#### Scenario: Route is reachable

- **WHEN** an HTTP client sends `GET /api/profile` to the Express application
- **THEN** the request is handled by the profile route handler (not 404 from Express router)

### Requirement: Successful profile response

The system SHALL respond with HTTP `200` and JSON body `{ id, name, email, avatarUrl }` when `getUserProfileById` returns a `UserProfile` (US-06 Scenario 1).

#### Scenario: Happy path returns full profile DTO

- **WHEN** `getUserProfileById` resolves to `{ id: 1, name: "Ana", email: "ana@ejemplo.com", avatarUrl: null }`
- **AND** a client sends `GET /api/profile`
- **THEN** the response status is `200`
- **AND** the response body equals `{ id: 1, name: "Ana", email: "ana@ejemplo.com", avatarUrl: null }`

#### Scenario: Profile with null name preserved in response

- **WHEN** `getUserProfileById` resolves to a profile with `name: null`
- **AND** a client sends `GET /api/profile`
- **THEN** the response status is `200`
- **AND** the response body includes `name: null` (US-06 Scenario 2 — HTTP layer; no email fallback in API)

#### Scenario: Profile includes avatarUrl when present

- **WHEN** `getUserProfileById` resolves to a profile with `avatarUrl` set
- **AND** a client sends `GET /api/profile`
- **THEN** the response status is `200`
- **AND** the response body includes the same `avatarUrl` value

### Requirement: User not found error response

The system SHALL propagate `NotFoundError` from `getUserProfileById` through `asyncHandler` to `errorHandler`, responding with HTTP `404` and body `{ code: "USER_NOT_FOUND", message: "Usuario no encontrado" }` (US-06 Scenario 3).

#### Scenario: Missing user returns structured 404

- **WHEN** `getUserProfileById` throws `NotFoundError` with message `Usuario no encontrado`
- **AND** a client sends `GET /api/profile`
- **THEN** the response status is `404`
- **AND** the response body is `{ code: "USER_NOT_FOUND", message: "Usuario no encontrado" }`

#### Scenario: No legacy error format on 404

- **WHEN** the user does not exist
- **AND** a client sends `GET /api/profile`
- **THEN** the response body SHALL NOT use the legacy `{ error: "..." }` shape

### Requirement: HTTP unit tests for GET /api/profile

The system SHALL include Vitest tests using supertest (or equivalent in-memory HTTP client) with mocked `getUserProfileById` or `UserReadRepository`, covering happy path and not-found cases aligned with the ticket DoD.

#### Scenario: Test suite validates 200 response

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `GET /api/profile` returns `200` with `{ id, name, email, avatarUrl }` when the use case succeeds

#### Scenario: Test suite validates 404 response

- **WHEN** the HTTP tests run with `npm test`
- **THEN** a test asserts `GET /api/profile` returns `404` with `{ code: "USER_NOT_FOUND", message: "Usuario no encontrado" }` when the use case throws `NotFoundError`
