# Spec Delta

## Purpose

Define cómo el frontend se comunica con la API de la librería: una única URL base pública, el armado de rutas y parámetros, y la forma uniforme de reportar respuestas y errores a las vistas.

## ADDED Requirements

### Requirement: URL base única
El frontend SHALL enviar todas las peticiones a la API con el prefijo `/api` del mismo origen que sirve las páginas, definido en un solo lugar. La ruta del backend se agrega tal cual, incluida su barra final cuando la tiene.

#### Scenario: Listado con barra final
- **WHEN** una vista pide el listado de libros
- **THEN** la petición se envía a `/api/libros/` y no a `/api/libros`

#### Scenario: Recurso individual
- **WHEN** una vista pide el libro con id 7
- **THEN** la petición se envía a `/api/libros/7`

### Requirement: Parámetros de consulta
El cliente SHALL codificar los parámetros de consulta en la URL y omitir los que estén vacíos, sean nulos o no estén definidos.

#### Scenario: Búsqueda con texto especial
- **WHEN** se busca el título `El túnel & otros` con `limit` 20 y `offset` 0
- **THEN** la URL lleva `titulo`, `limit=20` y `offset=0`, con el texto codificado

#### Scenario: Búsqueda vacía
- **WHEN** se lista sin texto de búsqueda
- **THEN** la URL no incluye el parámetro `titulo`

### Requirement: Respuesta exitosa
El cliente SHALL devolver a la vista el cuerpo JSON de toda respuesta 2xx.

#### Scenario: Listado exitoso
- **WHEN** la API responde 200 con una lista
- **THEN** la vista recibe esa lista

### Requirement: Error del servidor
Ante una respuesta que no es 2xx, el cliente MUST rechazar la operación con un error que indique el código de estado y el mensaje del servidor. Si el cuerpo no trae un mensaje legible, usa un texto genérico.

#### Scenario: Recurso inexistente
- **WHEN** la API responde 404 con un cuerpo de error
- **THEN** la vista recibe un error con estado 404 y el mensaje del servidor

#### Scenario: Cuerpo de error no legible
- **WHEN** el proxy responde 502 con HTML
- **THEN** la vista recibe un error con estado 502 y un mensaje genérico

### Requirement: Error de conexión
Cuando la petición no obtiene respuesta, el cliente MUST rechazar la operación con un error marcado como error de conexión, distinto de un error del servidor.

#### Scenario: API caída
- **WHEN** el servidor no responde
- **THEN** la vista recibe un error de conexión y puede mostrarlo como tal
