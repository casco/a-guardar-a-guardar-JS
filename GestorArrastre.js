'use strict';

/**
 * Coordina todas las interacciones de arrastrar-y-soltar, tanto para
 * dispositivos de escritorio (API nativa drag) como táctiles (touch).
 *
 * RESPONSABILIDADES:
 *  1. Mantener el estado del objeto que está siendo arrastrado.
 *  2. Gestionar el elemento visual flotante ("ghost") en modo touch.
 *  3. Detectar sobre qué cuadrante termina cada gesto.
 *  4. Notificar el resultado mediante el callback onSoltar.
 *
 * POR QUÉ EXISTE ESTA CLASE (separación de responsabilidades):
 *  Sin GestorArrastre, Cuadrante y ObjetoArrastrable necesitarían
 *  conocerse mutuamente para coordinar un drop. Al centralizar aquí
 *  la coordinación, ambas clases permanecen independientes entre sí.
 *
 * DOS FLUJOS INTERNOS:
 *
 *  Desktop (API nativa):
 *    ObjetoArrastrable.dragstart → iniciarArrastre(objeto)
 *    Cuadrante.drop              → procesarSoltarDesktop(cuadranteId)
 *    ObjetoArrastrable.dragend   → finalizarArrastre()
 *
 *  Touch (eventos manuales):
 *    touchstart (en el objeto)   → #iniciarTactil()
 *    touchmove  (en document)    → #onTouchMove()   [mueve el ghost]
 *    touchend   (en document)    → #onTouchEnd()    [detecta cuadrante]
 *    touchcancel (en document)   → #cancelarTactil()
 *
 * PARA REFLEXIONAR:
 *  - ¿Por qué touchmove y touchend se registran en `document`
 *    y no en el elemento del objeto?
 *  - ¿Qué problema resuelve el truco de ocultar el ghost
 *    antes de llamar a elementFromPoint?
 *  - ¿Podrías separar esta clase en dos: GestorDesktop y GestorTactil?
 *    ¿Cuáles serían las ventajas y desventajas?
 */
class GestorArrastre {

  /** @type {Objeto|null}      Objeto en vuelo en modo desktop */
  #objetoDesktop = null;

  /** @type {Objeto|null}      Objeto en vuelo en modo táctil */
  #objetoTactil  = null;

  /** @type {HTMLElement|null} Elemento visual flotante (touch) */
  #ghostTactil   = null;

  /** @type {{ w: number, h: number }} Mitad del tamaño del ghost */
  #ghostMitad    = { w: 0, h: 0 };

  /**
   * Callback invocado cada vez que un objeto termina sobre un cuadrante.
   * @type {function(string, Objeto): void}
   */
  #onSoltar;

  /**
   * @param {function(string, Objeto): void} onSoltar
   *   Recibe (cuadranteId, objeto) al completarse un gesto de drop.
   */
  constructor(onSoltar) {
    this.#onSoltar = onSoltar;
    this.#registrarEventosTouchGlobales();
  }

  // ── API para modo desktop ────────────────────────────────────────

  /**
   * Registra el objeto que el usuario comenzó a arrastrar.
   * Llamado por ObjetoArrastrable en el evento dragstart.
   * @param {Objeto} objeto
   */
  iniciarArrastre(objeto) {
    this.#objetoDesktop = objeto;
  }

  /**
   * Limpia el objeto en vuelo al terminar el gesto.
   * Llamado por ObjetoArrastrable en el evento dragend.
   */
  finalizarArrastre() {
    this.#objetoDesktop = null;
  }

  /**
   * Procesa un drop desktop usando el objeto registrado en #objetoDesktop.
   * Llamado por Cuadrante cuando recibe el evento 'drop'.
   * @param {string} cuadranteId
   */
  procesarSoltarDesktop(cuadranteId) {
    if (this.#objetoDesktop) {
      this.#onSoltar(cuadranteId, this.#objetoDesktop);
    }
  }

  // ── API para modo táctil ─────────────────────────────────────────

  /**
   * Registra el evento touchstart en el elemento de un ObjetoArrastrable.
   * Cuando el usuario toca el elemento, comienza el gesto táctil.
   *
   * @param {HTMLElement} elemento - Elemento DOM del ObjetoArrastrable
   * @param {Objeto}      objeto   - Modelo de datos asociado
   */
  registrarObjetoTactil(elemento, objeto) {
    elemento.addEventListener('touchstart', e => {
      e.preventDefault(); // evita que el toque active el scroll de la página

      const touch = e.touches[0];
      const rect  = elemento.getBoundingClientRect();

      this.#objetoTactil = objeto;
      this.#ghostMitad   = { w: rect.width / 2, h: rect.height / 2 };

      this.#crearGhost(elemento, touch.clientX, touch.clientY);
      elemento.classList.add('dragging');
    }, { passive: false }); // passive:false es necesario para poder llamar preventDefault()
  }

