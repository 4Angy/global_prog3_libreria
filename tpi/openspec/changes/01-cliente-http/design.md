# Design

## Context

- El frontend del parcial 1 usa scripts clásicos (sin módulos ES) para poder abrirse con `file://`.
- El backend responde los errores de dominio como `{"detail": "mensaje"}` (404, 409) y los de validación como `{"detail": [{"msg": ...}, ...]}` (422). Un error de base no traducido responde 500 con `detail` genérico.
- La consigna fija el proxy de Nginx: `/api/` se reenvía a `http://${API_UPSTREAM}/`, así que `/api/libros/` llega a FastAPI como `/libros/`. El backend no tiene CORS y no hace falta: el navegador ve un solo origen.

## Goals / Non-Goals

**Goals:**
- Un cliente HTTP que los changes `02` a `07` usen sin modificarlo.
- Probar en local con el mismo proxy que se usa en Easypanel.

**Non-Goals:**
- Migrar a módulos ES o agregar un bundler.
- Reintentos automáticos o caché de respuestas.

## Decisions

1. **`js/api.js` como script clásico con un objeto global `Api`.** Expone `Api.get(ruta, params)`, `Api.post(ruta, cuerpo)` y `Api.patch(ruta, cuerpo)` sobre una función interna `pedir`. `API_BASE = "/api"`. La ruta del backend se concatena tal cual, sin agregar ni quitar barras.
   *Alternativa:* módulos ES. Se descarta para mantener el estilo del parcial.
2. **Error uniforme `ErrorApi { estado, mensaje, esConexion }`.** El mensaje se toma de `detail`: si es texto, se usa tal cual; si es una lista (422), se unen los `msg` sin el prefijo `Value error, `. Si el cuerpo no es JSON (por ejemplo un 502 de Nginx), se usa un texto genérico por estado. Un `fetch` rechazado (red caída) produce `esConexion: true` y `estado: 0`.
3. **Query sin valores vacíos:** los parámetros `null`, `undefined` o `""` no se envían; el resto se codifica con `URLSearchParams`.
4. **Verificación local con el Nginx oficial y la plantilla de la consigna**, sin esperar al `Dockerfile` del change `08`. Desde `frontend/`:
   `docker run --rm -p 127.0.0.1:8080:80 -v "%CD%\public:/usr/share/nginx/html:ro" -v "%CD%\default.conf.template:/etc/nginx/templates/default.conf.template:ro" -e NGINX_ENVSUBST_FILTER=^API_UPSTREAM$ -e API_UPSTREAM=host.docker.internal:8000 nginx:1.30-alpine`

## Risks / Trade-offs

- [El backend requiere PostgreSQL y datos de prueba] → Se usa `backend/scripts/datos_iniciales.py`, como en el parcial 2.
- [`host.docker.internal` no existe en Docker de Linux] → Agregar `--add-host=host.docker.internal:host-gateway`, como indica la consigna.
- [Las páginas que todavía usan `localStorage` siguen funcionando] → Solo se agrega un `<script>`; no se quita nada hasta el change de cada pantalla.
