# Spec — add-reward-modal

**Ticket:** T-17-03 | **User Story:** US-17

## Escenarios

### Scenario 1 — Crear recompensa con datos válidos (happy path)
```gherkin
Given el modal AddRewardModal está abierto
When el usuario selecciona un emoji, rellena nombre="Cena especial", descripción="Restaurante favorito", coste=80 y confirma
Then se invoca onAdd con { emoji, name: "Cena especial", description: "Restaurante favorito", cost: 80 }
And el modal se cierra (onClose invocado)
And los campos se resetean al estado inicial
```

### Scenario 2 — Validación: nombre vacío
```gherkin
Given el modal AddRewardModal está abierto
When el usuario deja el nombre vacío y hace submit
Then aparece el error inline "El nombre es obligatorio"
And onAdd NO es invocado
And el modal permanece abierto
```

### Scenario 3 — Validación: coste <= 0
```gherkin
Given el modal AddRewardModal está abierto y el usuario rellena nombre="Test"
When el usuario introduce coste=0 (o negativo) y hace submit
Then aparece el error inline "El coste debe ser mayor que 0"
And onAdd NO es invocado
```

### Scenario 4 — Error de API: modal permanece abierto y muestra toast
```gherkin
Given el modal AddRewardModal está abierto con datos válidos
When onAdd lanza un error (e.g. API 422)
Then el modal permanece abierto (onClose NO invocado)
And se muestra un toast de error con el mensaje del error
And los datos del formulario se conservan
```

### Scenario 5 — Botón en vuelo (isSubmitting)
```gherkin
Given el usuario hace submit con datos válidos
When la llamada a onAdd está en curso
Then el botón de confirmar muestra un spinner (Loader2 animate-spin) y está deshabilitado
```
