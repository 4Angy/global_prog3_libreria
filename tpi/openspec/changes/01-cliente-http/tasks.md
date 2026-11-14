# Tasks

## 1. Servidor web local

- [ ] 1.1 Crear `frontend/default.conf.template` con el contenido exacto de la consigna. Verificar levantando Nginx con el comando de design.md (decisión 4), con el backend en `:8000`, y comprobando que `http://127.0.0.1:8080/api/health/ready` responde 200 y que `http://127.0.0.1:8080/` muestra el catálogo.

## 2. Cliente HTTP

- [ ] 2.1 Crear `frontend/public/js/api.js` con `API_BASE = "/api"`, armado de query sin valores vacíos, `Api.get/post/patch` y `ErrorApi` (estado, mensaje, esConexion).
- [ ] 2.2 Cargar `js/api.js` en las cinco páginas, antes de los demás scripts. Verificar que las páginas funcionan igual que antes y que la consola no muestra errores.
- [ ] 2.3 Verificar desde la consola en `:8080`: `Api.get("/libros/", {limit: 2})` devuelve 2 libros; `Api.get("/libros/", {titulo: ""})` no envía `titulo` (pestaña Red); `Api.get("/libros/999999")` rechaza con estado 404 y «El libro no existe.»; `Api.post("/clientes/", {})` rechaza con estado 422 y un mensaje legible; con el backend apagado rechaza con estado 502 y mensaje genérico; con Nginx apagado rechaza con `esConexion === true`.

## 3. Documentación

- [ ] 3.1 Crear `tpi/README.md` (sección inicial) con cómo levantar PostgreSQL, el backend, cargar los datos de prueba y servir el frontend con el comando de Nginx. Verificar siguiendo el README desde cero.

## Workflow follow-up

- Archivar el change con `/openspec-archive-change` cuando estén todas las tareas.
