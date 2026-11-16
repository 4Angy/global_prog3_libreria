# Design

## Context

- Estructura pedida: `frontend/{Dockerfile, .dockerignore, default.conf.template, public/{index.html, css/, js/, img/}}`, con la configuración y los archivos de entorno fuera de `public/`.
- La imagen oficial de Nginx procesa `/etc/nginx/templates/*.template` con `envsubst` al arrancar; `NGINX_ENVSUBST_FILTER=^API_UPSTREAM$` evita que reemplace `$uri` y otras variables de Nginx.
- En Windows con Docker Desktop no hace falta `--add-host`.

## Goals / Non-Goals

**Goals:**
- Que la imagen sea exactamente la de la consigna, para que la corrección la reconozca.

**Non-Goals:**
- Optimizar la imagen (compresión, caché de estáticos, cabeceras de seguridad).

## Decisions

1. **Dockerfile y `.dockerignore` textuales de la consigna**, sin agregados.
2. **`logo.png` a `public/img/logo.png`** y actualizar el `src` en las cinco páginas.
3. **Verificación local** desde `frontend/`, con el backend en `:8000`:
   `docker build -t libreria-frontend .`
   `docker run --rm --name libreria-frontend -p 127.0.0.1:8080:80 -e API_UPSTREAM=host.docker.internal:8000 libreria-frontend`
4. **El comando con volúmenes del change `01` se reemplaza en el README** por el de la imagen.

## Risks / Trade-offs

- [Un cambio en `public/` exige reconstruir la imagen] → En desarrollo se puede seguir usando el comando con volúmenes; queda anotado.
