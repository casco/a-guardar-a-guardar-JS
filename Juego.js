'use strict';

/**
 * Orquestador principal de la aplicación.
 *
 * RESPONSABILIDADES:
 *  1. Coordinar la creación y el ciclo de vida de todos los componentes.
 *  2. Contener la lógica central: evaluar si un drop es correcto.
 *  3. Controlar el flujo: inicio → juego → completado → reinicio.
 *
 * PATRÓN APLICADO — Orquestador / Controlador:
 *  Juego actúa como el "director de orquesta". No sabe cómo se
 *  dibuja un cuadrante, ni cómo funciona el arrastre táctil; delega
 *  eso a las clases especializadas y reacciona a sus notificaciones
 *  (callbacks). Esto es el principio de inversión de dependencias
 *  en su forma más simple: las clases de bajo nivel (Cuadrante,
 *  GestorArrastre) dependen de abstracciones (callbacks), no de Juego.
 *
 * COMUNICACIÓN ENTRE CLASES:
 *
 *  Juego crea GestorArrastre pasando #manejarSoltar como callback.
 *  Juego crea cada Cuadrante    pasando gestor.procesarSoltarDesktop.
 *  Juego crea cada ObjetoArrastrable pasando gestor.iniciarArrastre.
 *
 *  El flujo completo de un drop desktop es:
 *    dragstart → ObjetoArrastrable → gestor.iniciarArrastre()
 *    drop      → Cuadrante         → gestor.procesarSoltarDesktop()
 *                                  → Juego.#manejarSoltar()
 *    dragend   → ObjetoArrastrable → gestor.finalizarArrastre()
 *
 * PARA REFLEXIONAR:
 *  - ¿Por qué #renderizarCuadrantes() solo se llama en iniciar()
 *    y no también en reiniciar()?
 *  - ¿Qué ventaja tiene guardar los Objeto en #objetos en vez de
 *    crearlos de nuevo en cada reiniciar()?
 *  - ¿Habría algún beneficio en separar #procesarAcierto y
 *    #procesarError en una clase aparte tipo "Árbitro"?
 */
class Juego {

  /** @type {Configuracion}              */ #config;
  /** @type {GestorArrastre}             */ #gestor;
  /** @type {Progreso}                   */ #progreso;

  /** @type {Objeto[]} Lista completa de objetos del juego */
  #objetos = [];

  /** @type {Map<string, Cuadrante>}         id → Cuadrante */
  #cuadrantes   = new Map();

  /** @type {Map<string, ObjetoArrastrable>} id → ObjetoArrastrable en pantalla */
  #arrastrables = new Map();

  /**
   * @param {Configuracion} config
   */
  constructor(config) {
    this.#config = config;
  }

  // ── Ciclo de vida público ────────────────────────────────────────

  /**
   * Inicializa y arranca el juego por primera vez.
   * Debe llamarse una sola vez, después de que el DOM esté listo.
   */
  iniciar() {
    this.#actualizarEncabezado();

    // Crear los modelos de objetos. Se guardan en #objetos
    // para poder resetearlos en reiniciar() sin recrearlos.
    this.#objetos = this.#config.objetos.map(datos => new Objeto(datos));

    // El GestorArrastre notificará a Juego cada vez que ocurra un drop.
    this.#gestor = new GestorArrastre(
      (cuadranteId, objeto) => this.#manejarSoltar(cuadranteId, objeto)
    );

    this.#progreso = new Progreso(this.#objetos.length);

    // Los cuadrantes solo se renderizan una vez:
    // el layout de la grilla no cambia entre partidas.
    this.#renderizarCuadrantes();
    this.#renderizarObjetos();

