# Proposal

## Why

El **Ejercicio 3** también pide consultar el historial con `GET /ventas/` paginado y abrir el detalle con `GET /ventas/{id}`, conservando los importes históricos. La demostración mínima pide volver a abrir el detalle de una venta después de recargar. Hoy `historial.html` lee `localStorage`. Cubre los casos G-04 (detalle tras recargar) y G-05 (precio histórico).

Además, es la última pantalla que usa el estado local, así que este change borra los scripts del parcial 1 que quedan sin uso.

## What Changes

- El historial consulta `GET /ventas/` con `limit` 20 y `offset`, con «Anterior» y «Siguiente» y los estados cargando, vacío y error.
- La tabla muestra número, fecha y total. La columna «Cliente» se quita del listado porque la API no lo incluye; se ve en el detalle.
- «Ver detalle» consulta `GET /ventas/{id}` y muestra fecha, cliente, renglones con precio unitario y subtotal, y total, tal como los devuelve la API.
- `historial.html?venta={id}` abre directamente el detalle de esa venta (enlace del comprobante y verificación tras recargar). Abrir un detalle desde el listado escribe `?venta={id}` en la URL y cerrarlo lo quita, para que recargar o compartir reproduzca la misma vista.
- Se borran `datos-iniciales.js`, `persistencia.js`, `datos.js`, `inicio.js`, `catalogo.js`, `altas.js`, `ventas.js` e `historial.js`, y las funciones de `validaciones.js` que solo servían al estado local.

## Capabilities

### New Capabilities

- `historial-ventas`: listado paginado de ventas y detalle con importes históricos.

### Modified Capabilities

- Ninguna.

## Impact

- **Frontend:** nuevo `frontend/public/js/vista-historial.js`; se modifica `historial.html`; se borran los scripts locales.
- **Backend:** sin cambios. Usa `GET /ventas/` y `GET /ventas/{id}`.
- **Depende de:** `02` a `06` (todas las páginas migradas antes de borrar los scripts).
