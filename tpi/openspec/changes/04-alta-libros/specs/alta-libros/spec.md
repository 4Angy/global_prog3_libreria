# Spec Delta

## Purpose

Permite registrar libros nuevos en la API desde `libros.html`, con editorial y género elegidos de las opciones de la API y autorías verificadas una por una.

## ADDED Requirements

### Requirement: Opciones de editorial y género
Al abrir la página, el formulario SHALL cargar las editoriales desde `GET /editoriales/` y los géneros desde `GET /generos/`. El género MUST ser opcional, con la opción «Sin clasificar». Si alguna carga falla, el formulario MUST informar el error y no permitir el envío.

#### Scenario: Carga de opciones
- **WHEN** se abre la página de libros
- **THEN** el selector de editorial lista las editoriales de la API y el de género lista «Sin clasificar» seguido de los géneros de la API

#### Scenario: Falla la carga
- **WHEN** `GET /editoriales/` no responde
- **THEN** se muestra un error con opción de reintentar y el botón de registro queda deshabilitado

### Requirement: Autorías verificadas
El formulario SHALL permitir agregar autorías ingresando el ID del autor y un rol entre `autor`, `coautor`, `traductor` e `ilustrador`. Antes de agregarla, MUST verificar el ID con `GET /autores/{id}` y mostrar el nombre. Un mismo autor no se puede agregar dos veces. El orden de cada autoría es su posición en la lista.

#### Scenario: Autor existente
- **WHEN** se ingresa el ID 3, que existe, con rol `traductor`
- **THEN** se agrega una autoría con el nombre del autor, rol `traductor` y el orden siguiente

#### Scenario: Autor inexistente
- **WHEN** se ingresa un ID que responde 404
- **THEN** se informa que el autor no existe y no se agrega nada

#### Scenario: Autor repetido
- **WHEN** se ingresa un ID que ya está en la lista
- **THEN** se informa y la lista no cambia

#### Scenario: Quitar una autoría
- **WHEN** se quita la primera de tres autorías
- **THEN** las restantes pasan a tener orden 1 y 2

### Requirement: Validación del libro
Antes de enviar, el formulario MUST exigir título e ISBN no vacíos, precio mayor que cero con hasta dos decimales, stock entero mayor o igual a cero, una editorial y al menos una autoría. Si algo falla, MUST mostrar los motivos junto al formulario y no enviar.

#### Scenario: Sin autorías
- **WHEN** se intenta registrar un libro sin autorías
- **THEN** se informa que falta al menos un autor y no se envía la petición

#### Scenario: Stock negativo
- **WHEN** el stock es `-1`
- **THEN** se informa el error y no se envía la petición

### Requirement: Registro del libro
El formulario SHALL enviar `POST /libros/` con `titulo`, `isbn`, `precio`, `stock`, `editorial_id`, `genero_id` (o `null`) y `autores` con `autor_id`, `rol` y `orden`. Mientras se envía, el botón MUST quedar deshabilitado. Con el 201, MUST mostrar el libro devuelto, agregarlo a la tabla de libros registrados en la sesión y limpiar el formulario.

#### Scenario: Alta exitosa
- **WHEN** se registra un libro válido con dos autorías
- **THEN** la API responde 201, se muestra un mensaje con el título creado y la tabla suma una fila con los datos devueltos

#### Scenario: Doble clic
- **WHEN** se pulsa dos veces «Registrar libro»
- **THEN** se envía una sola petición

### Requirement: Rechazo del servidor
Ante un 409 o un 422, el formulario MUST mostrar el mensaje del servidor junto al formulario y conservar los datos cargados.

#### Scenario: ISBN repetido
- **WHEN** se registra un libro con un ISBN que ya existe
- **THEN** se muestra «El ISBN ya pertenece a otro libro.» y el formulario conserva sus valores
