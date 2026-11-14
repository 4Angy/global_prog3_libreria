# Design

## Context

- Easypanel construye cada servicio App desde una carpeta del repositorio (Build Path) con su `Dockerfile`.
- Los servicios del mismo proyecto se ven por la red interna con el nombre `<proyecto>_<servicio>`; por eso `API_UPSTREAM` es, por ejemplo, `grupo1_backend:8000`.
- El frontend recibe HTTPS en el dominio de Easypanel y Easypanel le habla por HTTP al puerto 80.
- La imagen del backend aplica `alembic upgrade head` al arrancar (change `09`).

## Goals / Non-Goals

**Goals:**
- Que el despliegue sea reproducible siguiendo solo `DEPLOY.md`.
- Que la evidencia no muestre contraseñas ni valores privados.

**Non-Goals:**
- CI/CD o despliegue automático en cada push.

## Decisions

1. **Un solo repositorio** con `frontend/` y `backend/` en la raíz, como pide la guía.
2. **Backend sin dominio:** si Easypanel le asigna uno automático, se quita.
3. **Carga inicial desde Shell del backend:** `python scripts/datos_iniciales.py`, que no escribe si la base ya tiene datos.
4. **Evidencia:** `evidencia/G-0X-*.png` con capturas de la pantalla y de la pestaña Red, y una tabla en `DEPLOY.md` con paso, resultado esperado, resultado observado y archivo.
5. **G-05 (precio histórico):** el `PATCH /libros/{id}` se hace desde la consola del navegador en la URL pública con `Api.patch`, porque el frontend no tiene pantalla de edición.
6. **G-07 (persistencia):** se redespliegan los dos servicios y se vuelve a abrir una venta ya registrada.

## Risks / Trade-offs

- [El nombre interno del backend no coincide con el ejemplo] → Se toma de Easypanel y se documenta el valor real en `DEPLOY.md`.
- [502 en `/api/`] → Tabla de diagnóstico de la guía en `DEPLOY.md`.
