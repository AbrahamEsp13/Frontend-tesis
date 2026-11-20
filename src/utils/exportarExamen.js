import { puntosDePregunta } from './calificar';

/** Arma el texto de la clave del examen (preguntas, opciones, respuesta, puntos y retroalimentación). */
export function textoDelExamen(registro) {
  const titulo = registro.nombre_examen || registro.nombre_documento;
  let contenido = `📝 EXAMEN: ${titulo}\nGenerado por QuizAI\n========================\n\n`;
  registro.preguntas_json.forEach((p, indice) => {
    contenido += `${indice + 1}. ${p.pregunta}\n`;
    p.opciones.forEach((op) => { contenido += `   [  ] ${op}\n`; });
    contenido += `\n   ✅ CLAVE: ${p.respuesta_correcta}\n   💎 Valor: ${puntosDePregunta(p)} puntos\n   💡 Retroalimentación: ${p.justificacion_pedagogica}\n------------------------\n\n`;
  });
  return contenido;
}

/** Descarga la clave del examen como archivo .txt. */
export function exportarExamen(registro) {
  const titulo = registro.nombre_examen || registro.nombre_documento;
  const blob = new Blob([textoDelExamen(registro)], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = `Clave_${titulo}.txt`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}
