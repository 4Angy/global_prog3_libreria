# Tasks

## 1. Estructura

- [ ] 1.1 Mover `public/logo.png` a `public/img/logo.png` y actualizar el `src` en las cinco páginas. Verificar que el logo se ve en todas.

## 2. Imagen

- [ ] 2.1 Crear `frontend/Dockerfile` y `frontend/.dockerignore` con el contenido exacto de la consigna.
- [ ] 2.2 Con Docker Desktop iniciado, ejecutar `docker info`, `docker build -t libreria-frontend .` y el `docker run` de design.md. Verificar `http://127.0.0.1:8080/api/health/ready` (200), el catálogo y el detalle de un libro; detener el backend y comprobar el 502.

## 3. Documentación

- [ ] 3.1 Reemplazar en `tpi/README.md` el comando con volúmenes por el build y run de la imagen, dejando el de volúmenes como opción para desarrollo.

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.
