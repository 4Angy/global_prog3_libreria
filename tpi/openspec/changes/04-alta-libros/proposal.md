# Proposal

## Why

El **Ejercicio 2 · Alta de libros y clientes** pide registrar libros con `POST /libros/`, con editoriales y géneros traídos de la API y autorías verificadas contra `GET /autores/{id}`. Hoy `libros.html` valida y guarda en `localStorage`, no tiene stock y elige autores de una lista local sin rol ni orden. Cubre el caso G-02.

## What Changes

- Los selectores de editorial y género se cargan desde `GET /editoriales/` y `GET /generos/`. El género sigue siendo opcional («Sin clasificar»).
- El selector múltiple de autores se reemplaza por una lista de autorías: se ingresa el ID del autor, se verifica con `GET /autores/{id}`, se muestra su nombre y se agrega con un rol (autor, coautor, traductor, ilustrador). El orden es la posición en la lista.
- Se agrega el campo **stock** (entero desde 0).
- Se valida antes de enviar: título, ISBN, precio positivo, stock, editorial y al menos una autoría.
- El alta se envía a `POST /libros/`. Con el 201 se muestra el libro creado y se agrega a la tabla «Libros registrados en esta sesión». Ante un 409 (ISBN repetido) o un 422 se muestra el mensaje del servidor y se conservan los datos.
- **BREAKING (frente al parcial 1):** `libros.html` deja de usar `localStorage`. La tabla ya no muestra todos los libros: muestra los creados en esta sesión; el catálogo completo está en `index.html`.

## Capabilities

### New Capabilities

- `alta-libros`: formulario de alta de libros contra la API: opciones de editorial y género, autorías verificadas, validación, envío y errores.

### Modified Capabilities

- Ninguna.

## Impact

- **Frontend:** nuevo `frontend/public/js/vista-libros.js`; se modifican `libros.html` y `validaciones.js` (validación sin contexto local).
- **Backend:** sin cambios. Usa `GET /editoriales/`, `GET /generos/`, `GET /autores/{id}` y `POST /libros/`.
- **Documentación:** el README explica cómo se resolvieron los selectores (lo pide la consigna).
- **Depende de:** `01-cliente-http`, `02-catalogo-listado` (`formato.js`).
