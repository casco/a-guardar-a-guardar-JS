'use strict';

/**
 * Modelo de dominio de un objeto categorizable.
 *
 * RESPONSABILIDAD ÚNICA: mantener los datos y el estado de un ítem
 * del juego (¿fue colocado correctamente?).
 *
 * ENCAPSULAMIENTO: el estado interno solo puede modificarse mediante
 * los métodos marcarColocado() y resetear(). Nadie de afuera puede
 * poner #colocado = true directamente.
 *
 * "TELL, DON'T ASK": en lugar de exponer #cuadranteCorrecto para
 * que el llamador compare, ofrecemos el método esCorrectoEn().
 * El llamador le pide al objeto que evalúe la condición, sin
 * necesitar conocer su lógica interna.
 *
 * PARA REFLEXIONAR:
 *  - ¿Por qué el constructor recibe un objeto desestructurado
 *    { id, label, emoji, correct } en vez de 4 parámetros separados?
 *  - ¿Qué ventaja tiene tener colocado como getter de solo lectura
 *    en vez de una propiedad pública?
 */
class Objeto {

  /** @type {string}  */ #id;
  /** @type {string}  */ #etiqueta;
  /** @type {string}  */ #emoji;
  /** @type {string}  */ #cuadranteCorrecto;
  /** @type {boolean} */ #colocado = false;

  /**
   * @param {{ id: string, label: string, emoji: string, correct: string }} datos
   */
  constructor({ id, label, emoji, correct }) {
    this.#id                = id;
    this.#etiqueta          = label;
    this.#emoji             = emoji;
    this.#cuadranteCorrecto = correct;
  }

  // ── Getters públicos (solo lectura) ──────────────────────────────

  /** @returns {string} */
  get id()       { return this.#id; }

  /** @returns {string} */
  get etiqueta() { return this.#etiqueta; }

  /** @returns {string} */
  get emoji()    { return this.#emoji; }

  /** @returns {boolean} True si ya fue colocado en su lugar correcto */
  get colocado() { return this.#colocado; }

  // ── Métodos públicos ─────────────────────────────────────────────

  /**
   * Responde si este objeto pertenece al cuadrante dado.
   * Encapsula la lógica de comparación para que nadie más
   * necesite conocer el campo #cuadranteCorrecto.
   *
   * @param {string} cuadranteId
   * @returns {boolean}
   */
  esCorrectoEn(cuadranteId) {
    return this.#cuadranteCorrecto === cuadranteId;
  }

  /**
   * Marca el objeto como correctamente colocado.
   * Solo debería llamarse una vez y desde Juego.
   */
  marcarColocado() {
    this.#colocado = true;
  }

  /**
   * Vuelve al estado inicial para una nueva partida.
   */
  resetear() {
    this.#colocado = false;
  }
}
