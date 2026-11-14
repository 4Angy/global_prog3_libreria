# Sistema visual — Librería ABC

Mode: system-only
Revision: 1
Approval: approved

Decisión: elegida por el grupo durante la fundación de Active Orchestrator (2026-11-14). Las pantallas de los changes visuales (02 a 07) se implementan con este sistema, sin mockups por change.

## Fuentes
- `frontend/public/css/estilos.css` (Parcial 1): tokens y componentes relevados sin cambios.
- `frontend/public/logo.png` y `index.html`: logo, nombre y estructura de cabecera.
- `knowledge-base/` (estados del catálogo, borrador de ventas, mensajes 409/422).

## Archivos
| Archivo | Contenido |
|---|---|
| `tokens.css` | Color, tipografía, espaciado, radios, sombra, bordes, foco, movimiento y anchos |
| `components.css` | Base, layout, tarjetas, formularios, botones, tablas, mensajes, foco, breakpoints (640 / 1024 px), movimiento reducido |
| `components.html` | Muestra de componentes y estados usados por el Global |
| `brand.md` / `brand.js` | Nombre, logo, tono y reglas |
| `assets/logo.png`, `assets/logo.svg` | Logo actual y ruta estable |
| `previews/` | Capturas 390×844 y 1440×900 |

## Cambios respecto del Parcial 1
- Nuevo estado `.boton:disabled` (venta en envío, RN-VE-10).
- Los estados «Cargando…», «sin coincidencias» y «error de conexión» del catálogo reutilizan `.estado-vacio` y `.mensaje--error`; no hacen falta clases nuevas.

## Cómo aplicarlo en el frontend
`estilos.css` sigue siendo la hoja que cargan las páginas. Al tocar un token o componente, se cambia acá y en `estilos.css`, se sube `Revision:` y la aprobación vuelve a `pending`.

## Decisiones abiertas
- (TBD) Si el selector «Buscar por» y los filtros de precio se quitan del catálogo (DD-03), el formulario queda con un solo campo; se mantiene `.campo--busqueda`.
