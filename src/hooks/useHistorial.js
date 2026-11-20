import { useState, useCallback } from 'react';
import * as api from '../api/cuestionarios';

/**
 * Lista de cuestionarios del usuario y las acciones sobre ellos.
 * Docente: sus exámenes. Estudiante: los publicados (el backend lo decide por el token).
 * Cada acción recarga la lista, avisa con `notificar` y devuelve true si salió bien.
 */
export function useHistorial({ usuarioId, notificar }) {
  const [lista, setLista] = useState([]);
  const [cargando, setCargando] = useState(false);

  const cargar = useCallback(async () => {
    if (!usuarioId) return;
    setCargando(true);
    try {
      setLista(await api.listarCuestionarios());
    } catch {
      setLista([]);
    } finally {
      setCargando(false);
    }
  }, [usuarioId]); // se recarga si cambia el usuario en sesión

  const ejecutar = async (accion, { exito, tituloError }) => {
    try {
      await accion();
      cargar();
      if (exito) notificar(exito.titulo, exito.mensaje, 'exito');
      return true;
    } catch (err) {
      notificar(tituloError, err.message, 'error');
      return false;
    }
  };

  const publicar = (id) => ejecutar(() => api.publicarCuestionario(id), {
    tituloError: 'No se pudo publicar',
  });

  const despublicar = (id) => ejecutar(() => api.despublicarCuestionario(id), {
    tituloError: 'No se pudo ocultar',
  });

  const eliminar = (id) => ejecutar(() => api.eliminarCuestionario(id), {
    exito: { titulo: 'Examen Eliminado', mensaje: 'El examen fue borrado permanentemente de tu historial.' },
    tituloError: 'No se pudo eliminar el examen',
  });

  const compartir = (id) => ejecutar(() => api.compartirCuestionario(id), {
    exito: { titulo: '¡Examen Compartido!', mensaje: 'Tu evaluación ahora está disponible en el Mercado Comunitario. ¡Gracias por aportar a otros docentes!' },
    tituloError: 'No se pudo compartir en la comunidad',
  });

  const clonar = (cuestionario) => ejecutar(() => api.clonarCuestionario(cuestionario.id), {
    exito: { titulo: '¡Examen Guardado!', mensaje: 'Se ha creado una copia en tu historial personal con el sufijo (Copia). Ya puedes modificarlo libremente.' },
    tituloError: 'Error al clonar',
  });

  return { lista, cargando, cargar, publicar, despublicar, eliminar, compartir, clonar };
}

export default useHistorial;