    document.getElementById('restart-btn')
      .addEventListener('click', () => this.reiniciar());
  }

  /**
   * Reinicia el juego: resetea el estado de los objetos y
   * vuelve a dibujar el panel de objetos desde cero.
   */
  reiniciar() {
    this.#objetos.forEach(o => o.resetear());
    this.#cuadrantes.forEach(c => c.limpiar());
    this.#progreso.resetear();
    document.getElementById('overlay').classList.add('hidden');

    // Solo re-renderizamos los objetos; los cuadrantes ya están en el DOM.
    this.#renderizarObjetos();
  }

  // ── Privado: renderización ───────────────────────────────────────

  /**
   * Actualiza el título de la página y del encabezado.
   */
  #actualizarEncabezado() {
    document.title = this.#config.titulo;
    document.getElementById('app-title').textContent    = this.#config.titulo;
    document.getElementById('app-subtitle').textContent = this.#config.subtitulo;
  }

  /**
   * Crea los cuadrantes y los inserta en la grilla del DOM.
   * Cada cuadrante recibe un callback que apunta a procesarSoltarDesktop
   * del gestor, para que el flujo desktop esté conectado.
   */
  #renderizarCuadrantes() {
    const grid = document.getElementById('quadrant-grid');
    grid.innerHTML = '';
    this.#cuadrantes.clear();

    this.#config.cuadrantes.forEach(datos => {
      const cuadrante = new Cuadrante(
        datos,
        (cuadranteId) => this.#gestor.procesarSoltarDesktop(cuadranteId)
      );
      this.#cuadrantes.set(cuadrante.id, cuadrante);
      grid.appendChild(cuadrante.elemento);
    });
  }

  /**
   * Crea los ObjetoArrastrable para los objetos no colocados
   * e inserta sus elementos en el panel.
   * Se llama al iniciar y también al reiniciar.
   */
  #renderizarObjetos() {
    const lista = document.getElementById('objects-list');
    lista.innerHTML = '';
    this.#arrastrables.clear();

    this.#objetos
      .filter(o => !o.colocado)
      .forEach(objeto => {
        const arrastrable = new ObjetoArrastrable(
          objeto,
          (obj) => this.#gestor.iniciarArrastre(obj),
          ()    => this.#gestor.finalizarArrastre()
        );

        // Registrar el soporte táctil en el gestor centralizado
        this.#gestor.registrarObjetoTactil(arrastrable.elemento, objeto);

        this.#arrastrables.set(objeto.id, arrastrable);
        lista.appendChild(arrastrable.elemento);
      });
  }

  // ── Privado: lógica del juego ────────────────────────────────────

  /**
   * Punto central de decisión: ¿es correcto el drop?
   *
   * Este es el ÚNICO lugar donde se evalúa correcto/incorrecto,
   * lo que facilita modificar las reglas del juego sin tocar
   * ninguna otra clase.
   *
   * @param {string} cuadranteId - ID del cuadrante donde se soltó
   * @param {Objeto} objeto       - Objeto que fue soltado
   */
  #manejarSoltar(cuadranteId, objeto) {
    const cuadrante   = this.#cuadrantes.get(cuadranteId);
    const arrastrable = this.#arrastrables.get(objeto.id);

    // Guardia: si alguno no existe (por ej. drop duplicado), no hacer nada
    if (!cuadrante || !arrastrable) return;

    if (objeto.esCorrectoEn(cuadranteId)) {
      this.#procesarAcierto(cuadrante, arrastrable, objeto);
    } else {
      this.#procesarError(cuadrante, arrastrable);
    }
  }

  /**
   * Consecuencias de una respuesta correcta:
   * actualizar modelo, vistas y progreso.
   *
   * @param {Cuadrante}         cuadrante
   * @param {ObjetoArrastrable} arrastrable
   * @param {Objeto}            objeto
   */
  #procesarAcierto(cuadrante, arrastrable, objeto) {
    // 1. Actualizar el modelo
    objeto.marcarColocado();

    // 2. Actualizar las vistas
    cuadrante.agregarObjeto(objeto);
    cuadrante.flashExito();
    arrastrable.remover();
    this.#arrastrables.delete(objeto.id);

    // 3. Actualizar el progreso
    this.#progreso.incrementar();

    if (this.#progreso.estaCompleto()) {
      setTimeout(() => this.#mostrarCompletado(), 700);
    }
  }

  /**
   * Consecuencias de una respuesta incorrecta: solo feedback visual.
   * El objeto permanece en el panel para que el usuario lo intente de nuevo.
   *
   * @param {Cuadrante}         cuadrante
   * @param {ObjetoArrastrable} arrastrable
   */
  #procesarError(cuadrante, arrastrable) {
    cuadrante.flashError();
    arrastrable.sacudir();
  }

  /**
   * Muestra el overlay de felicitaciones al completar el juego.
   */
  #mostrarCompletado() {
    document.getElementById('overlay').classList.remove('hidden');
  }
}
