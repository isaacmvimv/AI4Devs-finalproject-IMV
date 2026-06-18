# Spec — week-history-loading

**Ticket:** T-18-02 · **User Story:** US-18

## Escenarios

### 1. Carga de semana anterior (happy path) — AC US-18 S3

```gherkin
Given el usuario está en la semana actual
When hace clic en "‹"
Then se muestra un skeleton/indicador de carga en el área del calendario
And se llama a GET /api/weeks?offset=-1
And al recibir respuesta, el calendario muestra los hábitos y estados de esa semana (modo lectura)
And las estadísticas reflejan totalPointsEarned y totalPenalties de la semana cargada
And se muestra el badge "Semana bloqueada 🔒"
```

### 2. No hay semana anterior (404) — AC US-18 S4

```gherkin
Given el usuario está en su primera semana (o la semana más antigua disponible)
When navega hacia atrás y GET /api/weeks?offset=n devuelve 404
Then el botón "‹" se deshabilita
And no se muestra error al usuario (no toast, no crash)
And el calendario mantiene la última semana válida cargada
```

### 3. Volver a la semana actual — AC US-18 S5

```gherkin
Given el usuario está navegando una semana anterior (weekOffset < 0)
When hace clic en "›" hasta que weekOffset = 0
Then las celdas vuelven a ser interactivas (no read-only)
And el badge de bloqueo desaparece
And los botones de añadir hábito y recompensa están visibles
And el botón "›" se deshabilita (ya en semana actual)
```

### 4. Estado de carga durante transición

```gherkin
Given el usuario navega a cualquier semana (‹ o ›)
When la petición HTTP está en curso
Then se muestra un skeleton en el área de hábitos del calendario
And los botones de navegación semanal están deshabilitados durante la carga
```

### 5. Navegación rápida (race condition)

```gherkin
Given el usuario hace clic en "‹" dos veces rápidamente
When la primera petición aún no ha respondido
Then solo se aplican los datos de la segunda petición (la más reciente)
And no se produce un estado inconsistente
```
