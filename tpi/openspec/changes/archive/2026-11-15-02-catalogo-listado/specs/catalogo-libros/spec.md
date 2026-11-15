# Spec Delta

## Purpose

Permite consultar el catálogo de libros guardado en PostgreSQL a través de la API: buscar por título, recorrerlo por páginas, ver los datos principales de cada libro.

## ADDED Requirements

### Requirement: Carga inicial del catálogo
Al abrir el catálogo, la vista SHALL pedir la primera página de libros a la API con `limit` 20 y `offset` 0, sin filtro de título.

#### Scenario: Apertura de la página
- **WHEN** se abre el catálogo
- **THEN** se consulta `GET /libros/` con `limit=20` y `offset=0` y se muestran los libros devueltos

### Requirement: Búsqueda por título
La vista SHALL buscar por coincidencia parcial del título, sin distinguir mayúsculas, delegando el filtro en la API. Cada búsqueda nueva MUST volver el desplazamiento a 0.

#### Scenario: Búsqueda parcial
- **WHEN** se busca `quijote` y existe «Don Quijote de la Mancha»
- **THEN** ese libro aparece en el resultado

#### Scenario: Búsqueda desde una página avanzada
- **WHEN** se está en la segunda página y se busca otro título
- **THEN** la consulta se envía con `offset=0`

#### Scenario: Quitar el filtro
- **WHEN** se borra la búsqueda
- **THEN** se vuelve a mostrar la primera página del catálogo completo

### Requirement: Paginación
La vista SHALL permitir avanzar y retroceder de a `limit` libros, conservando el texto de búsqueda. «Anterior» MUST quedar deshabilitado en `offset` 0 y «Siguiente» cuando la página recibida tiene menos de `limit` libros.

#### Scenario: Avanzar
- **WHEN** la primera página trae 20 libros y se pulsa «Siguiente»
- **THEN** se consulta con `offset=20`

#### Scenario: Última página
- **WHEN** la página recibida trae menos de 20 libros
- **THEN** «Siguiente» queda deshabilitado

#### Scenario: Primera página
- **WHEN** el desplazamiento es 0
- **THEN** «Anterior» queda deshabilitado

### Requirement: Columnas del listado
Cada fila SHALL mostrar título, ISBN, precio con formato de moneda, editorial y género. Si el género es nulo, MUST mostrar «Sin clasificar». Los datos se insertan como texto, nunca como HTML.

#### Scenario: Libro sin género
- **WHEN** la API devuelve un libro con `genero` nulo
- **THEN** la columna Género muestra «Sin clasificar»

#### Scenario: Título con marcado
- **WHEN** un título contiene `<b>`
- **THEN** se muestra literalmente y no se interpreta

### Requirement: Estados de la vista
La vista SHALL mostrar como máximo uno de estos estados: cargando, catálogo vacío, búsqueda sin coincidencias o error de conexión. Mientras carga, los controles de búsqueda y paginación MUST quedar deshabilitados.

#### Scenario: Cargando
- **WHEN** hay una consulta en curso
- **THEN** se muestra «Cargando…» y los botones están deshabilitados

#### Scenario: Catálogo vacío
- **WHEN** sin búsqueda y en `offset` 0 la API devuelve una lista vacía
- **THEN** se muestra «No hay libros en el catálogo.»

#### Scenario: Sin coincidencias
- **WHEN** con búsqueda la API devuelve una lista vacía
- **THEN** se muestra «No se encontraron libros para la búsqueda.»

#### Scenario: Error de conexión
- **WHEN** la API no responde o responde con error
- **THEN** se muestra un mensaje de error con opción de reintentar y la tabla queda vacía
