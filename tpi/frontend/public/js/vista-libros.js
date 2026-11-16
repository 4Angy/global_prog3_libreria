/* ============================================================================
   Librería ABC — vista de alta de libros integrada a la API
   Change 04 · Ejercicio 2: alta de libros contra la API

   Responsabilidad: cargar las opciones del formulario (editoriales y géneros)
   desde la API, verificar cada autoría con `GET /autores/{id}`, validar el
   libro con `js/validaciones.js` y enviar el alta a `POST /libros/`.

   La tabla «Libros registrados en esta sesión» vive en memoria: muestra lo
   que devolvió el 201 de cada alta de esta página, no el catálogo completo
   (que está en `index.html`). Los duplicados y las referencias inexistentes
   los decide la API; esta página solo valida formato y rangos.

   Script clásico (no módulo ES): usa las globales `Api`, `formatearPrecio`,
   `TEXTO_SIN_GENERO`, `validarLibro` y `leerStock`, definidas en api.js,
   formato.js y validaciones.js.
   ========================================================================== */

"use strict";

/* Cantidad máxima de opciones que devuelve el listado: la API valida limit
   entre 1 y 100. */
const LIMITE_OPCIONES = 100;

/* Autorías agregadas en este momento: { autorId, nombre, rol }. El orden de
   cada autoría es su posición en la lista: se numera al dibujarla y al enviar. */
let autorias = [];

/* Libros creados en esta sesión, en el orden en que la API los devolvió. */
const librosSesion = [];

/* Las opciones se piden una vez al abrir la página; el alta solo se habilita
   cuando llegaron. */
let opcionesListas = false;

/* Mientras el POST está en vuelo el botón queda deshabilitado. */
let enviando = false;

/* --- Mensajes ---------------------------------------------------------------- */

/* Textos que el marcado ya escribió en los mensajes. Se recuerdan al cargar el
   script para poder agregar el motivo sin perder la frase original. */
const TEXTOS_BASE = {};

