# Spec — weekly-calendar-navigation

Capacidad de navegación entre semanas en el componente `WeeklyCalendar`, incluyendo controles de navegación habilitados/deshabilitados, badge de semana bloqueada y destacado del día actual.

## ADDED Requirements

### Requirement: Navegación entre semanas con callbacks unificados

El componente `WeeklyCalendar` SHALL invocar `onWeekNav(-1)` al pulsar "‹" y `onWeekNav(+1)` al pulsar "›".

#### Scenario: Clic en botón anterior invoca onWeekNav(-1)
- **WHEN** el usuario hace clic en el botón "‹"
- **THEN** se invoca `onWeekNav` con argumento `-1`

#### Scenario: Clic en botón siguiente invoca onWeekNav(+1)
- **WHEN** el usuario hace clic en el botón "›"
- **THEN** se invoca `onWeekNav` con argumento `+1`

---

### Requirement: Botón "›" deshabilitado en semana actual

El componente SHALL deshabilitar el botón "›" (siguiente semana) cuando `weekOffset === 0`.

#### Scenario: Botón siguiente deshabilitado en semana actual
- **WHEN** `weekOffset` es `0`
- **THEN** el botón "›" tiene atributo `disabled`
- **AND** el clic en "›" no invoca `onWeekNav`

#### Scenario: Botón siguiente habilitado en semana pasada
- **WHEN** `weekOffset` es `-1` (o cualquier valor negativo)
- **THEN** el botón "›" NO tiene atributo `disabled`

---

### Requirement: Badge de semana bloqueada

El componente SHALL mostrar el badge "Semana bloqueada 🔒" cuando la prop `isWeekLocked` sea `true`.

#### Scenario: Badge visible cuando la semana está bloqueada
- **WHEN** `isWeekLocked` es `true`
- **THEN** el badge con texto "Semana bloqueada 🔒" es visible en el DOM

#### Scenario: Badge no visible cuando la semana no está bloqueada
- **WHEN** `isWeekLocked` es `false`
- **THEN** el badge "Semana bloqueada 🔒" NO está presente en el DOM

---

### Requirement: Destacado del día actual en la semana vigente

El componente SHALL aplicar estilos diferenciadores al día actual únicamente cuando `weekOffset === 0`.

#### Scenario: Día actual destacado en semana vigente
- **WHEN** `weekOffset` es `0`
- **THEN** la columna correspondiente al día actual (Lunes=0 … Domingo=6, usando `getDay()` normalizado) tiene clase `ring-2 ring-blue-400` u estilos equivalentes

#### Scenario: Ningún día destacado en semana pasada
- **WHEN** `weekOffset` es distinto de `0`
- **THEN** ninguna columna de día tiene los estilos de "día actual"
