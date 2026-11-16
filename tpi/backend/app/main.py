"""Punto de entrada de la aplicación FastAPI."""

import logging
import sys

# Configuración básica de registro: garantiza que los mensajes de la aplicación
# (incluido el aviso del comprobante en segundo plano) sean visibles en la
# consola y, por lo tanto, en los registros del contenedor.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    stream=sys.stdout,
    force=False,
)

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

from app.core.config import get_settings
from app.core.errors import ErrorDeDominio
from app.core.registry import import_model_modules
from app.modules.autores.router import router as autores_router
from app.modules.clientes.router import router as clientes_router
from app.modules.editoriales.router import router as editoriales_router
from app.modules.generos.router import router as generos_router
from app.modules.health.router import router as health_router
from app.modules.libros.router import router as libros_router
from app.modules.ventas.router import router as ventas_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Crea los recursos de base al arrancar y los libera al apagar.

    El orden importa: primero la configuración (falla acá si falta
    `DATABASE_URL`), después el registro de modelos y recién entonces el
    motor y la fábrica de sesiones. Publicar los recursos en `app.state`
    permite que `get_session` los use por petición.
    """
    settings = get_settings()
    import_model_modules()

    engine = create_async_engine(settings.database_url, echo=settings.sql_echo)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    app.state.engine = engine
    app.state.session_factory = session_factory

    try:
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
        yield
    finally:
        await engine.dispose()


app = FastAPI(title="Parcial Programación III", lifespan=lifespan)
app.include_router(health_router, prefix="/health")
app.include_router(editoriales_router)
app.include_router(generos_router)
app.include_router(autores_router)
app.include_router(libros_router)
app.include_router(clientes_router)
app.include_router(ventas_router)


# Tipos de error de Pydantic v2 que produce este backend y sus mensajes en
# español. Los `value_error` (incluidos los `model_validator`) ya traen el
# mensaje propio en español y no se tocan; los tipos sin mapeo caen en un
# mensaje genérico en español en vez de mostrar el texto en inglés.
def _formatear_limite(valor: object) -> str:
    """Muestra un límite de `ctx` como entero cuando es un número entero."""
    if isinstance(valor, bool):
        return str(valor)
    if isinstance(valor, float) and valor.is_integer():
        return str(int(valor))
    return str(valor)


_MENSAJE_VALIDACION_GENERICO = "El valor no es válido."


def _traducir_mensaje_validacion(error: dict) -> str:
    """Traduce el `msg` de un error de validación según su `type` y `ctx`."""
    tipo = error.get("type")
    ctx = error.get("ctx") or {}

    if tipo == "missing":
        return "Falta el campo requerido."
    if tipo == "extra_forbidden":
        return "El campo no está permitido."
    if tipo == "greater_than":
        return f"El valor debe ser mayor que {_formatear_limite(ctx.get('gt'))}."
    if tipo == "greater_than_equal":
        return (
            f"El valor debe ser mayor o igual que {_formatear_limite(ctx.get('ge'))}."
        )
    if tipo == "less_than":
        return f"El valor debe ser menor que {_formatear_limite(ctx.get('lt'))}."
    if tipo == "less_than_equal":
        return (
            f"El valor debe ser menor o igual que {_formatear_limite(ctx.get('le'))}."
        )
    if tipo == "string_too_short":
        return f"El texto debe tener al menos {ctx.get('min_length')} caracteres."
    if tipo == "string_too_long":
        return f"El texto debe tener como máximo {ctx.get('max_length')} caracteres."
    if tipo == "too_short":
        return f"La lista debe tener al menos {ctx.get('min_length')} elemento(s)."
    if tipo == "too_long":
        return f"La lista debe tener como máximo {ctx.get('max_length')} elemento(s)."
    if tipo == "literal_error":
        return f"El valor debe ser uno de: {ctx.get('expected')}."
    if tipo in ("int_parsing", "int_from_float", "int_type"):
        return "El valor debe ser un número entero."
    if tipo in ("decimal_parsing", "decimal_type", "float_parsing", "float_type"):
        return "El valor debe ser un número."
    if tipo in ("bool_parsing", "bool_type"):
        return "El valor debe ser verdadero o falso."
    if tipo in ("string_type", "bytes_type"):
        return "El valor debe ser texto."
    if tipo == "list_type":
        return "El valor debe ser una lista."
    if tipo == "json_invalid":
        return "El cuerpo de la petición no es un JSON válido."
    if tipo == "value_error":
        # El mensaje propio ya viene en español desde nuestros validadores.
        msg = error.get("msg")
        return msg if isinstance(msg, str) else _MENSAJE_VALIDACION_GENERICO
    return _MENSAJE_VALIDACION_GENERICO


@app.exception_handler(RequestValidationError)
async def manejar_error_de_validacion(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Responde `422` con el mismo esquema de FastAPI pero en español.

    Conserva `type`, `loc`, `input` y `ctx` para que los clientes puedan
    seguir discriminando por `type`; solo se traduce `msg`.
    """
    errores = jsonable_encoder(exc.errors())
    for error in errores:
        error["msg"] = _traducir_mensaje_validacion(error)
    return JSONResponse(status_code=422, content={"detail": errores})


@app.exception_handler(ErrorDeDominio)
async def manejar_error_de_dominio(
    request: Request, exc: ErrorDeDominio
) -> JSONResponse:
    """Responde un error de negocio con su código y un mensaje propio.

    El cuerpo es `{"detail": mensaje}` y nunca incluye el texto de la base ni
    una traza: los servicios ya tradujeron el rechazo a un mensaje en español.
    """
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.mensaje})


@app.exception_handler(SQLAlchemyError)
async def manejar_error_de_base(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    """Responde `500` genérico ante una falla de base no traducida.

    Cubre las fallas de lectura o de conexión. Los `IntegrityError` de las
    escrituras ya se convierten en `409` dentro de `app.core.errors.confirmar`.
    """
    return JSONResponse(
        status_code=500,
        content={"detail": "Error interno del servidor."},
    )