["libros-mensaje-error", "libros-autor-mensaje", "mensaje-exito"].forEach((id) => {
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

/** Muestra u oculta el aviso de autorías («falta un autor», «no existe»…). */
function mostrarMensajeAutor(texto) {
  const elemento = document.getElementById("libros-autor-mensaje");
  if (!texto) {
    elemento.hidden = true;
    return;
  }
  elemento.textContent = texto;
  elemento.hidden = false;
}

/* --- Opciones de los selectores ---------------------------------------------- */

/* Vacía un selector de sus opciones y conserva la opción fija del marcado. */
function vaciarSelector(select) {
  const fija = select.querySelector('option[value=""]');
  select.replaceChildren();
  if (fija) {
    select.appendChild(fija);
  }
}

/** Agrega una opción a un selector, con su texto y su valor. */
function agregarOpcion(select, texto, valor) {
  const opcion = document.createElement("option");
  opcion.textContent = texto;
  opcion.value = valor;
  select.appendChild(opcion);
}

/** Llena el selector de editorial con las editoriales de la API. */
function pintarOpcionesEditoriales(editoriales) {
  const select = document.getElementById("libro-editorial");
  vaciarSelector(select);
  editoriales.forEach((editorial) => {
    agregarOpcion(select, editorial.nombre, editorial.id);
  });
}

/** Llena el selector de género con los géneros de la API, después de «Sin
    clasificar». */
function pintarOpcionesGeneros(generos) {
  const select = document.getElementById("libro-genero");
  vaciarSelector(select);
  generos.forEach((genero) => {
    agregarOpcion(select, genero.nombre, genero.id);
  });
}

/** Habilita el botón «Registrar libro» solo si las opciones llegaron y no hay
    un envío en vuelo. */
function actualizarBotonRegistro() {
  const boton = document.getElementById("libros-boton-registrar");
  boton.disabled = !opcionesListas || enviando;
  boton.textContent = enviando ? "Registrando…" : "Registrar libro";
}

/** Oculta y muestra el aviso de error de las opciones, con su botón. */
function mostrarOpcionesError(visible, texto) {
  const elemento = document.getElementById("libros-opciones-error");
  if (visible && texto) {
    document.getElementById("libros-opciones-error-texto").textContent = texto;
  }
  elemento.hidden = !visible;
}

/** Pide editoriales y géneros en paralelo y habilita el alta cuando llegan. */
async function cargarOpciones() {
  mostrarOpcionesError(false);
  opcionesListas = false;
  actualizarBotonRegistro();
  try {
    const [editoriales, generos] = await Promise.all([
      Api.get("/editoriales/", { limit: LIMITE_OPCIONES }),
      Api.get("/generos/", { limit: LIMITE_OPCIONES })
    ]);
    pintarOpcionesEditoriales(Array.isArray(editoriales) ? editoriales : []);
    pintarOpcionesGeneros(Array.isArray(generos) ? generos : []);
    opcionesListas = true;
  } catch (error) {
    const texto =
      error && error.mensaje
        ? error.mensaje
        : "No se pudieron cargar las opciones del formulario.";
    mostrarOpcionesError(true, texto);
    opcionesListas = false;
  } finally {
    actualizarBotonRegistro();
  }
}

/* --- Autorías ------------------------------------------------------------------ */

/** Dibuja la lista de autorías: «orden · nombre · rol · Quitar». */
function pintarAutorias() {
  const lista = document.getElementById("libros-autorias");
  lista.replaceChildren();
  autorias.forEach((autoria, indice) => {
    const item = document.createElement("li");
    const texto = document.createElement("span");
    texto.textContent = indice + 1 + " · " + autoria.nombre + " · " + autoria.rol;
    item.appendChild(texto);
    item.appendChild(document.createTextNode(" "));
    const boton = document.createElement("button");
    boton.type = "button";
    boton.className = "boton boton--secundario";
    boton.textContent = "Quitar";
    boton.dataset.indice = String(indice);
    boton.setAttribute("aria-label", "Quitar a " + autoria.nombre + " de las autorías");
    item.appendChild(boton);
    lista.appendChild(item);
  });
}

/** Verifica el ID con la API y agrega la autoría con el rol elegido. */
async function alBuscarYAgregarAutor() {
  const entrada = document.getElementById("libro-autor-id");
  const rolSelect = document.getElementById("libro-autor-rol");
  const boton = document.getElementById("libros-boton-agregar-autor");

  const textoId = entrada.value.trim();
  if (!/^\d+$/.test(textoId) || Number(textoId) < 1) {
    mostrarMensajeAutor("Ingresá un ID de autor válido.");
    return;
  }
  const id = Number(textoId);
  if (autorias.some((autoria) => autoria.autorId === id)) {
    mostrarMensajeAutor("Ese autor ya está en la lista.");
    return;
  }

  mostrarMensajeAutor("");
  boton.disabled = true;
  try {
    const autor = await Api.get("/autores/" + id);
    autorias.push({
      autorId: autor.id,
      nombre: autor.nombre || "Autor " + id,
      rol: rolSelect.value
    });
    pintarAutorias();
    entrada.value = "";
    entrada.focus();
  } catch (error) {
    if (error && error.estado === 404) {
      mostrarMensajeAutor("No existe un autor con ese ID.");
    } else {
      mostrarMensajeAutor(
        error && error.mensaje
          ? error.mensaje
          : "No se pudo verificar el autor. Intentá de nuevo."
      );
    }
  } finally {
    boton.disabled = false;
  }
}

/** Quita la autoría del renglón pulsado y renumera las restantes. */
function alQuitarAutoria(evento) {
  const objetivo = evento.target;
  if (!objetivo || typeof objetivo.closest !== "function") {
    return;
  }
  const boton = objetivo.closest("button[data-indice]");
  if (!boton || !evento.currentTarget.contains(boton)) {
    return;
  }
  const indice = Number(boton.dataset.indice);
  if (!Number.isInteger(indice)) {
    return;
  }
  autorias.splice(indice, 1);
  pintarAutorias();
  mostrarMensajeAutor("");
}

/* --- Tabla de la sesión -------------------------------------------------------- */

/** Construye una fila con los datos que devolvió el 201. */
function crearFilaLibroSesion(libro) {
  const fila = document.createElement("tr");
  const autores = (Array.isArray(libro.autores) ? libro.autores.slice() : [])
    .sort((a, b) => (a.orden || 0) - (b.orden || 0))
    .map((autoria) => {
      const nombre =
        autoria.autor && autoria.autor.nombre
          ? autoria.autor.nombre
          : "Autor " + (autoria.autor && autoria.autor.id ? autoria.autor.id : "");
      return nombre + " (" + (autoria.rol || "autor") + ")";
    })
    .join(", ");
  const valores = [
    { texto: libro.titulo, atomica: false },
    { texto: libro.isbn, atomica: true },
    { texto: libro.editorial && libro.editorial.nombre ? libro.editorial.nombre : "", atomica: false },
    { texto: libro.genero && libro.genero.nombre ? libro.genero.nombre : TEXTO_SIN_GENERO, atomica: false },
    { texto: autores, atomica: false },
    { texto: formatearPrecio(libro.precio), atomica: true },
    { texto: libro.stock === null || libro.stock === undefined ? "" : String(libro.stock), atomica: true }
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

/** Agrega el libro a la tabla de la sesión y oculta el estado vacío. */
function agregarFilaSesion(libro) {
  librosSesion.push(libro);
  document.getElementById("libros-listado").appendChild(crearFilaLibroSesion(libro));
  document.getElementById("libros-estado-vacio").hidden = true;
}

/* --- Envío del formulario ------------------------------------------------------- */

/** Atiende el envío del alta de libro. */
async function alRegistrarLibro(evento) {
  evento.preventDefault();
  const formulario = evento.currentTarget;
  const mensajeError = document.getElementById("libros-mensaje-error");
  const mensajeExito = document.getElementById("mensaje-exito");
  ocultarMensaje(mensajeError);
  ocultarMensaje(mensajeExito);

  const datos = {
    titulo: document.getElementById("libro-titulo").value,
    isbn: document.getElementById("libro-isbn").value,
    precio: document.getElementById("libro-precio").value,
    stock: document.getElementById("libro-stock").value,
    editorialId: document.getElementById("libro-editorial").value,
    generoId: document.getElementById("libro-genero").value,
    autorIds: autorias.map((autoria) => autoria.autorId)
  };

  if (!opcionesListas) {
    mostrarError(mensajeError, [
      "Las opciones del formulario no están disponibles. Reintentá la carga."
    ]);
    return;
  }

  const resultado = validarLibro(datos);
  if (!resultado.ok) {
    mostrarError(mensajeError, resultado.errores);
    return;
  }

  const cuerpo = {
    titulo: datos.titulo.trim(),
    isbn: datos.isbn.trim(),
    precio: datos.precio.trim().replace(",", "."),
    stock: leerStock(datos.stock),
    editorial_id: Number(datos.editorialId),
    genero_id: datos.generoId === "" ? null : Number(datos.generoId),
    autores: autorias.map((autoria, indice) => ({
      autor_id: autoria.autorId,
      rol: autoria.rol,
      orden: indice + 1
    }))
  };

  enviando = true;
  actualizarBotonRegistro();
  try {
    const libro = await Api.post("/libros/", cuerpo);
    agregarFilaSesion(libro);
    formulario.reset();
    autorias = [];
    pintarAutorias();
    mostrarMensajeAutor("");
    ocultarMensaje(mensajeError);
    mostrarExito(mensajeExito, "Se registró el libro «" + libro.titulo + "».");
  } catch (error) {
    /* 409 (ISBN repetido), 422 (validación) y cualquier otro error: se muestra
       el mensaje del servidor y se conservan los datos cargados. */
    const texto =
      error && error.mensaje ? error.mensaje : "No se pudo registrar el libro.";
    mostrarError(mensajeError, [texto]);
  } finally {
    enviando = false;
    actualizarBotonRegistro();
  }
}

/** Al limpiar el formulario, descarta también las autorías agregadas. */
function alLimpiarFormulario() {
  autorias = [];
  pintarAutorias();
  mostrarMensajeAutor("");
  ocultarMensaje(document.getElementById("libros-mensaje-error"));
  ocultarMensaje(document.getElementById("mensaje-exito"));
}

/* --- Eventos ------------------------------------------------------------------- */

/** Registra los eventos y pide las opciones de los selectores. */
function iniciarVistaLibros() {
  document
    .getElementById("libros-form-alta")
    .addEventListener("submit", alRegistrarLibro);
  document
    .getElementById("libros-form-alta")
    .addEventListener("reset", alLimpiarFormulario);
  document
    .getElementById("libros-boton-agregar-autor")
    .addEventListener("click", alBuscarYAgregarAutor);
  document
    .getElementById("libro-autor-id")
    .addEventListener("keydown", (evento) => {
      if (evento.key === "Enter") {
        evento.preventDefault();
        alBuscarYAgregarAutor();
      }
    });
  document
    .getElementById("libros-autorias")
    .addEventListener("click", alQuitarAutoria);
  document
    .getElementById("libros-boton-reintentar-opciones")
    .addEventListener("click", cargarOpciones);
  cargarOpciones();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciarVistaLibros);
} else {
  iniciarVistaLibros();
}
