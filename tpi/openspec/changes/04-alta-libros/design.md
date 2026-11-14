# Design

## Context

- `POST /libros/` recibe `LibroCreate`: `isbn`, `titulo`, `precio` (> 0), `stock` (≥ 0), `editorial_id`, `genero_id` opcional y `autores: [{autor_id, rol, orden ≥ 1}]`. Rechaza campos extra (422), autor u orden repetidos (422), ISBN repetido (409 «El ISBN ya pertenece a otro libro.») y referencias inexistentes (409 «La referencia indicada no existe.»). Devuelve 201 con `LibroRead`.
- El backend acepta `autores: []`; la consigna pide al menos un autor, así que lo exige el formulario.
- `GET /editoriales/` y `GET /generos/` son paginados (`limit` ≤ 100) y devuelven `{id, nombre}`.
- No hay listado de autores: solo `GET /autores/{id}` (404 si no existe).
- `validaciones.js` tiene `leerPrecio`, `leerCantidad`, `normalizarIsbn` y `validarLibro(datos, contexto)`, que busca duplicados en el estado local.

## Goals / Non-Goals

**Goals:**
- Que el ISBN repetido y las referencias inválidas los decida la API, no el navegador.
- Mantener la apariencia del formulario del parcial 1.

**Non-Goals:**
- Editar o borrar libros.
- Un buscador de autores por nombre (la API no lo tiene).

## Decisions

1. **Selectores con `limit=100`.** Se piden en paralelo al abrir la página. Si alguno falla, se muestra el error con «Reintentar» y el botón «Registrar libro» queda deshabilitado. Documentado en el README.
2. **Autorías por ID verificado.** Un campo «ID del autor» y un selector de rol, con un botón «Buscar y agregar». Se consulta `GET /autores/{id}`; si existe, se agrega un renglón «orden · nombre · rol · Quitar». Un autor ya agregado no se repite. El `orden` es la posición (1, 2, 3…) y se recalcula al quitar.
   *Alternativa:* cargar todos los autores probando IDs. Se descarta: no escala y genera 404 innecesarios.
3. **`validarLibro(datos)` sin contexto.** Valida formato y rangos; los duplicados quedan para la API. Las funciones `existe…En` se dejan de usar en esta página (se borran en el change `07`).
4. **Precio como texto decimal con punto** (`"1500.50"`): `leerPrecio` ya acepta coma o punto; se envía normalizado para que `Decimal` no pierda precisión.
5. **Envío único:** el botón se deshabilita y muestra «Registrando…» mientras dura el `POST`.
6. **Tabla de la sesión en memoria** con lo que devolvió el 201 (título, ISBN, editorial, género, autores, precio, stock).

## Risks / Trade-offs

- [El backend permite `autores: []` por otros clientes] → La consigna habla del formulario; si la cátedra lo exige en la API, basta con `min_length=1` en `LibroCreate.autores`.
- [Más de 100 editoriales o géneros] → No pasa con los datos de prueba; queda anotado en el README.
