# user-profile-read

Lectura de perfil de usuario en capas dominio, aplicación e infraestructura (T-06-01 / US-06).

## ADDED Requirements

### Requirement: UserProfile entity shape

The system SHALL define a `UserProfile` type in `backend/src/domain/userProfile.ts` with fields `id: number`, `name: string | null`, `email: string`, and `avatarUrl: string | null`.

#### Scenario: Profile DTO includes avatar when present in database

- **WHEN** a user row exists with `avatarUrl` set in PostgreSQL
- **AND** `UserReadRepository.findById` is invoked for that user's id
- **THEN** the returned `UserProfile` SHALL include the same `avatarUrl` value

#### Scenario: Profile DTO exposes null avatar when absent

- **WHEN** a user row exists with `avatarUrl` null in PostgreSQL
- **AND** `UserReadRepository.findById` is invoked for that user's id
- **THEN** the returned `UserProfile` SHALL include `avatarUrl: null`

### Requirement: User read port

The system SHALL expose `UserReadRepository` in `backend/src/application/ports/UserReadRepository.ts` with method `findById(id: number): Promise<UserProfile | null>`.

#### Scenario: Port returns null when user does not exist

- **WHEN** no user row matches the requested id
- **AND** `findById` is called through `UserReadRepository`
- **THEN** the method SHALL resolve to `null` without throwing

### Requirement: Prisma user read repository

The system SHALL implement `UserReadRepository` in `backend/src/infrastructure/prismaUserRepository.ts` using `prisma.user.findUnique({ where: { id } })` and map Prisma fields to `UserProfile`.

#### Scenario: Successful mapping from Prisma user row

- **WHEN** `prisma.user.findUnique` returns a user with `id`, `name`, `email`, and `avatarUrl`
- **THEN** `createPrismaUserRepository(...).findById(id)` SHALL return a `UserProfile` with matching `id`, `name`, `email`, and `avatarUrl`

#### Scenario: Nullable name preserved

- **WHEN** the user row has `name: null`
- **THEN** the mapped `UserProfile` SHALL include `name: null` (US-06 Scenario 2 — domain layer)

### Requirement: Get user profile use case

The system SHALL provide `getUserProfileById(repo: UserReadRepository, id: number): Promise<UserProfile>` in `backend/src/application/getUserProfile.ts` that delegates to the repository and enforces existence.

#### Scenario: Happy path returns profile DTO

- **WHEN** `UserReadRepository.findById` resolves to a `UserProfile`
- **AND** `getUserProfileById` is called with the same id
- **THEN** the use case SHALL return the same DTO to the caller (US-06 Scenario 1 — application layer)

#### Scenario: Missing user throws NotFoundError

- **WHEN** `UserReadRepository.findById` resolves to `null`
- **AND** `getUserProfileById` is called
- **THEN** the use case SHALL throw `NotFoundError` with code `USER_NOT_FOUND` and message `Usuario no encontrado` (US-06 Scenario 3 — application layer)

### Requirement: Unit tests for getUserProfileById

The system SHALL include Vitest tests in `backend/src/application/getUserProfile.test.ts` covering happy path, not-found error, and field mapping with a mocked `UserReadRepository`.

#### Scenario: Test suite validates repository delegation

- **WHEN** the unit tests run with `npm test`
- **THEN** `getUserProfile.test.ts` SHALL pass for mocked happy path and `NotFoundError` cases aligned with the ticket DoD
