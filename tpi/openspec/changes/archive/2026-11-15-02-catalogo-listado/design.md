# Design

## Context

- `GET /libros/?titulo=&genero_id=&limit=&offset=` devuelve `list[LibroResumenRead]`: `id`, `isbn`, `titulo`, `precio` (decimal serializado como texto), `stock`, `editorial {id, nombre}` y `genero {id, nombre} | null`. Filtra con `ilike`, ordena por `id` y valida `limit` entre 1 y 100. No informa el total.
- `catalogo.js` mezcla el catálogo con funciones que reutilizan otras páginas: `crearFilaLibro` (`libros.html`) y `formatearPrecio` (libros, ventas, historial).
- `inicio.js` arranca todas las páginas y espera los elementos del buscador viejo.

## Goals / Non-Goals

**Goals:**
- Integrar el catálogo sin romper las otras cuatro páginas, que siguen con el estado local hasta su change.

**Non-Goals:**
- Mostrar el total de páginas, que la API no informa.
- Filtro por género (puede sumarse después con `genero_id` sin cambiar el cliente).

## Decisions

1. **`js/vista-catalogo.js` nuevo, en lugar de reescribir `catalogo.js`.** `index.html` carga solo `formato.js`, `api.js` y `vista-catalogo.js`, con su propio arranque. Así `inicio.js` y `catalogo.js` siguen sirviendo a las otras páginas sin cambios de comportamiento.
2. **`js/formato.js` compartido** con `formatearPrecio` (acepta número o texto decimal, formato `es-AR` en ARS) y `TEXTO_SIN_GENERO`. Se quitan de `catalogo.js` y se carga `formato.js` antes que los demás scripts en las páginas que los usan.
3. **Estado de la vista en memoria:** `{ titulo, offset, limit: 20 }`. Cada consulta guarda un número de petición y descarta las respuestas viejas, para que una búsqueda rápida no pise a la siguiente.
4. **Paginación sin total:** «Siguiente» se habilita si `recibidos === limit`. Si una página avanzada llega vacía, se muestra «No hay más resultados» y se habilita solo «Anterior».
5. **Texto, no HTML:** las celdas se llenan con `textContent`.

## Risks / Trade-offs

- [Quitar filtros del parcial 1] → Queda documentado en el README del TPI.
- [Mientras convivan scripts viejos y nuevos, `index.html` no carga `datos.js`] → Ninguna otra página depende de lo que hace `index.html`.
