'use strict';

/**
 * Representa un cuadrante destino en la grilla del juego.
 *
 * RESPONSABILIDADES:
 *  1. Crear y gestionar su propio elemento DOM.
 *  2. Registrar los eventos de drag-and-drop del navegador.
 *  3. Mostrar los chips de objetos colocados correctamente.
 *  4. Ejecutar animaciones de feedback visual (éxito / error).
 *
 * LO QUE ESTA CLASE NO HACE (separación de responsabilidades):
 *  Cuadrante NO decide si un drop es correcto o no. Cuando detecta
 *  un drop, simplemente avisa a Juego a través del callback onSoltar.
 *  La decisión de "correcto/incorrecto" le corresponde a Juego.
 *
 * PARA REFLEXIONAR:
 *  - ¿Por qué recibir onSoltar como callback en vez de tener
 *    una referencia directa a Juego?
 *  - El método #flash fuerza un "reflow" con `void el.offsetWidth`.
 *    ¿Por qué es necesario? ¿Qué pasa si lo quitás?
 */
class Cuadrante {

  /** @type {string}      */ #id;
  /** @type {HTMLElement} */ #elemento;
  /** @type {HTMLElement} */ #contenedorItems;

  /**
   * @param {{ id: string, label: string, emoji: string, color: string }} datos
   * @param {function(string): void} onSoltar
   *   Callback invocado cuando un objeto es soltado sobre este cuadrante.
   *   Recibe el id del cuadrante como argumento.
   */
  constructor(datos, onSoltar) {
    this.#id              = datos.id;
    this.#elemento        = this.#crearElemento(datos);
    this.#contenedorItems = this.#elemento.querySelector('.quadrant-items');
    this.#registrarEventosDrop(onSoltar);
  }

  // ── Getters públicos ─────────────────────────────────────────────

  /** @returns {string} */
  get id()       { return this.#id; }

  /** @returns {HTMLElement} Elemento raíz, listo para insertar en el DOM */
  get elemento() { return this.#elemento; }

  // ── API pública ──────────────────────────────────────────────────

  /**
   * Agrega el chip visual de un objeto correctamente colocado.
   * @param {Objeto} objeto
   */
  agregarObjeto(objeto) {
    const chip = document.createElement('div');
    chip.className = 'placed-item';
    chip.innerHTML = `
      <span class="placed-item-emoji">${objeto.emoji}</span>
      <span>${objeto.etiqueta}</span>
    `;
    this.#contenedorItems.appendChild(chip);
  }

  /** Destello verde: indica que el drop fue correcto. */
  flashExito() { this.#flash('flash-success'); }

  /** Sacudida roja: indica que el drop fue incorrecto. */
  flashError() { this.#flash('flash-error'); }

  /** Elimina todos los chips de objetos colocados (para reiniciar). */
  limpiar() {
    this.#contenedorItems.innerHTML = '';
  }

  // ── Privado ──────────────────────────────────────────────────────

  /**
   * Construye el elemento DOM del cuadrante.
   * Separar la construcción del HTML en un método privado
   * mantiene el constructor limpio y fácil de leer.
   *
   * @param {{ label: string, emoji: string, color: string }} datos
   * @returns {HTMLElement}
   */
  #crearElemento({ label, emoji, color }) {
    const el = document.createElement('div');
    el.className        = 'quadrant';
    el.id               = `quadrant-${this.#id}`;
    el.style.background = color;
    el.style.boxShadow  = `0 6px 20px ${color}55`;

    el.innerHTML = `
      <div class="quadrant-header">
        <span class="quadrant-emoji">${emoji}</span>
        <span class="quadrant-label">${label}</span>
      </div>
      <div class="quadrant-items"></div>
    `;
    return el;
  }

  /**
   * Registra los tres eventos de la API de drag-and-drop del navegador
   * necesarios para ser una zona de "drop" válida.
   *
   * @param {function(string): void} onSoltar
   */
  #registrarEventosDrop(onSoltar) {
    // dragover: se dispara mientras el objeto está encima.
    // El preventDefault() es OBLIGATORIO para habilitar el drop.
    // Sin él, el navegador rechaza el gesto.
    this.#elemento.addEventListener('dragover', e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      this.#elemento.classList.add('drag-over');
    });

    // dragleave: se dispara al salir del cuadrante.
    // La verificación de relatedTarget evita quitar el estilo cuando
    // el cursor pasa sobre un elemento hijo del cuadrante (ej. el label).
    this.#elemento.addEventListener('dragleave', e => {
      if (!this.#elemento.contains(e.relatedTarget)) {
        this.#elemento.classList.remove('drag-over');
      }
    });

    // drop: el usuario soltó el objeto aquí.
    // Solo notificamos; quien decide qué hacer es Juego.
    this.#elemento.addEventListener('drop', e => {
      e.preventDefault();
      this.#elemento.classList.remove('drag-over');
      onSoltar(this.#id);
    });
  }

  /**
   * Aplica una clase CSS de animación y la elimina al terminar.
   *
   * El truco con `void el.offsetWidth` (forzar reflow) reinicia
   * la animación CSS aunque la clase ya estuviese aplicada, porque
   * obliga al navegador a recalcular el layout entre la remoción
   * y la nueva adición de la clase.
   *
   * @param {string} clase - Nombre de la clase CSS de animación
   */
  #flash(clase) {
    this.#elemento.classList.remove(clase);
    void this.#elemento.offsetWidth; // forzar reflow del navegador
    this.#elemento.classList.add(clase);
    setTimeout(() => this.#elemento.classList.remove(clase), 500);
  }
}
