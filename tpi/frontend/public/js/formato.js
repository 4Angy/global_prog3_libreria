/* ============================================================================
   Librería ABC — formato compartido entre vistas
   Change 02 · Ejercicio 1: catálogo integrado a la API

   Responsabilidad: reunir los textos y formatos que usan varias páginas, para
   que cada vista no los redefina. La API serializa `precio` como texto decimal
   ("24500.00"), así que `formatearPrecio` acepta tanto números como ese texto.

   Debe cargarse antes que las vistas que lo usan: vista-catalogo.js,
   vista-libros.js, vista-clientes.js, vista-ventas.js y vista-historial.js.

   Script clásico (no módulo ES): las globales `formatearPrecio` y
   `TEXTO_SIN_GENERO` quedan disponibles para los demás scripts de la página.
   ========================================================================== */

"use strict";

/* Texto que se muestra cuando el libro no tiene género asignado. */
const TEXTO_SIN_GENERO = "Sin clasificar";

/** Presenta un importe con dos decimales y formato local, en pesos. */
function formatearPrecio(valor) {
  const numero = typeof valor === "string" ? Number(valor) : valor;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS"
  }).format(numero);
}