  // ── Privado ──────────────────────────────────────────────────────

  /**
   * Registra en el documento los manejadores globales de touch.
   * Son globales porque touchmove/touchend pueden dispararse
   * en cualquier parte de la pantalla, no solo sobre el elemento origen.
   */
  #registrarEventosTouchGlobales() {
    document.addEventListener('touchmove',   e => this.#onTouchMove(e),  { passive: false });
    document.addEventListener('touchend',    e => this.#onTouchEnd(e));
    document.addEventListener('touchcancel', () => this.#cancelarTactil());
  }

  /**
   * Crea el elemento visual flotante que sigue al dedo del usuario.
   *
   * @param {HTMLElement} plantilla - Elemento cuyo contenido se clona
   * @param {number} cx - Coordenada X del toque
   * @param {number} cy - Coordenada Y del toque
   */
  #crearGhost(plantilla, cx, cy) {
    this.#ghostTactil           = document.createElement('div');
    this.#ghostTactil.className = 'touch-ghost';
    this.#ghostTactil.innerHTML = plantilla.innerHTML;
    document.body.appendChild(this.#ghostTactil);
    this.#posicionarGhost(cx, cy);
  }

  /**
   * Mueve el ghost centrado bajo el dedo.
   * @param {number} cx
   * @param {number} cy
   */
  #posicionarGhost(cx, cy) {
    if (!this.#ghostTactil) return;
    this.#ghostTactil.style.left = `${cx - this.#ghostMitad.w}px`;
    this.#ghostTactil.style.top  = `${cy - this.#ghostMitad.h}px`;
  }

  /**
   * Devuelve el elemento .quadrant ubicado en las coordenadas dadas.
   *
   * El ghost se oculta temporalmente porque tiene pointer-events:none,
   * pero aun así ocupa espacio visual y puede confundir a elementFromPoint
   * en algunos navegadores.
   *
   * @param {number} x
   * @param {number} y
   * @returns {HTMLElement|null}
   */
  #cuadranteEnPunto(x, y) {
    if (this.#ghostTactil) this.#ghostTactil.style.display = 'none';
    const el = document.elementFromPoint(x, y);
    if (this.#ghostTactil) this.#ghostTactil.style.display = '';
    return el?.closest('.quadrant') ?? null;
  }

  /**
   * Mueve el ghost y resalta el cuadrante bajo el dedo.
   * @param {TouchEvent} e
   */
  #onTouchMove(e) {
    if (!this.#objetoTactil) return;
    e.preventDefault();

    const touch = e.touches[0];
    this.#posicionarGhost(touch.clientX, touch.clientY);

    document.querySelectorAll('.quadrant').forEach(q => q.classList.remove('drag-over'));
    const qEl = this.#cuadranteEnPunto(touch.clientX, touch.clientY);
    if (qEl) qEl.classList.add('drag-over');
  }

  /**
   * Determina sobre qué cuadrante terminó el gesto e invoca onSoltar.
   * @param {TouchEvent} e
   */
  #onTouchEnd(e) {
    if (!this.#objetoTactil) return;

    const touch  = e.changedTouches[0];
    const objeto = this.#objetoTactil; // guardar referencia antes de cancelar

    this.#cancelarTactil(); // limpia el estado táctil (y pone #objetoTactil = null)

    const qEl = this.#cuadranteEnPunto(touch.clientX, touch.clientY);
    if (qEl) {
      const cuadranteId = qEl.id.replace('quadrant-', '');
      this.#onSoltar(cuadranteId, objeto);
    }
  }

  /**
   * Limpia todo el estado táctil: ghost, clases CSS y variables internas.
   * Se llama en touchend y en touchcancel (ej. llamada entrante que interrumpe el gesto).
   */
  #cancelarTactil() {
    if (this.#ghostTactil) {
      this.#ghostTactil.remove();
      this.#ghostTactil = null;
    }

    document.querySelectorAll('.quadrant').forEach(q => q.classList.remove('drag-over'));

    if (this.#objetoTactil) {
      // El elemento puede ya no existir si el drop fue correcto
      // y Juego lo eliminó antes de que llegara este cleanup.
      const el = document.querySelector(`[data-id="${this.#objetoTactil.id}"]`);
      if (el) el.classList.remove('dragging');
      this.#objetoTactil = null;
    }
  }
}
