'use strict';

/**
 * Vista de un objeto categorizable en el panel de arrastre.
 *
 * RESPONSABILIDADES:
 *  1. Crear y gestionar su propio elemento DOM.
 *  2. Registrar los eventos de drag desktop (dragstart, dragend).
 *  3. Exponer métodos de feedback visual: sacudir(), remover().
 *
 * LO QUE ESTA CLASE NO HACE:
 *  - No registra eventos touch (eso lo centraliza GestorArrastre).
 *  - No sabe si el drop fue correcto o no.
 *  - No conoce a Juego ni a los cuadrantes.
 *
 * RELACIÓN CON Objeto:
 *  ObjetoArrastrable es la VISTA; Objeto es el MODELO.
 *  Esta separación (patrón MVC simplificado) permite que el modelo
 *  exista y tenga estado aunque el elemento DOM haya sido eliminado.
 *
 * PARA REFLEXIONAR:
 *  - ¿Por qué marcarArrastrando() usa classList.toggle en vez de
 *    classList.add / classList.remove por separado?
 *  - ¿Qué ventaja tiene que el elemento tenga dataset.id?
 */
class ObjetoArrastrable {

  /** @type {Objeto}      */ #objeto;
  /** @type {HTMLElement} */ #elemento;

  /**
   * @param {Objeto} objeto - El modelo de datos asociado
   * @param {function(Objeto): void} onIniciarArrastre
   *   Callback invocado cuando comienza el arrastre (evento dragstart).
   * @param {function(): void} onFinalizarArrastre
   *   Callback invocado cuando termina el arrastre (evento dragend),
   *   haya habido drop exitoso o no.
   */
  constructor(objeto, onIniciarArrastre, onFinalizarArrastre) {
    this.#objeto   = objeto;
    this.#elemento = this.#crearElemento();
    this.#registrarEventosDrag(onIniciarArrastre, onFinalizarArrastre);
  }

  // ── Getters públicos ─────────────────────────────────────────────

  /** @returns {Objeto} El modelo de datos asociado a esta vista */
  get objeto()   { return this.#objeto; }

  /** @returns {HTMLElement} Elemento raíz, listo para insertar en el DOM */
  get elemento() { return this.#elemento; }

  // ── API pública ──────────────────────────────────────────────────

  /**
   * Elimina el elemento del DOM.
   * Se llama desde Juego cuando el objeto fue colocado correctamente.
   */
  remover() {
    this.#elemento.remove();
  }

  /**
   * Aplica una animación de sacudida para señalar un error.
   * El reflow forzado permite reiniciar la animación si ya estaba activa.
   */
  sacudir() {
    this.#elemento.classList.remove('shake');
    void this.#elemento.offsetWidth; // forzar reflow
    this.#elemento.classList.add('shake');
    setTimeout(() => this.#elemento.classList.remove('shake'), 400);
  }

  /**
   * Activa o desactiva la apariencia visual de "en arrastre".
   * Llamado por GestorArrastre en el modo touch, y por los
   * manejadores internos de drag en modo desktop.
   *
   * @param {boolean} activo
   */
  marcarArrastrando(activo) {
    this.#elemento.classList.toggle('dragging', activo);
  }

  // ── Privado ──────────────────────────────────────────────────────

  /**
   * Construye el elemento DOM del objeto arrastrable.
   * @returns {HTMLElement}
   */
  #crearElemento() {
    const el = document.createElement('div');
    el.className  = 'object-item';
    el.id         = `object-${this.#objeto.id}`;
    el.draggable  = true;
    // dataset.id es usado por GestorArrastre para localizar
    // este elemento en el DOM durante el gesto táctil.
    el.dataset.id = this.#objeto.id;

    el.innerHTML = `
      <span class="object-emoji">${this.#objeto.emoji}</span>
      <span class="object-label">${this.#objeto.etiqueta}</span>
    `;
    return el;
  }

  /**
   * Registra los eventos de la API nativa de drag-and-drop.
   *
   * @param {function(Objeto): void} onIniciar
   * @param {function(): void}       onFinalizar
   */
  #registrarEventosDrag(onIniciar, onFinalizar) {
    this.#elemento.addEventListener('dragstart', e => {
      e.dataTransfer.effectAllowed = 'move';
      // Firefox requiere al menos una llamada a setData()
      // para que el drag funcione correctamente.
      e.dataTransfer.setData('text/plain', this.#objeto.id);
      this.marcarArrastrando(true);
      onIniciar(this.#objeto);
    });

    this.#elemento.addEventListener('dragend', () => {
      this.marcarArrastrando(false);
      onFinalizar();
    });
  }
}
