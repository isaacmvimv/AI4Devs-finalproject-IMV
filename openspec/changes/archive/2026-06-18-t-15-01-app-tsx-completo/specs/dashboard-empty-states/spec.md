## ADDED Requirements

### Requirement: Estado vacío de hábitos
El dashboard SHALL mostrar un placeholder con el mensaje "Añade tu primer hábito" y un botón CTA "+ Nuevo hábito" cuando el usuario no tenga hábitos creados. La barra de progreso SHALL mostrar 0% y los StatCards SHALL mostrar 0 en todos sus valores.

#### Scenario: Usuario sin hábitos ve placeholder y CTA
- **WHEN** el usuario abre la aplicación y no tiene ningún hábito creado
- **THEN** la sección de calendario muestra un placeholder con texto "Añade tu primer hábito"
- **AND** se muestra un botón "+ Nuevo hábito" que abre el modal AddHabitModal
- **AND** la barra de progreso muestra 0%
- **AND** los 4 StatCards muestran 0 en sus valores

#### Scenario: CTA de estado vacío abre modal de nuevo hábito
- **WHEN** el usuario hace clic en el botón "+ Nuevo hábito" del placeholder
- **THEN** se abre el modal AddHabitModal

### Requirement: Estado vacío de recompensas
El dashboard SHALL mostrar un placeholder con el mensaje "Crea tu primera recompensa" cuando el usuario no tenga recompensas.

#### Scenario: Usuario sin recompensas ve placeholder
- **WHEN** el usuario abre la aplicación y no tiene recompensas creadas
- **THEN** la sección de recompensas muestra un placeholder con texto "Crea tu primera recompensa"
