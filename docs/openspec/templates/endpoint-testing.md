# Informe Paso N+2 - Pruebas manuales de endpoints

- Fecha: YYYY-MM-DD
- Cambio: <change-name>
- Agente: <agent-name>
- URL Backend: http://localhost:3001

## Endpoints probados

### GET /api/<recurso>
```bash
curl -X GET http://localhost:3001/api/<recurso>
```

**Respuesta:**
```json
{}
```

**Código de estado:** 200 OK
**Verificación:** PASS/FAIL — <descripción>

### [Otros endpoints según aplique]

## Pruebas de casos de error

### <escenario>
```bash
curl -X GET http://localhost:3001/api/<recurso>
```

**Respuesta:**
```json
{}
```

**Código de estado:** 404 Not Found
**Verificación:** PASS/FAIL — <descripción>

## Gestión del estado de la base de datos
- Estado previo a pruebas: <descripción>
- Estado posterior a pruebas: <descripción>
- Estado restaurado: Sí/No
- Acciones de restauración: <si las hubiera>

## Observaciones
<Cualquier nota, problema o advertencia>

## Resultado
- Estado del Paso N+2: PASS/FAIL
- Todos los endpoints probados: Sí/No
- Base de datos restaurada: Sí/No/N/A
- Problemas bloqueantes: <ninguno o listar>
