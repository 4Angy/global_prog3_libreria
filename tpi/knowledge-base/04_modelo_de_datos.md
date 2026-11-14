# Modelo de Datos

Los nombres de tablas y columnas vienen fijados por la consigna del Parcial 2 (se pueden agregar columnas, no quitar ni renombrar).

## Dominios
- **Catálogo:** editorial, género, autor, libro y autoría (`libro_autor`).
- **Clientes:** cliente y su perfil 1:1.
- **Ventas:** venta y sus renglones (composición).

## ERD
```
editorial 1 ───< libro >─── 0..1 genero
                   │
                   1
                   │
                   ^
              libro_autor (PK libro_id+autor_id, rol, orden)
                   v
                   │
                   1
                 autor

cliente 1 ─── 0..1 perfil_cliente (cliente_id UNIQUE)
cliente 1 ───< venta 1 ───<◆ renglon_venta >─── 1 libro
```
| Relación | Tipo | Lado de la FK |
|---|---|---|
| Libro – Editorial | Agregación | `libro.editorial_id` |
| Libro – Género | Agregación opcional | `libro.genero_id` (nulo permitido) |
| Libro – Autor | Muchos a muchos con datos | `libro_autor` |
| Cliente – Perfil | Uno a uno | `perfil_cliente.cliente_id` UNIQUE |
| Venta – Cliente | Asociación | `venta.cliente_id` |
| Venta – Renglón | Composición | `renglon_venta.venta_id` ON DELETE CASCADE |
| Renglón – Libro | Asociación | `renglon_venta.libro_id` |

## Entidades
### editorial
- `id` int PK, `nombre` str UNIQUE, `pais` str nulo.

### genero
- `id` int PK, `nombre` str UNIQUE.

### autor
- `id` int PK, `nombre` str, `nacionalidad` str nulo.

### libro
- `id` int PK, `isbn` str UNIQUE, `titulo` str, `precio` NUMERIC(10,2), `stock` int, `editorial_id` FK indexada, `genero_id` FK indexada nula.
- CHECK `precio > 0` (`ck_libro_precio_positivo`), CHECK `stock >= 0` (`ck_libro_stock_no_negativo`).

### libro_autor
- PK (`libro_id`, `autor_id`), `rol` str, `orden` int; índice en `autor_id`.
- CHECK `orden >= 1`; CHECK `rol IN ('autor','coautor','traductor','ilustrador')`.

### cliente
- `id` int PK, `nombre` str, `email` str UNIQUE.

### perfil_cliente
- `id` int PK, `cliente_id` FK UNIQUE, `telefono` nulo, `direccion` nulo.

### venta
- `id` int PK, `cliente_id` FK indexada, `fecha` timestamptz, `total` NUMERIC(12,2); CHECK `total >= 0`.

### renglon_venta
- `id` int PK, `venta_id` FK indexada ON DELETE CASCADE, `libro_id` FK indexada, `cantidad` int, `precio_unitario` NUMERIC(10,2).
- CHECK `cantidad > 0`, CHECK `precio_unitario > 0`.
- `precio_unitario` se copia del libro al crear la venta y no se recalcula.

## Representación en la API
- Importes (`precio`, `precio_unitario`, `subtotal`, `total`) viajan como **cadenas** decimales (`"24500.00"`).
- `fecha` viaja en ISO 8601 UTC con `Z`.
- `GET /libros/` devuelve `editorial` y `genero` como objetos (`genero` puede ser `null`); `GET /libros/{id}` agrega `stock` y `autores[] {autor{id,nombre}, rol, orden}`.
- `GET /ventas/{id}` devuelve `cliente {id,nombre,email}` y `renglones[] {libro_id, titulo, cantidad, precio_unitario, subtotal}`.

## Seed data inicial
`backend/scripts/datos_iniciales.py` carga la semilla que venía del frontend del Parcial 1, en una sola transacción, y no escribe nada si alguna de las nueve tablas ya tiene filas.

| Tabla | Filas |
|---|---|
| editorial | 7 |
| genero | 5 |
| autor | 10 |
| libro | 9 (stock 10 cada uno; «Veinte poemas de amor» sin género) |
| libro_autor | 10 |
| cliente | 4 |
| perfil_cliente | 4 |
| venta | 2 |
| renglon_venta | 4 |

Con esta semilla, el cuerpo de ejemplo de la consigna (`cliente_id 2`, libros 1×2 y 4×1) da `68900.00`, no los `77000.00` del ejemplo del Parcial 2.
