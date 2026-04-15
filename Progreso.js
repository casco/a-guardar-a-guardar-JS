'use strict';

/**
 * Componente de UI que gestiona la barra de progreso.
 *
 * RESPONSABILIDAD ÚNICA: saber cuántos objetos fueron colocados,
 * calcular el porcentaje y actualizar los elementos del DOM.
 *
 * SEPARACIÓN LÓGICA/PRESENTACIÓN: estaCompleto() es lógica pura
 * (no toca el DOM); #renderizar() es presentación pura (no tiene
 * lógica de negocio). Cada cosa en su lugar.
 *
 * PARA REFLEXIONAR:
 *  - ¿Qué pasaría si #renderizar() fuera público?
 *    ¿Alguien podría llamarlo desde afuera con mal momento?
 *  - ¿Es correcto que Progreso busque los elementos del DOM
 *    por ID en su constructor? ¿Qué alternativa habría?
 */
class Progreso {

  /** @type {number}      */ #total;
  /** @type {number}      */ #contador = 0;
  /** @type {HTMLElement} */ #barraEl;
  /** @type {HTMLElement} */ #labelEl;

  /**
   * @param {number} total - Cantidad total de objetos a colocar
   */
  constructor(total) {
    this.#total   = total;
    this.#barraEl = document.getElementById('progress-bar');
    this.#labelEl = document.getElementById('progress-label');
    this.#renderizar();
  }

  // ── API pública ──────────────────────────────────────────────────

  /**
   * Registra un acierto y actualiza la barra.
   */
  incrementar() {
    if (this.#contador < this.#total) {
      this.#contador++;
      this.#renderizar();
    }
  }

  /**
   * @returns {boolean} True cuando todos los objetos fueron colocados
   */
  estaCompleto() {
    return this.#contador >= this.#total;
  }

  /**
   * Vuelve el progreso a cero.
   */
  resetear() {
    this.#contador = 0;
    this.#renderizar();
  }

  // ── Privado ──────────────────────────────────────────────────────

  /**
   * Sincroniza el DOM con el estado interno.
   *
   * Al ser privado garantizamos que el DOM siempre refleja
   * el estado real del objeto: nadie puede actualizar la barra
   * "por las suyas" sin pasar por incrementar() o resetear().
   */
  #renderizar() {
    const porcentaje = this.#total > 0
      ? (this.#contador / this.#total) * 100
      : 0;
    this.#barraEl.style.width = `${porcentaje}%`;
    this.#labelEl.textContent = `${this.#contador} / ${this.#total}`;
  }
}
