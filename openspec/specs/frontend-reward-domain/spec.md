# Spec — frontend-reward-domain

**Ticket:** T-13-02 · **User Story:** US-13 / US-17 (formulario)

Tipos y factory pura de recompensas en el frontend — mapeo desde input de formulario a entidad de dominio.

## Requirements

### Requirement: Tipos exportables del dominio de recompensas

El módulo `frontend/src/domain/reward.ts` SHALL exportar las interfaces `Reward` (`id`, `emoji`, `name`, `description`, `cost`) y `RewardFormInput` (`emoji`, `name`, `description`, `cost`) sin dependencias externas.

#### Scenario: Importación desde capa application o presentation

- **WHEN** un módulo importa tipos desde `../domain/reward`
- **THEN** la compilación TypeScript completa sin errores
- **AND** no se requiere React, fetch ni librerías de terceros

#### Scenario: Alineación con contrato API

- **WHEN** se compara `Reward` con el schema `Reward` de `docs/api-spec.yml`
- **THEN** los campos `id`, `emoji`, `name`, `description` y `cost` coinciden en nombre y tipo esperado en el cliente (`id` como `string`)

### Requirement: Creación de recompensa desde formulario

La función `createRewardFromFormInput(input: RewardFormInput, id: string)` SHALL devolver un `Reward` con `id` igual al argumento `id` y los campos del input copiados sin transformación adicional.

#### Scenario: Mapeo completo RewardFormInput → Reward

- **WHEN** `input = { emoji: '🍕', name: 'Pizza', description: 'Pizza grande', cost: 50 }`
- **AND** `id = 'reward-abc'`
- **AND** se invoca `createRewardFromFormInput(input, id)`
- **THEN** el resultado es `{ id: 'reward-abc', emoji: '🍕', name: 'Pizza', description: 'Pizza grande', cost: 50 }`

#### Scenario: Inmutabilidad del input

- **WHEN** se invoca `createRewardFromFormInput` con un `RewardFormInput` válido
- **THEN** el objeto `input` original no se modifica
- **AND** se devuelve un nuevo objeto `Reward`
