## ADDED Requirements

### Requirement: Validación inline del formulario de creación de hábito

El componente AddHabitModal MUST validar los campos del formulario de forma síncrona antes de invocar `onAdd`. Si algún campo no cumple las reglas, el sistema SHALL mostrar el mensaje de error junto al campo correspondiente y NO realizará ninguna llamada a la API.

Reglas de validación:
- `nombre`: no vacío (después de trim).
- `puntos`: valor numérico mayor que 0.
- `penalización`: valor numérico mayor o igual a 0.

#### Scenario: Nombre vacío bloquea el submit

- **WHEN** el usuario hace clic en "Añadir hábito" con el campo nombre vacío
- **THEN** el formulario muestra el error "El nombre es obligatorio" junto al campo nombre
- **AND** no se invoca `onAdd`

#### Scenario: Puntos cero o negativo bloquea el submit

- **WHEN** el usuario introduce un valor de puntos igual a 0 o negativo y hace clic en "Añadir hábito"
- **THEN** el formulario muestra el error "Los puntos deben ser mayores que 0" junto al campo puntos
- **AND** no se invoca `onAdd`

#### Scenario: Penalización negativa bloquea el submit

- **WHEN** el usuario introduce un valor de penalización negativo y hace clic en "Añadir hábito"
- **THEN** el formulario muestra el error "La penalización no puede ser negativa" junto al campo penalización
- **AND** no se invoca `onAdd`

### Requirement: Estado de carga durante el envío

El componente AddHabitModal MUST deshabilitar el botón "Añadir hábito" y mostrar un indicador de carga mientras `onAdd` está pendiente de resolución, para evitar envíos duplicados.

#### Scenario: Botón deshabilitado durante submit

- **WHEN** el usuario hace clic en "Añadir hábito" con datos válidos
- **THEN** el botón "Añadir hábito" queda deshabilitado inmediatamente
- **AND** se muestra un spinner o indicador visual de carga en el botón

### Requirement: Manejo de error de API — modal persistente

Si `onAdd` rechaza la promesa (error de API), el sistema SHALL mantener el modal abierto con los datos del formulario intactos y SHALL notificar al usuario mediante un toast de error no intrusivo.

#### Scenario: Error de API — modal permanece abierto

- **WHEN** `onAdd` lanza un error (la API falla)
- **THEN** el modal permanece abierto
- **AND** los campos del formulario conservan los valores introducidos por el usuario
- **AND** se muestra un toast de error con el mensaje del error

### Requirement: Reset y cierre al confirmar con éxito

Si `onAdd` resuelve correctamente, el sistema SHALL cerrar el modal y SHALL resetear todos los campos del formulario a sus valores por defecto.

#### Scenario: Éxito — modal se cierra y campos se resetean

- **WHEN** `onAdd` resuelve correctamente
- **THEN** el modal se cierra
- **AND** el campo nombre queda vacío
- **AND** los campos puntos y penalización vuelven a sus valores por defecto
- **AND** el emoji seleccionado vuelve al primero de la lista

### Requirement: Uso del componente Dialog de shadcn/ui

El modal MUST usar `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle` de `ui/dialog.tsx` en lugar de un overlay CSS manual, para garantizar accesibilidad (foco atrapado, cierre con Escape, `aria-modal`).

#### Scenario: Cierre con tecla Escape

- **WHEN** el modal está abierto y el usuario pulsa la tecla Escape
- **THEN** el modal se cierra (comportamiento nativo de Radix Dialog)
