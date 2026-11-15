/* ============================================================================
   Librería ABC — cliente HTTP de la API
   Change 01 · Ejercicio 1: catálogo y cliente HTTP

   Responsabilidad: ser el único lugar del frontend que llama a `fetch`. Las
   vistas usan `Api.get`, `Api.post` y `Api.patch`, y reciben el JSON del
   cuerpo o un `ErrorApi` con el estado, el mensaje y si el problema fue de
   conexión.

   Todas las peticiones van al mismo origen que sirve las páginas, con el
   prefijo `/api` que Nginx reenvía al backend. `API_BASE` es el único lugar
   donde se define esa base: ninguna vista arma URLs de la API.

   Script clásico (no módulo ES): los `import` no se usan en el proyecto, y
   las globales `Api`, `ErrorApi` y `API_BASE` quedan disponibles para los
   demás scripts de la página.
   ========================================================================== */

"use strict";

/* --- Configuración --------------------------------------------------------- */

/* Prefijo de todas las peticiones. La ruta del backend se concatena tal cual:
   "/libros/" viaja como "/api/libros/" y "/libros/7" como "/api/libros/7". */
const API_BASE = "/api";

/* Texto que se muestra cuando la petición no llegó a tener respuesta: la red
   falló o el servidor cerró la conexión antes de contestar. */
const MENSAJE_SIN_CONEXION =
  "No se pudo conectar con el servidor. Revisá la conexión e intentá de nuevo.";

/* Mensajes para los estados que no traen un texto legible en el cuerpo, como
   el HTML con el que un proxy responde 502 cuando el backend está apagado. */
const MENSAJES_POR_ESTADO = {
  400: "La solicitud no es válida.",
  404: "El recurso solicitado no existe.",
  409: "La operación entra en conflicto con los datos existentes.",
  422: "Los datos enviados no son válidos.",
  500: "El servidor tuvo un error interno.",
  502: "El servidor no está disponible en este momento.",
  503: "El servidor no está disponible en este momento.",
  504: "El servidor no respondió a tiempo."
};

/* --- El error de la API ---------------------------------------------------- */

/**
 * Error uniforme del cliente HTTP.
 *
 * `estado` es el código HTTP de la respuesta, o 0 si no hubo respuesta.
 * `mensaje` es el texto que la vista puede mostrar tal cual.
 * `esConexion` distingue una caída de red de un error contestado por el
 * servidor, para que la vista pueda sugerir revisar la conexión.
 */
class ErrorApi extends Error {
  constructor(estado, mensaje, esConexion) {
    super(mensaje);
    this.name = "ErrorApi";
    this.estado = estado;
    this.mensaje = mensaje;
    this.esConexion = esConexion;
  }
}

/* --- Armado de la URL ------------------------------------------------------ */

/**
 * Arma el query string de los parámetros.
 * Los valores `null`, `undefined` y `""` no se envían; el resto se codifica
 * con `URLSearchParams`, que escapa los caracteres especiales (incluido `&`).
 * Devuelve "" cuando no queda ningún parámetro.
 */
function armarConsulta(params) {
  if (!params) {
    return "";
  }
  const consulta = new URLSearchParams();
  Object.keys(params).forEach((clave) => {
    const valor = params[clave];
    if (valor === null || valor === undefined || valor === "") {
      return;
    }
    consulta.append(clave, valor);
  });
  return consulta.toString();
}

/**
 * Arma la URL de la petición: `API_BASE` más la ruta tal cual, y el query
 * string cuando hay parámetros con valor.
 */
function armarUrl(ruta, params) {
  const consulta = armarConsulta(params);
  if (consulta === "") {
    return API_BASE + ruta;
  }
  return API_BASE + ruta + "?" + consulta;
}

/* --- Interpretación de la respuesta ---------------------------------------- */

/** Quita el prefijo que Pydantic agrega a los mensajes de validación. */
function quitarPrefijoDeValidacion(mensaje) {
  const prefijo = "Value error, ";
  if (mensaje.startsWith(prefijo)) {
    return mensaje.slice(prefijo.length);
  }
  return mensaje;
}

/**
 * Extrae el mensaje legible del cuerpo de error.
 * El backend responde `{"detail": "texto"}` en los errores de dominio y
 * `{"detail": [{"msg": ...}, ...]}` en los de validación (422). Si el cuerpo
 * no es JSON o no trae un mensaje, se usa un texto genérico por estado: nunca
 * se muestra el cuerpo crudo, que puede ser el HTML de un proxy.
 */
function mensajeDeError(cuerpo, estado) {
  const detalle = cuerpo && typeof cuerpo === "object" ? cuerpo.detail : undefined;
  if (typeof detalle === "string" && detalle.trim() !== "") {
    return detalle;
  }
  if (Array.isArray(detalle)) {
    const mensajes = detalle
      .map((elemento) => {
        if (elemento && typeof elemento.msg === "string") {
          return quitarPrefijoDeValidacion(elemento.msg).trim();
        }
        return "";
      })
      .filter((mensaje) => mensaje !== "");
    if (mensajes.length > 0) {
      return mensajes.join(" ");
    }
  }
  return mensajeGenerico(estado);
}

/** Devuelve el texto genérico del estado, o uno con el código si no hay uno
    específico. */
function mensajeGenerico(estado) {
  const conocido = MENSAJES_POR_ESTADO[estado];
  if (conocido) {
    return conocido;
  }
  return "La operación falló con el código " + estado + ".";
}

/* --- La petición ----------------------------------------------------------- */

/**
 * Ejecuta una petición y devuelve el JSON de la respuesta exitosa.
 * Rechaza con `ErrorApi` ante una respuesta no 2xx o ante un fallo de red.
 * Una respuesta 2xx sin cuerpo (204) devuelve `null`.
 */
async function pedir(metodo, ruta, cuerpo, params) {
  const opciones = {
    method: metodo,
    headers: { Accept: "application/json" }
  };
  if (cuerpo !== undefined) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(cuerpo);
  }

  let respuesta;
  try {
    respuesta = await fetch(armarUrl(ruta, params), opciones);
  } catch (error) {
    throw new ErrorApi(0, MENSAJE_SIN_CONEXION, true);
  }

  let texto;
  try {
    texto = await respuesta.text();
  } catch (error) {
    throw new ErrorApi(0, MENSAJE_SIN_CONEXION, true);
  }

  let datos = null;
  if (texto !== "") {
    try {
      datos = JSON.parse(texto);
    } catch (error) {
      datos = null;
    }
  }

  if (respuesta.ok) {
    return datos;
  }
  throw new ErrorApi(respuesta.status, mensajeDeError(datos, respuesta.status), false);
}

/* --- La API pública -------------------------------------------------------- */

const Api = {
  /** Pide una ruta con GET y parámetros de consulta opcionales. */
  get(ruta, params) {
    return pedir("GET", ruta, undefined, params);
  },

  /** Envía un cuerpo JSON con POST. */
  post(ruta, cuerpo) {
    return pedir("POST", ruta, cuerpo);
  },

  /** Envía un cuerpo JSON con PATCH. */
  patch(ruta, cuerpo) {
    return pedir("PATCH", ruta, cuerpo);
  }
};
