# Librería web integrada — Base de Conocimiento

Grupo **Super logicas**: Herrera Julieta y Zalazar María de los Ángeles.

Base de conocimiento generada a partir de las consignas en `docs/` (Global, Parcial 1 y Parcial 2) y del código actual de `frontend/` y `backend/`.

## Índice de Archivos

| Archivo | Contenido |
|---------|-----------|
| [01_vision_y_objetivos.md](01_vision_y_objetivos.md) | Propósito, actores, alcance por ejercicio, fuera de alcance, métricas |
| [02_descripcion_general.md](02_descripcion_general.md) | Stack, arquitectura Nginx → FastAPI → PostgreSQL, contrato REST usado |
| [03_actores_y_roles.md](03_actores_y_roles.md) | Actores, permisos (sin autenticación), rutas públicas |
| [04_modelo_de_datos.md](04_modelo_de_datos.md) | Nueve tablas, relaciones, restricciones, formato JSON, semilla |
| [05_reglas_de_negocio.md](05_reglas_de_negocio.md) | Reglas RN-HT, RN-CA, RN-LI, RN-CL, RN-VE, RN-DE, RN-GL |
| [06_funcionalidades.md](06_funcionalidades.md) | Épicas por ejercicio e historias US-001 a US-010 con su change |
| [07_flujos_principales.md](07_flujos_principales.md) | Catálogo, detalle, altas, venta, historial y despliegue |
| [08_arquitectura_propuesta.md](08_arquitectura_propuesta.md) | Patrones, directorios, seguridad, variables de entorno |
| [09_decisiones_y_supuestos.md](09_decisiones_y_supuestos.md) | DD-00 (manda el Global) a DD-11 y supuestos SU-01 a SU-03 |
| [10_preguntas_abiertas.md](10_preguntas_abiertas.md) | Inconsistencias IN-01 a IN-06 y preguntas priorizadas |

## Quick Start para Desarrolladores

1. Entender el dominio → [01](01_vision_y_objetivos.md), [03](03_actores_y_roles.md)
2. Entender los datos → [04](04_modelo_de_datos.md)
3. Entender las reglas → [05](05_reglas_de_negocio.md)
4. Entender la arquitectura → [02](02_descripcion_general.md), [08](08_arquitectura_propuesta.md)
5. Implementar → [07](07_flujos_principales.md), [06](06_funcionalidades.md)
6. Antes de codificar → [10](10_preguntas_abiertas.md)

## Resumen Ejecutivo

El Global reemplaza el `localStorage` del Parcial 1 por la API FastAPI del Parcial 2: catálogo, altas, ventas e historial pasan por un cliente `fetch` con base `/api`, servido detrás de Nginx. El frontend se empaqueta con `nginx:1.30-alpine` y ambos servicios se publican en Easypanel. Ante contradicciones entre consignas manda el Global; por eso se agrega Alembic aunque el backend del Parcial 2 usa `create_all`.
