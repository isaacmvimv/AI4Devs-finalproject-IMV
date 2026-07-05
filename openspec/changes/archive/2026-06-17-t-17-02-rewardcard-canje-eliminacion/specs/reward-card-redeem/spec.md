# Spec — reward-card-redeem

Capacidad: tarjeta de recompensa con flujo de canje completo y eliminación.
Ticket: T-17-02 · US-17

---

## Scenario 1 — Botón deshabilitado por saldo insuficiente (US-17 SC3)

```gherkin
Given un componente RewardCard con cost=80 y currentPoints=30
Then el botón de canje aparece deshabilitado
And muestra el texto "Faltan 50 pts"
And el botón tiene atributo disabled
```

## Scenario 2 — Botón habilitado con saldo suficiente (US-17 SC2 — precondición)

```gherkin
Given un componente RewardCard con cost=80 y currentPoints=100
Then el botón de canje está habilitado
And muestra el texto "Canjear"
```

## Scenario 3 — Canje exitoso (US-17 SC2)

```gherkin
Given el componente RewardCard con cost=80 y currentPoints=100
And la API POST /api/weeks/:id/redemptions devuelve éxito con pointsSpent=80
When el usuario hace clic en "Canjear"
Then el botón muestra un spinner mientras la petición está en vuelo
And tras completarse muestra el texto "¡Canjeada!"
And se dispara un toast con mensaje de éxito
And se llama al callback onRedeemSuccess con pointsSpent=80
```

## Scenario 4 — Rollback ante error 422 (US-17 SC5)

```gherkin
Given el componente RewardCard con cost=80 y currentPoints=100
And la API devuelve error 422 con code=INSUFFICIENT_POINTS
When el usuario hace clic en "Canjear"
Then el botón vuelve a su estado habilitado ("Canjear") tras el error
And se dispara un toast con mensaje de error "Puntos insuficientes"
And el callback onRedeemSuccess NO se llama
```

## Scenario 5 — Eliminar recompensa (US-17 SC4)

```gherkin
Given un componente RewardCard visible
When el usuario hace clic en el botón de eliminar
Then se llama al callback onDelete
```

## Scenario 6 — Spinner durante canje (edge)

```gherkin
Given el usuario ha hecho clic en "Canjear" y la petición está pendiente
Then el botón de canje está deshabilitado
And muestra un icono de carga (spinner)
And el botón de eliminar sigue siendo accesible
```
