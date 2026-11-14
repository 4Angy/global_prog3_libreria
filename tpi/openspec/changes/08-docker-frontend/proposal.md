# Proposal

## Why

El **Ejercicio 4 · Dockerfile del frontend** (15 puntos) pide una imagen de Nginx que sirva el sitio y reenvíe `/api/` al backend. Es lo que Easypanel va a construir en el change `10`. La plantilla de Nginx ya existe desde el change `01`.

## What Changes

- Se agrega `frontend/Dockerfile` con el contenido exacto de la consigna (`nginx:1.30-alpine`, `NGINX_ENVSUBST_FILTER`, dos `COPY`, `EXPOSE 80`).
- Se agrega `frontend/.dockerignore` con las entradas de la consigna.
- El logo pasa a `public/img/` para respetar la estructura `css/`, `js/`, `img/`.
- Se documenta en el README cómo construir y ejecutar la imagen en local.

## Capabilities

### New Capabilities

- `imagen-frontend`: estructura de `frontend/`, imagen Docker y verificación local del proxy.

### Modified Capabilities

- Ninguna.

## Impact

- **Frontend:** nuevos `frontend/Dockerfile` y `frontend/.dockerignore`; `logo.png` se mueve a `public/img/` y se actualizan las cinco páginas.
- **Documentación:** README con `docker build` y `docker run`.
- **Depende de:** `01-cliente-http` (`default.conf.template`). Conviene hacerlo después de `07` para probar todas las pantallas dentro de la imagen.
