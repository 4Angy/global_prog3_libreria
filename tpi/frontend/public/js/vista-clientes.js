/* ============================================================================
   Librería ABC — vista de alta de clientes integrada a la API
   Change 05 · Ejercicio 4: alta de clientes contra la API y búsqueda por ID

   Responsabilidad: validar el formulario con `js/validaciones.js`, enviar el
   alta a `POST /clientes/` y buscar clientes con `GET /clientes/{id}` — la API
   no tiene un listado de clientes.

   La tabla «Clientes registrados en esta sesión» vive en memoria: muestra lo
   que devolvió el 201 de cada alta de esta página. El email repetido lo decide
   la API (409); esta página solo valida el nombre y el formato del email.

   Script clásico (no módulo ES): usa las globales `Api`, `normalizarEmail` y
   `validarCliente`, definidas en api.js y validaciones.js.
   ========================================================================== */

"use strict";

/* Clientes creados en esta sesión, en el orden en que la API los devolvió. */
const clientesSesion = [];

/* Mientras el POST está en vuelo el botón queda deshabilitado. */
let enviando = false;

/* --- Mensajes ---------------------------------------------------------------- */

/* Textos que el marcado ya escribió en los mensajes. Se recuerdan al cargar el
   script para poder agregar el motivo sin perder la frase original. */
const TEXTOS_BASE = {};

["clientes-mensaje-error", "mensaje-exito"].forEach((id) => {
  const elemento = document.getElementById(id);
  if (elemento) {
    TEXTOS_BASE[id] = elemento.textContent.trim();
  }
});

/** Devuelve el texto que el marcado ya escribía en un mensaje. */
function textoBase(elemento) {
  if (!(elemento.id in TEXTOS_BASE)) {
    TEXTOS_BASE[elemento.id] = elemento.textContent.trim();
  }
  return TEXTOS_BASE[elemento.id];
}

/** Muestra un mensaje de error junto al formulario, con los motivos. */
function mostrarError(elemento, motivos) {
  const base = textoBase(elemento);
  elemento.textContent = motivos.length > 0 ? base + " " + motivos.join(" ") : base;
  elemento.hidden = false;
}

/** Muestra un mensaje de operación correcta junto al formulario. */
function mostrarExito(elemento, detalle) {
  const base = textoBase(elemento);
  elemento.textContent = detalle ? base + " " + detalle : base;
  elemento.hidden = false;
}

/** Vuelve a ocultar un mensaje. */
function ocultarMensaje(elemento) {
  elemento.hidden = true;
}

/** Muestra u oculta el aviso de error de la búsqueda, con el motivo. */
function mostrarErrorBusqueda(motivo) {
  const elemento = document.getElementById("clientes-busqueda-error");
  if (!motivo) {
    elemento.hidden = true;
    return;
  }
  elemento.textContent = motivo;
  elemento.hidden = false;
}

/* --- Tabla de la sesión -------------------------------------------------------- */

/** Construye una fila con los datos que devolvió el 201. */
function crearFilaClienteSesion(cliente) {
  const fila = document.createElement("tr");
  const valores = [
    { texto: String(cliente.id), atomica: true },
    { texto: cliente.nombre, atomica: false },
    { texto: cliente.email, atomica: false }
  ];
  valores.forEach((valor) => {
    const celda = document.createElement("td");
    if (valor.atomica) {
      celda.classList.add("celda-atomica");
    }
    celda.textContent = valor.texto;
    fila.appendChild(celda);
  });
  return fila;
}

/** Agrega el cliente a la tabla de la sesión y oculta el estado vacío. */
function agregarFilaSesion(cliente) {
  clientesSesion.push(cliente);
  document.getElementById("clientes-listado").appendChild(crearFilaClienteSesion(cliente));
  document.getElementById("clientes-estado-vacio").hidden = true;
}

/** Muestra el estado vacío cuando todavía no se registró ningún cliente. */
function actualizarEstadoVacio() {
  document.getElementById("clientes-estado-vacio").hidden = clientesSesion.length > 0;
}

/* --- Envío del alta ------------------------------------------------------------ */

