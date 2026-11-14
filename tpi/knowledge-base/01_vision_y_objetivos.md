# Visión y Objetivos

## Propósito del sistema
Librería web integrada y desplegada: el frontend del Parcial 1 (HTML, CSS y JavaScript nativos) se conecta a la API del Parcial 2 (FastAPI + PostgreSQL), se empaqueta con Nginx en Docker y se publica en una VPS administrada con Easypanel.

En el Parcial 1 el navegador simulaba altas y ventas con `localStorage`. En el Global, los registros y los importes confirmados provienen de la API y se guardan en PostgreSQL; la interfaz solo puede mantener en memoria el borrador de una venta.

## Equipo
- **Grupo:** Super logicas
- **Integrantes:** Herrera Julieta; Zalazar María de los Ángeles

## Objetivos por actor
| Actor | Objetivo principal | Objetivos secundarios |
|---|---|---|
| Personal de la librería (usuario de la interfaz) | Consultar el catálogo y registrar ventas | Dar de alta libros y clientes; consultar el historial con importes históricos |
| Grupo de estudiantes (desarrolladores) | Entregar la app integrada, dockerizada y desplegada | Documentar despliegue (`DEPLOY.md`), ejecución local (`README.md`) y evidencia G-01 a G-07 |
| Cátedra (corrector) | Verificar el funcionamiento desde la URL pública | Reproducir el despliegue con lo entregado |

## Alcance v1.0 (Global)
- **Ej. 1 · Catálogo y cliente HTTP (20 pts):** cliente `fetch` centralizado con base `/api`; `GET /libros/` con `titulo`, `limit` y `offset`; detalle con autores desde `GET /libros/{id}`; cuatro estados (carga, vacío, sin coincidencias, error).
- **Ej. 2 · Altas (20 pts):** `POST /libros/` con autorías y `POST /clientes/`; selectores desde `GET /editoriales/` y `GET /generos/`; verificación por ID con `GET /autores/{id}` y `GET /clientes/{id}`; mensajes 409/422.
- **Ej. 3 · Ventas e historial (25 pts):** borrador en memoria, `POST /ventas/`, historial paginado `GET /ventas/` y detalle `GET /ventas/{id}` con importes históricos.
- **Ej. 4 · Imagen del frontend (15 pts):** `frontend/` con `public/`, `Dockerfile` (nginx:1.30-alpine), `.dockerignore` y `default.conf.template` con proxy `/api/`.
- **Ej. 5 · Despliegue (20 pts):** servicios App `backend` y `frontend` en Easypanel, HTTPS, casos G-01 a G-07, `DEPLOY.md`.

## Fuera de alcance
- Autenticación y autorización (no hay login real).
- Gestión de stock en la venta: el alta de venta registra renglones e importes; el stock es solo un dato del catálogo.
- Edición o eliminación de ventas confirmadas.
- Altas, bajas y modificaciones de editoriales, géneros y autores desde la interfaz.
- Librerías, frameworks o CDNs de CSS/JS en el frontend.
- Docker Compose (se usan dos servicios App de Easypanel).
- Cobros y facturación fiscal.

## Métricas de éxito
- Demostración mínima: desde la URL desplegada, consultar el catálogo, registrar una venta con dos renglones y reabrir el detalle tras recargar; los importes del historial coinciden con los de la API.
- G-01 a G-07 ejecutados con evidencia en `evidencia/`.
- `/api/health/ready` responde 200 bajo el dominio HTTPS del frontend.
- Los datos persisten tras un redespliegue.
