'use strict';

/**
 * Encapsula y valida la configuración externa de la aplicación.
 *
 * RESPONSABILIDAD ÚNICA: ser la única fuente de verdad sobre los
 * datos de configuración y garantizar que son correctos antes de
 * que el resto de la app los use (principio "fail-fast").
 *
 * ENCAPSULAMIENTO: los consumidores acceden a propiedades tipadas
 * a través de getters, no al objeto crudo. Así, si el formato del
 * JSON cambiase, solo habría que tocar esta clase.
 *
 * PARA REFLEXIONAR:
 *  - ¿Qué pasaría si #validar no existiera y un config.js mal
 *    escrito llegara hasta Juego? ¿Dónde fallaría el programa?
 *  - ¿Hay algo que falta validar en #validar?
 */
class Configuracion {

  /** @type {Object} Datos crudos de configuración (APP_CONFIG) */
  #datos;

  /**
   * @param {Object} datos - El objeto APP_CONFIG definido en config.js
   * @throws {Error} Si los datos no cumplen con el formato esperado
   */
  constructor(datos) {
    this.#validar(datos);
    this.#datos = datos;
  }

  // ── Getters públicos ─────────────────────────────────────────────

  /** @returns {string} Título principal de la aplicación */
  get titulo()     { return this.#datos.title; }

  /** @returns {string} Instrucción que se muestra al usuario */
  get subtitulo()  { return this.#datos.subtitle ?? ''; }

  /** @returns {Array<Object>} Lista de definiciones de cuadrantes */
  get cuadrantes() { return this.#datos.quadrants; }

  /** @returns {Array<Object>} Lista de definiciones de objetos */
  get objetos()    { return this.#datos.objects; }

  // ── Privado ──────────────────────────────────────────────────────

  /**
   * Verifica que los datos tengan la estructura mínima esperada.
   * Lanzar excepciones aquí, de forma temprana, evita errores
   * silenciosos o confusos más adelante en la ejecución.
   *
   * @param {Object} datos
   * @throws {Error}
   */
  #validar(datos) {
    if (!datos || typeof datos !== 'object')
      throw new Error('APP_CONFIG no está definido o no es un objeto.');

    if (typeof datos.title !== 'string' || datos.title.trim() === '')
      throw new Error('El campo "title" es obligatorio y debe ser un texto.');

    if (!Array.isArray(datos.quadrants) || datos.quadrants.length !== 4)
      throw new Error('Se esperan exactamente 4 cuadrantes en "quadrants".');

    if (!Array.isArray(datos.objects) || datos.objects.length === 0)
      throw new Error('"objects" debe ser un arreglo con al menos un ítem.');

    // Verificar que cada objeto referencie un cuadrante existente
    const idsValidos = new Set(datos.quadrants.map(q => q.id));
    for (const obj of datos.objects) {
      if (!idsValidos.has(obj.correct)) {
        throw new Error(
          `El objeto "${obj.id}" tiene un cuadrante incorrecto: "${obj.correct}". ` +
          `Valores válidos: ${[...idsValidos].join(', ')}.`
        );
      }
    }
  }
}
