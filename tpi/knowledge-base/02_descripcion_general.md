# Descripción General

## Stack tecnológico
| Capa | Tecnologías | Versión mínima |
|---|---|---|
| Frontend | HTML, CSS y JavaScript nativos (scripts clásicos, sin módulos ni frameworks) | Navegadores actuales |
| Servidor web / proxy | Nginx (imagen oficial) | `nginx:1.30-alpine` |
| Backend | Python, FastAPI (handlers `async def`) | Python 3.12, FastAPI 0.111 |
| ORM / contratos | SQLModel, SQLAlchemy asincrónico | SQLModel 0.0.24, SQLAlchemy 2.0 |
| Driver DB | asyncpg | 0.30 |
| Base de datos | PostgreSQL | 16 |
| Configuración | python-dotenv (`.env` no versionado) | 1.0 |
| Migraciones | Alembic (pedido por la guía del Global; hoy no está en el backend) | — |
| Contenedores | Docker | 20.10 |
| Despliegue | Easypanel sobre VPS | — |

## Arquitectura general
```
Navegador ──HTTPS──▶ Easypanel (dominio del frontend)
                         │ HTTP :80
                         ▼
               ┌─────────────────────┐
               │ servicio frontend   │  Nginx
               │  /      → public/   │  (archivos estáticos)
               │  /api/  → proxy ────┼──▶ http://${API_UPSTREAM}/
               └─────────────────────┘         │ red interna
                                               ▼
                                     ┌──────────────────┐
                                     │ servicio backend │ Uvicorn 0.0.0.0:8000
                                     │ FastAPI          │
                                     └────────┬─────────┘
                                              │ postgresql+asyncpg
                                              ▼
                                         PostgreSQL
```
- **Mismo origen:** el navegador solo habla con el dominio del frontend; Nginx reenvía `/api/` al backend. No hace falta CORS.
- **Prefijo:** la barra final de `proxy_pass http://${API_UPSTREAM}/;` hace que `/api/libros/` llegue a FastAPI como `/libros/`.
- **Backend privado:** sin dominio público; solo accesible por la red interna de Easypanel.

## Integraciones externas
| Servicio | Propósito | Tipo |
|---|---|---|
| Easypanel | Build desde Git (Build Path `/backend` y `/frontend`), variables, dominios HTTPS, logs y shell | Panel de despliegue |
| PostgreSQL asignado | Persistencia | Conexión TCP interna |
| Repositorio Git | Fuente del build | Git |

## API REST (contrato usado por el frontend)
Todas las rutas se consumen desde el navegador con el prefijo `/api`.

| Recurso | Método y ruta | Uso en el frontend | Códigos |
|---|---|---|---|
| Salud | `GET /health/live`, `GET /health/ready` | Verificación de despliegue | 200 / 503 |
| Libros | `GET /libros/?titulo&genero_id&limit&offset` | Catálogo y buscador de la venta | 200, 422 |
| | `GET /libros/{id}` | Detalle con autores (rol y orden) | 200, 404 |
| | `POST /libros/` | Alta de libro con autorías | 201, 409, 422 |
| | `PATCH /libros/{id}` | Caso G-05 (cambio de precio) | 200, 404, 409, 422 |
| Editoriales | `GET /editoriales/?limit&offset` | Selector del alta de libro | 200, 422 |
| Géneros | `GET /generos/?limit&offset` | Selector del alta de libro | 200 |
| Autores | `GET /autores/{id}` | Verificar autor antes de agregar autoría | 200, 404 |
| Clientes | `POST /clientes/` | Alta de cliente | 201, 409, 422 |
| | `GET /clientes/{id}` | Buscar cliente por ID (no hay listado) | 200, 404 |
| Ventas | `POST /ventas/` | Confirmar venta | 201, 409, 422 |
| | `GET /ventas/?limit&offset` | Historial paginado | 200, 422 |
| | `GET /ventas/{id}` | Detalle con cliente y renglones | 200, 404 |

Paginación: `limit` 1..100 (por defecto 20), `offset` ≥ 0. Los listados devuelven una lista sin total.
