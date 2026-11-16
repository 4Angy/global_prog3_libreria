# Spec Delta

## Purpose

Permite registrar clientes en la API desde `clientes.html` y encontrarlos por su ID, ya que la API no ofrece un listado.

## ADDED Requirements

### Requirement: Validación del cliente
Antes de enviar, el formulario MUST exigir un nombre no vacío y un email con formato válido, y mostrar los motivos junto al formulario si algo falla.

#### Scenario: Email inválido
- **WHEN** se intenta registrar un cliente con email `ana@`
- **THEN** se informa el error y no se envía la petición

### Requirement: Registro del cliente
El formulario SHALL enviar `POST /clientes/` con `nombre` y `email`. Mientras se envía, el botón MUST quedar deshabilitado. Con el 201, MUST mostrar el ID asignado, agregar el cliente a la tabla de la sesión y limpiar el formulario.

#### Scenario: Alta exitosa
- **WHEN** se registra un cliente válido
- **THEN** la API responde 201 y se muestra un mensaje con el nombre y el ID asignado

### Requirement: Rechazo del servidor
Ante un 409 o un 422, el formulario MUST mostrar el mensaje del servidor y conservar los datos cargados.

#### Scenario: Email repetido
- **WHEN** se registra un cliente con un email que ya existe
- **THEN** se muestra «Ya existe un cliente con ese correo.» y el formulario conserva sus valores

### Requirement: Búsqueda por ID
La página SHALL permitir buscar un cliente por su ID con `GET /clientes/{id}` y mostrar su nombre y email. El ID MUST ser un entero positivo.

#### Scenario: Cliente existente
- **WHEN** se busca el ID de un cliente creado
- **THEN** se muestran su nombre y email

#### Scenario: Cliente inexistente
- **WHEN** se busca un ID que responde 404
- **THEN** se informa «El cliente no existe.»
