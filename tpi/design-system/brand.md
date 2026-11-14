# Marca — Librería ABC

| Elemento | Valor | Fuente |
|---|---|---|
| Nombre del producto | Librería ABC | `frontend/public/index.html` (`.marca-nombre`) |
| Grupo | Super logicas (Herrera Julieta, Zalazar María de los Ángeles) | `knowledge-base/01_vision_y_objetivos.md` |
| Logo | `assets/logo.png` (397×402, fondo blanco); `assets/logo.svg` lo envuelve con ruta estable | `frontend/public/logo.png` |
| Paleta | C «Minimal natural»: verde `#2F5D50` primario, dorado `#C2A25A` solo decorativo | `estilos.css` sección 1 |
| Tipografía | Pila del sistema (`system-ui`, Segoe UI, Roboto…), sin fuentes remotas | `estilos.css` sección 1 |

## Tono
- Sobrio y funcional: herramienta interna para el personal de la librería.
- Mensajes en español, cortos y explícitos; el texto dice qué pasó y el color solo refuerza.

## Reglas de uso
- El logo es decorativo (`alt=""`) y siempre va junto al nombre en texto, a `--alto-marca` (3 rem).
- El acento dorado nunca se usa como color de texto (no alcanza contraste AA).
- Sin frameworks, CDNs ni fuentes externas (consigna del Parcial 1, vigente en el Global).
- Los datos que llegan de la API se insertan como texto (`textContent`).
