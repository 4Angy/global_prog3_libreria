# Spec Delta

## Purpose

Permite armar una venta en memoria, registrarla en la API y mostrar el comprobante con los importes que calculó el servidor.

## ADDED Requirements

### Requirement: Selección del cliente
La venta SHALL usar un cliente buscado por ID con `GET /clientes/{id}`. El cliente MUST quedar elegido solo si la API lo encontró, y se muestra su nombre.

#### Scenario: Cliente encontrado
- **WHEN** se busca un ID de cliente existente
- **THEN** se muestra su nombre y queda elegido para la venta

#### Scenario: Cliente inexistente
- **WHEN** se busca un ID que responde 404
- **THEN** se informa «El cliente no existe.» y no queda ningún cliente elegido

### Requirement: Armado del borrador
La vista SHALL permitir buscar libros por título en la API, agregarlos con una cantidad, cambiar cantidades y quitar renglones. El borrador MUST tener un solo renglón por libro: agregar un libro que ya está suma la cantidad al renglón existente.

#### Scenario: Agregar dos libros
- **WHEN** se agregan dos libros distintos
- **THEN** el borrador muestra dos renglones con su precio de catálogo y un total estimado

#### Scenario: Libro repetido
- **WHEN** se agrega 1 unidad de un libro que ya tiene 2
- **THEN** sigue habiendo un solo renglón para ese libro, con cantidad 3

#### Scenario: Quitar un renglón
- **WHEN** se quita un renglón
- **THEN** desaparece del borrador y el total estimado se recalcula

### Requirement: Validación de la venta
Antes de enviar, la vista MUST exigir un cliente elegido, al menos un renglón y cantidades enteras positivas en todos los renglones.

#### Scenario: Cantidad inválida
- **WHEN** un renglón tiene cantidad `0` o `1.5`
- **THEN** se informa el error y no se envía la petición

#### Scenario: Sin renglones
- **WHEN** se intenta registrar una venta sin renglones
- **THEN** se informa el error y no se envía la petición

### Requirement: Registro de la venta
La vista SHALL enviar `POST /ventas/` con un cuerpo que contenga únicamente `cliente_id` y `renglones` con `libro_id` y `cantidad`. Mientras se envía, el botón MUST quedar deshabilitado.

#### Scenario: Cuerpo enviado
- **WHEN** se confirma una venta del cliente 2 con 2 unidades del libro 1 y 1 del libro 4
- **THEN** el cuerpo es `{"cliente_id": 2, "renglones": [{"libro_id": 1, "cantidad": 2}, {"libro_id": 4, "cantidad": 1}]}`

#### Scenario: Doble clic
- **WHEN** se pulsa dos veces «Registrar venta»
- **THEN** se envía una sola petición

### Requirement: Comprobante
Con el 201, la vista SHALL mostrar el número de venta, la fecha, el cliente, y para cada renglón el precio unitario y el subtotal devueltos por la API, junto con el total de la respuesta. Después MUST limpiar el borrador y ofrecer un enlace al detalle en el historial.

#### Scenario: Venta exitosa
- **WHEN** la API responde 201
- **THEN** el comprobante muestra los importes de la respuesta, el borrador queda vacío y hay un enlace a `historial.html?venta={id}`

### Requirement: Rechazo de la venta
Ante un 409 o un 422, la vista MUST mostrar el mensaje del servidor y conservar el borrador y el cliente elegido.

#### Scenario: Libro eliminado
- **WHEN** la API responde 409 «El libro indicado no existe.»
- **THEN** se muestra ese mensaje y el borrador sigue igual

#### Scenario: Cuerpo inválido
- **WHEN** la API responde 422
- **THEN** se muestra el mensaje del servidor y el borrador sigue igual
