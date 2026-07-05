## ADDED Requirements

### Requirement: Manejo de errores parciales por sección
Cuando un endpoint falla pero otros funcionan, el dashboard SHALL mostrar un mensaje de error no intrusivo en la sección afectada sin afectar al resto de secciones.

#### Scenario: Error en recompensas no afecta hábitos
- **WHEN** el endpoint de recompensas falla pero el de hábitos funciona
- **THEN** el calendario semanal con hábitos se muestra correctamente
- **AND** la sección de recompensas muestra un mensaje de error no intrusivo
- **AND** las demás secciones no se ven afectadas

#### Scenario: Error general de carga muestra mensaje en dashboard
- **WHEN** la API de semana actual falla en la carga inicial
- **THEN** el dashboard muestra un mensaje de error descriptivo
- **AND** el Toaster de Sonner muestra la notificación de error
