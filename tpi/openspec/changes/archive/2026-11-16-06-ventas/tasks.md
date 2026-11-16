# Tasks

## 1. Marcado

- [x] 1.1 Ajustar `ventas.html`: «ID del cliente» con «Buscar» y el nombre encontrado; «Buscar libro por título» con su selector de resultados; columna «Precio de catálogo» y «Total estimado» en el borrador; tarjeta de comprobante oculta; cargar `formato.js`, `api.js`, `validaciones.js` y `vista-ventas.js`, sin los scripts locales.

## 2. Borrador

- [x] 2.1 Implementar la selección del cliente por ID. Verificar con un ID existente, uno inexistente y cambiando el ID después de elegir.
- [x] 2.2 Implementar la búsqueda de libros y el borrador (agregar, sumar si se repite, cambiar cantidad, quitar, total estimado). Verificar los escenarios de la spec.
- [x] 2.3 Validar cliente, renglones y cantidades antes de enviar. Verificar cada caso sin peticiones.

## 3. Envío

- [x] 3.1 Enviar `POST /ventas/` con el cuerpo exacto y el botón deshabilitado. Verificar el cuerpo en la pestaña Red y el doble clic.
- [x] 3.2 Con el 201 mostrar el comprobante con los importes de la respuesta, limpiar el borrador y mostrar el enlace al historial. Verificar una venta de dos renglones (G-04).
- [x] 3.3 Ante 409 y 422 mostrar el mensaje y conservar el borrador. Verificar con un libro borrado o un cliente inexistente (409) y enviando renglones repetidos desde la consola con `Api.post` (422) (G-06).

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.
