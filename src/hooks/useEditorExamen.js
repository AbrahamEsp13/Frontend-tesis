import { useState } from 'react';
import * as api from '../api/cuestionarios';

const nuevaPregunta = () => ({
  pregunta: 'Nueva pregunta...',
  opciones: ['Opción 1', 'Opción 2', 'Opción 3', 'Opción 4'],
  respuesta_correcta: 'Opción 1',
  justificacion_pedagogica: '...',
  puntuacion: 1,
});

/**
 * Examen abierto (vista previa / edición del docente o intento del estudiante).
 * Trabaja sobre una COPIA del registro: los cambios sin guardar no afectan al historial.
 * Todas las actualizaciones son inmutables.
 */
export function useEditorExamen({ notificar, onGuardado }) {
  const [examen, setExamen] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const abrir = (registro) => {
    setExamen(structuredClone(registro));
    setModoEdicion(false);
  };

  const cerrar = () => {
    setExamen(null);
    setModoEdicion(false);
  };

  const cambiarPreguntas = (transformar) =>
    setExamen((ex) => ({ ...ex, preguntas_json: transformar(ex.preguntas_json) }));

  const actualizarPregunta = (indice, campo, valor) =>
    cambiarPreguntas((preguntas) => preguntas.map((p, i) => (i === indice ? { ...p, [campo]: valor } : p)));

  // Si se edita el texto de la opción correcta, la respuesta correcta se actualiza con ella
  // (antes quedaba apuntando al texto viejo y ninguna opción contaba como correcta).
  const actualizarOpcion = (indicePregunta, indiceOpcion, valor) =>
    cambiarPreguntas((preguntas) => preguntas.map((p, i) => {
      if (i !== indicePregunta) return p;
      const textoAnterior = p.opciones[indiceOpcion];
      return {
        ...p,
        opciones: p.opciones.map((op, j) => (j === indiceOpcion ? valor : op)),
        respuesta_correcta: p.respuesta_correcta === textoAnterior ? valor : p.respuesta_correcta,
      };
    }));

  const agregarPregunta = () => cambiarPreguntas((preguntas) => [...preguntas, nuevaPregunta()]);

  const eliminarPregunta = (indice) => cambiarPreguntas((preguntas) => preguntas.filter((_, i) => i !== indice));

  const guardar = async () => {
    try {
      await api.actualizarPreguntas(examen.id, examen.preguntas_json);
      notificar('¡Cambios Guardados!', 'El examen se ha actualizado correctamente.', 'exito');
      setModoEdicion(false);
      onGuardado?.();
    } catch (err) {
      notificar('Error al Guardar', err.message, 'error');
    }
  };

  return {
    examen, modoEdicion, setModoEdicion,
    abrir, cerrar,
    actualizarPregunta, actualizarOpcion, agregarPregunta, eliminarPregunta, guardar,
  };
}

export default useEditorExamen;
