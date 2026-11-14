# Spec Delta

## ADDED Requirements

### Requirement: Detalle con autores
Cada fila SHALL ofrecer una acción para ver el detalle, que consulta `GET /libros/{id}` y muestra los autores en orden, con su rol. Si falla, MUST mostrar el error sin perder el listado.

#### Scenario: Ver autores
- **WHEN** se pide el detalle de un libro con dos autorías
- **THEN** se muestran los dos autores en el orden indicado, con su rol

#### Scenario: Libro sin autores
- **WHEN** el detalle no trae autorías
- **THEN** se indica «Sin autores»

#### Scenario: Libro eliminado entre consultas
- **WHEN** el detalle responde 404
- **THEN** se informa el error y el listado sigue visible

