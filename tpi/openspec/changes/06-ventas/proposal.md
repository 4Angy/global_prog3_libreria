# Proposal

## Why

El **Ejercicio 3 · Registrar y consultar ventas** (25 puntos, el que más vale) pide armar la venta en el navegador y registrarla con `POST /ventas/`, mostrando los importes que calcula la API. Hoy `ventas.html` toma clientes y libros del estado local y guarda la venta en `localStorage`. Cubre los casos G-04 y G-06.

## What Changes

- El cliente se elige por ID con `GET /clientes/{id}`, que muestra su nombre antes de usarlo.
- Los libros se buscan por título con `GET /libros/` y se agregan con una cantidad. Si el libro ya está, se suma la cantidad al renglón existente (un solo renglón por libro).
- El borrador vive en memoria: cambiar cantidades y quitar renglones. Muestra el precio de catálogo como referencia.
- Se valida antes de enviar: cliente elegido, al menos un renglón y cantidades enteras positivas.
- Se envía `POST /ventas/` con `{cliente_id, renglones: [{libro_id, cantidad}]}` y el botón deshabilitado.
- Con el 201 se muestra el comprobante con los precios unitarios, subtotales y total **de la respuesta**, con un enlace al detalle en el historial, y se limpia el borrador.
- Ante un 409 o un 422 se muestra el mensaje del servidor y se conserva el borrador.

## Capabilities

### New Capabilities

- `registro-ventas`: armado del borrador de una venta, envío a la API, comprobante y rechazos.

### Modified Capabilities

- Ninguna.

## Impact

- **Frontend:** nuevo `frontend/public/js/vista-ventas.js`; se modifica `ventas.html`.
- **Backend:** sin cambios. Usa `GET /clientes/{id}`, `GET /libros/` y `POST /ventas/`.
- **Depende de:** `01-cliente-http`, `02-catalogo-listado` (`formato.js`). El enlace al historial se completa con `07-historial-ventas`.
