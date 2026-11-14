# Proposal

## Why

La consigna pide ver los autores de un libro consultando `GET /libros/{id}`, porque el listado no los trae. El caso G-01 incluye «abrir el detalle de un libro». Completa el **Ejercicio 1**.

## What Changes

- Cada fila del catálogo tiene un botón «Ver detalle».
- El detalle se muestra en un panel debajo de la tabla, con título, ISBN, precio, stock, editorial, género y los autores en orden, con su rol.
- Si el detalle falla (por ejemplo, 404), se muestra el error en el panel y la tabla sigue visible.

## Capabilities

### New Capabilities

- Ninguna.

### Modified Capabilities

- `catalogo-libros`: se agrega el requisito de detalle con autores.

## Impact

- **Frontend:** se modifican `index.html` (columna «Detalle» y panel) y `vista-catalogo.js`.
- **Backend:** sin cambios. Usa `GET /libros/{id}`, que devuelve `autores: [{autor {id, nombre}, rol, orden}]`.
- **Depende de:** `02-catalogo-listado`.
