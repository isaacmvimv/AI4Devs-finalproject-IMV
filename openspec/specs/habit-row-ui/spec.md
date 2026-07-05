# Spec: habit-row-ui

Componente presentacional `HabitRow` que muestra un hábito con sus 7 celdas de estado semanal, contador de racha, y controles de interacción.

## Escenarios

### Toggle de celda — happy path (US-16 Scenario 2)

```
GIVEN un HabitRow con completionStatus[2] = 'pending' y isReadOnly = false
WHEN el usuario hace clic en la celda del día 2
THEN se llama a onToggle(2)
```

### Modo lectura — sin interacción (US-16 Scenario 5)

```
GIVEN un HabitRow con isReadOnly = true
WHEN se renderiza el componente
THEN las celdas son <div> no clicables (no <button>)
AND el botón × no aparece en el DOM
```

### Indicador de día actual

```
GIVEN un HabitRow con weekOffset = 0
WHEN se renderiza el componente
THEN la celda correspondiente al día actual contiene un marcador visual diferenciador
```

```
GIVEN un HabitRow con weekOffset != 0
WHEN se renderiza el componente
THEN ninguna celda tiene el marcador de día actual
```

### Estados visuales de celda

```
GIVEN completionStatus[i] = 'completed'
THEN la celda i tiene fondo verde e icono ✓
```

```
GIVEN completionStatus[i] = 'failed'
THEN la celda i tiene fondo rojo e icono ✗
```

```
GIVEN completionStatus[i] = 'pending'
THEN la celda i tiene fondo neutro y está vacía
```

### Botón de eliminar

```
GIVEN isReadOnly = false
WHEN el usuario hace clic en el botón ×
THEN se llama a onDelete()
```

```
GIVEN isReadOnly = true
THEN el botón × no está presente en el DOM
```

### Racha

```
GIVEN streak = 5
THEN se muestra "🔥 5 días"
```

```
GIVEN streak = 0 o streak ausente
THEN no se muestra indicador de racha
```
