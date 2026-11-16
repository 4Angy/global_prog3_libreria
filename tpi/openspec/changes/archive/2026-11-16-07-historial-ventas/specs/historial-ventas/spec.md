# Spec Delta

## Purpose

Permite recorrer las ventas registradas en la API y abrir el detalle de cada una con sus importes históricos.

## ADDED Requirements

### Requirement: Listado paginado de ventas
Al abrir el historial, la vista SHALL consultar `GET /ventas/` con `limit` 20 y `offset` 0 y mostrar número, fecha y total de cada venta. MUST permitir avanzar y retroceder de a 20, con «Anterior» deshabilitado en `offset` 0 y «Siguiente» deshabilitado si la página trae menos de 20 ventas.

#### Scenario: Apertura del historial
- **WHEN** se abre el historial
- **THEN** se consulta `GET /ventas/` con `limit=20` y `offset=0` y se listan las ventas

#### Scenario: Avanzar
- **WHEN** la primera página trae 20 ventas y se pulsa «Siguiente»
- **THEN** se consulta con `offset=20`

### Requirement: Estados del historial
La vista SHALL distinguir cargando, historial vacío y error de conexión.

#### Scenario: Sin ventas
- **WHEN** la API devuelve una lista vacía en `offset` 0
- **THEN** se muestra «No hay ventas registradas.»

#### Scenario: Error
- **WHEN** la API no responde
- **THEN** se muestra el error con opción de reintentar

### Requirement: Detalle de la venta
Cada venta SHALL ofrecer «Ver detalle», que consulta `GET /ventas/{id}` y muestra fecha, cliente, cada renglón con título, cantidad, precio unitario y subtotal, y el total. Los importes MUST ser los devueltos por la API, sin recalcularlos.

#### Scenario: Ver una venta de dos renglones
- **WHEN** se abre el detalle de una venta con dos renglones
- **THEN** se muestran los dos renglones con su precio unitario y subtotal, y el total de la venta

#### Scenario: Precio histórico
- **WHEN** después de registrar la venta se cambia el precio de uno de sus libros con `PATCH /libros/{id}`
- **THEN** el detalle de la venta sigue mostrando el precio unitario y el total originales

#### Scenario: Venta inexistente
- **WHEN** el detalle responde 404
- **THEN** se informa «La venta no existe.» y el listado sigue visible

### Requirement: Apertura directa del detalle
Si la página se abre con `?venta={id}`, la vista SHALL abrir el detalle de esa venta al cargar. Al abrir un detalle desde el listado, la vista MUST reflejarlo con `?venta={id}` en la URL sin recargar; al cerrarlo, MUST quitar ese parámetro.

#### Scenario: Recargar el detalle
- **WHEN** se abre `historial.html?venta=5` y se recarga la página
- **THEN** se muestra de nuevo el detalle de la venta 5 con los mismos importes

#### Scenario: Abrir desde el listado
- **WHEN** se pulsa «Ver detalle» en una fila del listado
- **THEN** se muestra el detalle y la URL queda con `?venta={id}` de esa venta

#### Scenario: Recargar tras abrir desde el listado
- **WHEN** se abre un detalle desde el listado y se recarga la página
- **THEN** se vuelve a mostrar el detalle de la misma venta

#### Scenario: Cerrar el detalle
- **WHEN** se cierra el detalle
- **THEN** el panel se oculta y la URL deja de incluir `?venta`

### Requirement: Frontend sin estado local
Ninguna página del frontend SHALL leer ni escribir libros, clientes o ventas en `localStorage`; todos los registros MUST provenir de la API.

#### Scenario: Revisión del código
- **WHEN** se busca `localStorage` y los scripts del parcial 1 en `frontend/public`
- **THEN** no hay resultados
