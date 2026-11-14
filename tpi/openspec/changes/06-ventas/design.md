# Design

## Context

- `POST /ventas/` recibe `VentaCreate`: `cliente_id` y `renglones` (al menos uno) con `libro_id` y `cantidad > 0`; rechaza campos extra y libros repetidos con 422. Un libro inexistente responde 409 «El libro indicado no existe.»; un cliente inexistente, 409 «La referencia indicada no existe.». Devuelve 201 con `VentaRead`: `id`, `fecha` (ISO UTC con `Z`), `total`, `cliente {id, nombre, email}` y `renglones [{libro_id, titulo, cantidad, precio_unitario, subtotal}]`. Los importes son textos decimales.
- El precio unitario lo copia el servidor del catálogo al momento de la venta; el navegador no lo envía.
- `ventas.js` del parcial ya modela el borrador (`agregarRenglon` suma la cantidad si el libro está, `cambiarCantidad`, `quitarRenglon`, `recalcular`) pero lee títulos y precios del estado local.

## Goals / Non-Goals

**Goals:**
- Que los importes confirmados salgan siempre de la respuesta de la API.
- No perder el borrador ante un rechazo.

**Non-Goals:**
- Controlar o descontar stock (la consigna aclara que el alta de una venta solo registra renglones e importes).
- Guardar el borrador entre recargas.

## Decisions

1. **`js/vista-ventas.js` nuevo**, que reutiliza la lógica del borrador de `ventas.js` pero guarda en cada renglón `{libroId, titulo, precioReferencia, cantidad}` tomados de la búsqueda, en lugar de consultarlos al estado local.
2. **Cliente por ID:** campo «ID del cliente» y «Buscar». El cliente queda elegido solo si `GET /clientes/{id}` respondió 200; cambiar el ID lo deselecciona.
3. **Búsqueda de libros:** campo «Buscar libro por título» que consulta `GET /libros/?titulo=…&limit=10` y llena un selector con «título — precio». Se agrega con la cantidad indicada.
4. **Precio de referencia vs. confirmado:** el borrador muestra «Precio de catálogo» y un total estimado. El comprobante muestra solo los valores devueltos por el 201.
5. **Comprobante** en una tarjeta debajo del formulario con número de venta, fecha local, cliente, renglones y total, más el enlace `historial.html?venta={id}`.
6. **Envío único:** botón deshabilitado con «Registrando…» desde que se envía hasta que llega la respuesta o el error.

## Risks / Trade-offs

- [El precio de catálogo puede cambiar entre la búsqueda y la confirmación] → Por eso el comprobante usa los importes de la respuesta.
- [La búsqueda trae como mucho 10 libros] → Alcanza para elegir; si no aparece, se afina el título.
