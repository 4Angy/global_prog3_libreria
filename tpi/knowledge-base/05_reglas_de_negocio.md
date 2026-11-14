# Reglas de Negocio

Cada regla tiene un código `RN-{DOMINIO}-{NN}`. Entre paréntesis, dónde se garantiza: **API** (backend/base) o **UI** (frontend).

## Dominio: Cliente HTTP (RN-HT)
- **RN-HT-01**: Todas las peticiones pasan por un único módulo con `fetch` y base pública `/api` (UI).
- **RN-HT-02**: Se conserva la barra final de las rutas que la traen (`/api/libros/`) (UI).
- **RN-HT-03**: Ante 409 o 422 se muestra el mensaje del servidor (`detail`); ante fallo de red, un error de conexión distinguible (UI).

## Dominio: Catálogo (RN-CA)
- **RN-CA-01**: La búsqueda por `titulo` es parcial y sin distinguir mayúsculas; la resuelve la API con `ILIKE` y parámetro ligado (API).
- **RN-CA-02**: `limit` entre 1 y 100 (por defecto 20) y `offset` ≥ 0; fuera de rango → 422 (API). Al cambiar el filtro, `offset` vuelve a 0 (UI).
- **RN-CA-03**: Género nulo se muestra como «Sin clasificar» (UI).
- **RN-CA-04**: Se distinguen cuatro estados: cargando, catálogo vacío, búsqueda sin coincidencias y error de conexión (UI).
- **RN-CA-05**: Los datos recibidos se insertan como texto en el DOM, nunca como HTML (UI).

## Dominio: Libros (RN-LI)
- **RN-LI-01**: `precio` > 0 y `stock` entero ≥ 0 (UI + API: Pydantic y CHECK).
- **RN-LI-02**: `isbn` único; repetido → 409 con mensaje propio (API: UNIQUE).
- **RN-LI-03**: Editorial obligatoria y existente; género opcional y existente; referencia inexistente → 409 «La referencia indicada no existe.» (API: FK).
- **RN-LI-04**: Al menos una autoría desde el formulario (UI). La API acepta `autores: []`, por eso la regla vive en la interfaz.
- **RN-LI-05**: Cada autoría lleva `autor_id`, `rol` ∈ {autor, coautor, traductor, ilustrador} y `orden` ≥ 1; un autor no se repite en el mismo libro (UI + API: PK compuesta y CHECK).
- **RN-LI-06**: El cuerpo no admite campos extra (`extra="forbid"`) → 422 (API).

## Dominio: Clientes (RN-CL)
- **RN-CL-01**: `nombre` y `email` obligatorios; email con formato válido (UI + API).
- **RN-CL-02**: `email` único; repetido → 409 «Ya existe un cliente con ese correo.» (API: UNIQUE).
- **RN-CL-03**: Como no hay listado, el cliente se busca por ID con `GET /clientes/{id}` y se muestra su nombre antes de seleccionarlo (UI).

## Dominio: Ventas (RN-VE)
- **RN-VE-01**: Una venta exige cliente y al menos un renglón (UI + API: `min_length=1`).
- **RN-VE-02**: Cantidades enteras positivas (UI + API: `gt=0` y CHECK).
- **RN-VE-03**: Un solo renglón por libro; agregar de nuevo el mismo libro suma cantidad en la UI; repetido en el cuerpo → 422 (UI + API).
- **RN-VE-04**: El cuerpo de `POST /ventas/` lleva únicamente `cliente_id` y `renglones[{libro_id, cantidad}]`; no viajan precio, total ni fecha (UI + API: `extra="forbid"`).
- **RN-VE-05**: El servidor copia `precio_unitario` del libro y calcula subtotales y total; la UI muestra los importes de la respuesta, no los recalcula (API).
- **RN-VE-06**: Cliente o libro inexistente → 409 (API).
- **RN-VE-07**: Un cambio posterior del precio del libro no altera las ventas registradas (API).
- **RN-VE-08**: Las ventas confirmadas no se editan ni eliminan (`PATCH /ventas/{id}` → 405) (API + UI).
- **RN-VE-09**: El borrador vive solo en memoria; tras 201 se limpia; ante 409/422 se conserva (UI).
- **RN-VE-10**: El botón de confirmar se deshabilita mientras se envía (UI).
- **RN-VE-11**: La venta no descuenta stock (alcance de la consigna).

## Dominio: Despliegue (RN-DE)
- **RN-DE-01**: Ningún secreto en el repositorio, la imagen ni el ZIP; `.env` excluido; `env.example` con valores de muestra.
- **RN-DE-02**: `API_UPSTREAM` con forma `host:puerto`, sin `http://` ni barra final.
- **RN-DE-03**: El backend escucha en `0.0.0.0:8000` y no tiene dominio público.
- **RN-DE-04**: `DATABASE_URL` usa el driver `postgresql+asyncpg`; sin ella el backend no arranca.
- **RN-DE-05**: Se usan datos ficticios en el despliegue y en las pruebas.

## Dominio: Excepciones globales
- **RN-GL-01**: Los errores del backend usan mensajes propios; nunca texto de la base ni trazas.
- **RN-GL-02**: Un parámetro de ruta no entero → 422 sin ejecutar el handler.
