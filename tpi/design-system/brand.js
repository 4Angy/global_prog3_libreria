/* Nombre de la marca en un único lugar para las vistas previas locales. */
const NOMBRE_MARCA = "Librería ABC";

document.querySelectorAll("[data-brand-name]").forEach(function (nodo) {
  nodo.textContent = NOMBRE_MARCA;
});
