# Payments MS — Sesiones de pago y webhook Stripe

Microservicio NestJS que crea sesiones de pago con Stripe Checkout y recibe la confirmación del cobro vía webhook.

## Levantar el proyecto

```bash
npm run start:dev
```

El servidor queda escuchando en `http://localhost:3003` (o el puerto definido en `PORT`).

## Escuchar webhooks en local

En otra terminal:

```bash
stripe listen --forward-to localhost:3003/payments/webhook --events charge.succeeded
```

Copiar el `whsec_...` que imprime la CLI y pegarlo en `STRIPE_ENDPOINT_SECRET` del `.env`. Reiniciar el servidor.

## Rutas principales

### POST /payments/create-payment-session

Crea una Checkout Session en Stripe.

**Body:**
```json
{
  "orderId": "ord-1",
  "currency": "usd",
  "items": [
    { "name": "Producto", "price": 20, "quantity": 1 }
  ]
}
```

**Respuesta:** objeto de sesión de Stripe, incluyendo `id` y `url` (redirigir al usuario a esa `url` para completar el pago).

### POST /payments/webhook

Recibe la confirmación de Stripe cuando el pago se concreta. Verifica la firma con el header `stripe-signature` y el `STRIPE_ENDPOINT_SECRET`.

- Si la firma es inválida → responde `400`
- Si el evento es `charge.succeeded` → extrae `metadata.orderId` y lo loguea
- Cualquier otro evento → lo loguea como "no manejado" y responde `200`

### Rutas de apoyo

- `GET /payments/success` → `{ "ok": true, "message": "Payment successful" }`
- `GET /payments/cancel` → `{ "ok": false, "message": "Payment cancelled" }`

## Probar con tarjeta de prueba

Al completar el checkout, usar:
- Número: `4242 4242 4242 4242`
- Fecha: cualquier fecha futura
- CVC: cualquier 3 dígitos