/** Habilita el botón «Registrar cliente» solo si no hay un envío en vuelo. */
function actualizarBotonRegistro() {
  const boton = document.getElementById("clientes-boton-registrar");
  boton.disabled = enviando;
  boton.textContent = enviando ? "Registrando…" : "Registrar cliente";
}

/** Atiende el envío del alta de cliente. */
async function alRegistrarCliente(evento) {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  const mensajeError = document.getElementById("clientes-mensaje-error");
  const mensajeExito = document.getElementById("mensaje-exito");
  ocultarMensaje(mensajeError);
  ocultarMensaje(mensajeExito);

  const datos = {
    nombre: document.getElementById("cliente-nombre").value,
    email: document.getElementById("cliente-email").value
  };

  const resultado = validarCliente(datos);
  if (!resultado.ok) {
    mostrarError(mensajeError, resultado.errores);
    return;
  }

  const cuerpo = {
    nombre: datos.nombre.trim(),
    email: normalizarEmail(datos.email)
  };

  enviando = true;
  actualizarBotonRegistro();
  try {
    const cliente = await Api.post("/clientes/", cuerpo);
    agregarFilaSesion(cliente);
    formulario.reset();
    ocultarMensaje(mensajeError);
    mostrarExito(
      mensajeExito,
      "Se registró el cliente «" + cliente.nombre + "» con el ID " + cliente.id + "."
    );
  } catch (error) {
    /* 409 (email repetido), 422 (validación) y cualquier otro error: se muestra
       el mensaje del servidor y se conservan los datos cargados. */
    const texto =
      error && error.mensaje ? error.mensaje : "No se pudo registrar el cliente.";
    mostrarError(mensajeError, [texto]);
  } finally {
    enviando = false;
    actualizarBotonRegistro();
  }
}

/** Al limpiar el formulario, descarta los mensajes pendientes. */
function alLimpiarFormulario() {
  ocultarMensaje(document.getElementById("clientes-mensaje-error"));
  ocultarMensaje(document.getElementById("mensaje-exito"));
}

/* --- Búsqueda por ID ------------------------------------------------------------- */

/** Oculta el resultado de la búsqueda anterior. */
function ocultarResultadoBusqueda() {
  document.getElementById("clientes-busqueda-resultado").hidden = true;
}

/** Atiende el envío del formulario de búsqueda por ID. */
async function alBuscarCliente(evento) {
  evento.preventDefault();
  const mensajeError = document.getElementById("clientes-busqueda-error");
  const resultado = document.getElementById("clientes-busqueda-resultado");
  mostrarErrorBusqueda("");
  ocultarResultadoBusqueda();

  const textoId = document.getElementById("cliente-buscar-id").value.trim();
  if (!/^\d+$/.test(textoId) || Number(textoId) < 1) {
    mostrarErrorBusqueda("Ingresá un ID de cliente válido.");
    return;
  }
  const id = Number(textoId);

  const boton = document.getElementById("clientes-boton-buscar");
  boton.disabled = true;
  try {
    const cliente = await Api.get("/clientes/" + id);
    document.getElementById("clientes-busqueda-id").textContent = String(cliente.id);
    document.getElementById("clientes-busqueda-nombre").textContent = cliente.nombre;
    document.getElementById("clientes-busqueda-email").textContent = cliente.email;
    resultado.hidden = false;
  } catch (error) {
    if (error && error.estado === 404) {
      mostrarErrorBusqueda("El cliente no existe.");
    } else {
      const texto =
        error && error.mensaje
          ? error.mensaje
          : "No se pudo buscar el cliente. Intentá de nuevo.";
      mostrarErrorBusqueda(texto);
    }
  } finally {
    boton.disabled = false;
  }
}

/* --- Eventos ------------------------------------------------------------------- */

/** Registra los eventos de la página. */
function iniciarVistaClientes() {
  document
    .getElementById("clientes-form-alta")
    .addEventListener("submit", alRegistrarCliente);
  document
    .getElementById("clientes-form-alta")
    .addEventListener("reset", alLimpiarFormulario);
  document
    .getElementById("clientes-form-buscar")
    .addEventListener("submit", alBuscarCliente);
  actualizarBotonRegistro();
  actualizarEstadoVacio();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarVistaClientes);
} else {
  iniciarVistaClientes();
}
