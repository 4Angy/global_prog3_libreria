# Proposal

## Why

El Global de Programación III pide reemplazar la simulación con `localStorage` del primer parcial por la API FastAPI del segundo parcial. Todas las pantallas (catálogo, altas, ventas, historial) van a hablar con la API, así que primero hace falta un único cliente HTTP y un servidor web local que publique `/api` en el mismo origen. Es la base del **Ejercicio 1 · Catálogo y cliente HTTP**.

## What Changes

- Se agrega un cliente HTTP único (`fetch`) con la URL base `/api`, que conserva la barra final de las rutas que la llevan (`/api/libros/`), codifica los parámetros de consulta y convierte las respuestas no exitosas y los fallos de red en un error uniforme con el mensaje del servidor.
- Se agrega `frontend/default.conf.template`, la plantilla de Nginx de la consigna, para probar `/api` en local antes de tener el `Dockerfile` (change `08`).
- Todas las páginas cargan el cliente, aunque todavía no lo usen.
- **BREAKING:** a partir de acá el frontend se prueba servido por Nginx, no abriendo los archivos con `file://`.

**Fuera de alcance:** el uso del cliente en cada pantalla (changes `02` a `07`), el `Dockerfile` del frontend (`08`).

## Capabilities

### New Capabilities

- `cliente-http`: acceso del frontend a la API: URL base, armado de rutas y parámetros, interpretación de respuestas y errores.

### Modified Capabilities

- Ninguna: el proyecto `tpi` todavía no tiene specs.

## Impact

- **Frontend:** nuevo `frontend/public/js/api.js`; las cinco páginas lo cargan.
- **Servidor web:** nuevo `frontend/default.conf.template`.
- **Documentación:** nuevo `tpi/README.md` con cómo levantar backend y frontend en local.
- **Backend:** sin cambios. Se usa `GET /health/ready` para verificar el proxy.
