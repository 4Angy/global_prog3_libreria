# Proposal

## Why

El catálogo es la primera pantalla de la demostración mínima y del caso G-01. Hoy lee los libros del estado local; tiene que consultarlos en la API, que es la fuente de verdad en PostgreSQL. Cubre la parte de listado, búsqueda, paginación y estados del **Ejercicio 1**.

## What Changes

- El catálogo (`index.html`) deja de leer el estado local y consulta `GET /libros/` con `titulo`, `limit` (por defecto 20) y `offset`. Al cambiar la búsqueda, el desplazamiento vuelve a 0.
- Se agrega la paginación con «Anterior» y «Siguiente».
- La tabla muestra título, ISBN, precio, editorial y género («Sin clasificar» si es nulo). La columna «Autores» se quita: el listado de la API no los trae y se ven en el detalle (change `03`).
- Se distinguen cuatro estados: cargando, catálogo vacío, búsqueda sin coincidencias y error de conexión.
- **BREAKING (frente al parcial 1):** se quitan el selector de criterio (autor, género, editorial) y el rango de precio, porque la API solo filtra por `titulo` y `genero_id`. Filtrar en el navegador sobre una página de 20 libros daría resultados incompletos.
- `formatearPrecio` y `TEXTO_SIN_GENERO` pasan a un archivo compartido para que las páginas que todavía no se integraron sigan funcionando.

**Fuera de alcance:** detalle con autores (`03`).

## Capabilities

### New Capabilities

- `catalogo-libros`: consulta del catálogo desde la API: búsqueda por título, paginación, columnas visibles y estados de la vista.

### Modified Capabilities

- Ninguna.

## Impact

- **Frontend:** nuevos `frontend/public/js/formato.js` y `frontend/public/js/vista-catalogo.js`; se modifica `index.html`; se quitan `formatearPrecio` y `TEXTO_SIN_GENERO` de `catalogo.js` y se carga `formato.js` en las demás páginas.
- **Backend:** sin cambios. Usa `GET /libros/`.
- **Depende de:** `01-cliente-http`.
- **Riesgo:** el listado no devuelve el total, así que «Siguiente» se habilita solo cuando la página vino completa. Si hay justo `limit` libros, la página siguiente llega vacía.
