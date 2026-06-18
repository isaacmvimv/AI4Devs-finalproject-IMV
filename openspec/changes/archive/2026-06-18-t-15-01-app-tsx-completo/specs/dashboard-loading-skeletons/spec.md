## ADDED Requirements

### Requirement: Skeletons durante carga inicial
El dashboard SHALL mostrar skeletons en cada sección (stats, calendario, recompensas) mientras la API no ha respondido en la carga inicial. No se SHALL mostrar pantalla en blanco ni contenido parcialmente cargado de forma confusa.

#### Scenario: Dashboard muestra skeletons durante carga
- **WHEN** la API tarda en responder en la carga inicial
- **THEN** se muestran skeletons en la sección de stats (4 placeholders animados)
- **AND** se muestran skeletons en la sección de calendario (filas animadas)
- **AND** se muestran skeletons en la sección de recompensas (tarjetas animadas)
- **AND** el usuario no ve contenido parcialmente cargado de forma confusa

#### Scenario: Skeletons desaparecen al cargar datos
- **WHEN** la API responde con datos
- **THEN** los skeletons se reemplazan por el contenido real en todas las secciones
