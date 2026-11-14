# Design

## Context

- `POST /clientes/` recibe `{nombre, email}` (campos extra → 422) y devuelve 201 con `{id, nombre, email, perfil: null}`. Un email repetido responde 409 «Ya existe un cliente con ese correo.».
- `GET /clientes/{id}` devuelve el cliente o 404 «El cliente no existe.».
- No hay `GET /clientes/`.
- `validarCliente(datos, contexto)` busca emails repetidos en el estado local.

## Goals / Non-Goals

**Goals:**
- Que el usuario sepa el ID del cliente creado, porque lo va a necesitar para la venta.

**Non-Goals:**
- Editar clientes o cargar su perfil.

## Decisions

1. **Búsqueda por ID**, como permite la consigna cuando el backend solo expone la consulta individual. Un formulario aparte con «ID del cliente» y «Buscar»; el resultado se muestra en una tarjeta debajo.
2. **`validarCliente(datos)` sin contexto:** nombre no vacío y email con formato válido (`EXPRESION_EMAIL`). El email repetido lo decide la API.
3. **Email normalizado** con `normalizarEmail` (recorta espacios y pasa a minúsculas) antes de enviarlo.
4. **Tabla de la sesión en memoria**, con ID, nombre y email devueltos por el 201.
5. **Envío único:** el botón se deshabilita mientras dura el `POST`.

## Risks / Trade-offs

- [Al recargar se pierde la tabla de la sesión] → Los clientes siguen en la API y se encuentran por ID.
