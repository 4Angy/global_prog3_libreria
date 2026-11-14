# Proposal

## Why

El **Ejercicio 2** también pide registrar clientes con `POST /clientes/` y, como la API no tiene listado de clientes, buscarlos con `GET /clientes/{id}`. Hoy `clientes.html` guarda en `localStorage`. Cubre el caso G-03.

## What Changes

- El alta envía `POST /clientes/` con nombre y email. Con el 201 se muestra el cliente creado con su ID y se agrega a la tabla «Clientes registrados en esta sesión».
- Ante un 409 (email repetido) o un 422 se muestra el mensaje del servidor y se conservan los datos.
- Se agrega «Buscar cliente por ID» con `GET /clientes/{id}`, que muestra nombre y email.
- **BREAKING (frente al parcial 1):** la página deja de listar todos los clientes, porque la API no tiene listado.

## Capabilities

### New Capabilities

- `alta-clientes`: alta de clientes contra la API y búsqueda por ID.

### Modified Capabilities

- Ninguna.

## Impact

- **Frontend:** nuevo `frontend/public/js/vista-clientes.js`; se modifican `clientes.html` y `validaciones.js`.
- **Backend:** sin cambios. Usa `POST /clientes/` y `GET /clientes/{id}`.
- **Documentación:** el README explica que los clientes se buscan por ID.
- **Depende de:** `01-cliente-http`.
