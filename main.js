'use strict';

/**
 * Punto de entrada de la aplicación.
 *
 * RESPONSABILIDAD ÚNICA: esperar a que el DOM esté listo,
 * construir la configuración y arrancar el juego.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO:
 *  Al separar el punto de entrada de las demás clases, el resto
 *  del código es independiente del entorno de ejecución (browser,
 *  tests, etc.) y no depende del momento en que carga el DOM.
 *  Juego, Cuadrante, etc. no saben que se están ejecutando en un
 *  navegador con un DOMContentLoaded — eso es responsabilidad de main.
 *
 * PARA REFLEXIONAR:
 *  - ¿Por qué se usa window.addEventListener y no document.addEventListener?
 *  - ¿Qué ocurre si APP_CONFIG no fue definido (olvidaste cargar config.js)?
 *    Seguí el flujo de error hasta Configuracion.js.
 *  - ¿Cómo cambiarías este archivo para poder pasar la config
 *    como parámetro en la URL (ej. ?tema=supermercado)?
 */
window.addEventListener('DOMContentLoaded', () => {
  try {
    const config = new Configuracion(APP_CONFIG);
    const juego  = new Juego(config);
    juego.iniciar();
  } catch (error) {
    // Mostrar el error al usuario de forma legible
    document.body.innerHTML = `
      <div style="
        padding: 2rem;
        font-family: sans-serif;
        color: #b71c1c;
        background: #fff3f3;
        border-left: 4px solid #b71c1c;
        margin: 2rem;
        border-radius: 8px;
      ">
        <strong>Error de configuración</strong>
        <p style="margin-top: 0.5rem">${error.message}</p>
      </div>
    `;
    // Re-lanzar para que el error también aparezca en la consola del navegador
    throw error;
  }
});
