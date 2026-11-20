/** Puntos de una pregunta; si no tiene puntuación asignada, vale 1. */
export const puntosDePregunta = (pregunta) => Number(pregunta.puntuacion) || 1;

/**
 * Suma los puntos obtenidos y los puntos totales del examen.
 * @param {Array} preguntas   preguntas_json del examen
 * @param {Object} respuestas { [indicePregunta]: opcionElegida }
 * @returns {{ obtenido: number, total: number }}
 */
export function calcularCalificacion(preguntas, respuestas) {
  let obtenido = 0;
  let total = 0;
  preguntas.forEach((pregunta, indice) => {
    const puntos = puntosDePregunta(pregunta);
    total += puntos;
    if (respuestas[indice] === pregunta.respuesta_correcta) obtenido += puntos;
  });
  return { obtenido, total };
}

/** true si el estudiante respondió todas las preguntas. */
export const todasRespondidas = (preguntas, respuestas) =>
  preguntas.every((_, indice) => respuestas[indice] !== undefined);
