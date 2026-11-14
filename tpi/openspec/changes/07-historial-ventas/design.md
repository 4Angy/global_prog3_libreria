# Design

## Context

- `GET /ventas/?limit=&offset=` devuelve `list[VentaResumenRead]`: `id`, `fecha` y `total`, ordenadas por `id`. No incluye cliente ni total de registros.
- `GET /ventas/{id}` devuelve `VentaRead` con `cliente {id, nombre, email}` y `renglones [{libro_id, titulo, cantidad, precio_unitario, subtotal}]`; 404 «La venta no existe.» si no está.
- `RenglonVenta.precio_unitario` se copia al registrar la venta, así que un `PATCH /libros/{id}` posterior no cambia el detalle.
- `historial.html` ya tiene la tabla y el panel de detalle con `.lista-detalle`.

## Goals / Non-Goals

**Goals:**
- Mostrar los importes exactamente como los devuelve la API, sin recalcularlos.
- Dejar el frontend sin dependencias del estado local.

**Non-Goals:**
- Filtrar el historial por cliente o fecha.
- Mostrar el cliente en el listado (costaría una consulta por fila).

## Decisions

1. **Misma paginación que el catálogo:** `{ offset, limit: 20 }`, «Siguiente» habilitado si `recibidos === limit`.
2. **Detalle en el panel existente**, con el cliente como «nombre (email)». Fecha con `toLocaleString("es-AR")` a partir del ISO UTC.
3. **Importes de la API:** precio unitario, subtotal y total se formatean con `formatearPrecio` sobre los textos recibidos; no se multiplican en el navegador.
4. **Parámetro `?venta={id}`:** al cargar, si está presente y es un entero positivo, se abre el detalle de esa venta además de cargar el listado.
5. **Limpieza:** se borran los scripts locales después de comprobar con una búsqueda en `frontend/public` que ninguna página los referencia. De `validaciones.js` se quitan `existeIsbnEn`, `existeEmailEn`, `existeEditorialEn`, `existeGeneroEn` y `existeAutorEn`.

## Risks / Trade-offs

- [El listado ordena por `id` ascendente: las ventas nuevas quedan al final] → El enlace del comprobante abre el detalle directo; se anota en el README.
- [Se pierden los datos guardados en `localStorage` por el parcial 1] → Eran datos simulados; la fuente ahora es la API.
